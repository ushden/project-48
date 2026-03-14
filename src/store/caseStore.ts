import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'expo-crypto';

import {
  CaseData,
  CaseHubProgress,
  CaseHubProgressStatus,
  CaseHubType,
  LogEntry,
  LogImportance,
  LogType,
  TutorialStep
} from '../types/case';
import {casesData, casesMeta} from '../data';
import {CaseOutcome, resolveCaseOutcome} from '../engine/caseCore';
import {CaseRuntimeState, HypothesisBoard} from '../types/investigation';

const STORAGE_KEY = 'detective_game_save_v1';

export const tutorialMessages: Record<TutorialStep, string> = {
  0: 'Welcome. Start by reviewing the available evidence.',
  1: 'Good. Some evidence unlocks new leads when examined.',
  2: 'Interviews can reveal new information.',
  3: 'Try connecting evidence on the investigation board.',
  4: 'Make a deduction when you feel confident.',
  5: ''
};

type CaseState = {
  case: CaseData | null;
  activeCaseId: string | null;

  lastOutcome: CaseOutcome | null;

  runtime: CaseRuntimeState;

  systemMessage: string;

  caseHub: CaseHubType;

  deductionState: {
    attemptsLeft: number;
  };

  log: LogEntry[];
  hasUnreadLogEntries: boolean;

  casesProgress: Record<string, {
    completed: boolean;
    rating?: string;
    endingId?: string;
    completedAt?: number;
  }>;

  timeLeft: number;
  timerStatus: 'running' | 'stopped';

  hintsUsed: number;
  tutorial: {enabled: boolean; step: TutorialStep};

  // SYSTEM
  setSystemMessage: (msg: string) => void;
  flags: Record<string, boolean>;

  // CASE
  loadCase: (caseId: string) => CaseData | undefined;
  addLog: (type: LogType, text: string, importance?: LogImportance) => void
  completeActiveCase: () => void
  submitDeduction: (deductionId: string) => CaseOutcome
  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) => void;

  // GAME
  loadGame: () => void;
  resetGame: () => Promise<void>;
  saveGame: () => Promise<void>;

  // MARKS
  markEvidenceUnlock: (id: string) => void
  markScenePoint: (sceneId: string, pointId: string) => void;
  markMessageRead: (messageId: string) => void;
  markDialogueSeen: (dialogueId: string) => void;
  markPuzzleSolved: (puzzleId: string) => void;
  markLogAsRead: () => void;

  // TIMER
  startTimer: () => void;
  spendTime: (amount: number) => void;

  // TUTORIAL
  advanceTutorial: (step: TutorialStep) => void;
  finishTutorial: () => void;

  // FLAGS
  hasFlag: (key: string) => boolean;
  setFlag: (key: string) => void;

  // BOARD
  setActiveHypothesis: (id: string) => void;
  toggleEvidenceOnSection: (sectionId: string, evidenceId: string) => void;
  isBoardValidFor: (id: string) => boolean;
};

const serializeState = (state: CaseState) => ({
  casesProgress: state.casesProgress,
  activeCaseId: state.activeCaseId,
  deductionState: state.deductionState,
  log: state.log,
  flags: state.flags,
  caseHub: state.caseHub,
  tutorial: state.tutorial,
  hintsUsed: state.hintsUsed,
  timeLeft: state.timeLeft,
  timerStatus: state.timerStatus,
  hasUnreadLogEntries: state.hasUnreadLogEntries,
  runtime: {
    board: state.runtime.board,
    investigation: {
      evidence: Array.from(state.runtime.investigation.evidence),
      readMessages: Array.from(state.runtime.investigation.readMessages),
      seenDialogues: Array.from(state.runtime.investigation.seenDialogues),
      solvedPuzzles: Array.from(state.runtime.investigation.solvedPuzzles),
      discoveredPoints: Object.fromEntries(
        Object.entries(state.runtime.investigation.discoveredPoints).map(
          ([sceneId, points]) => [sceneId, Array.from(points)]
        )
      )
    }
  }

});

const hydrateState = (data: CaseState): Partial<CaseState> => ({
  casesProgress: data.casesProgress ?? {},
  activeCaseId: data.activeCaseId ?? null,
  runtime: {
    board: data.runtime.board ?? {activeHypothesisId: null, hypotheses: {}},
    investigation: {
      evidence: new Set(data.runtime.investigation?.evidence ?? []),
      readMessages: new Set(data.runtime.investigation.readMessages ?? []),
      seenDialogues: new Set(data.runtime.investigation.seenDialogues ?? []),
      solvedPuzzles: new Set(data.runtime.investigation.solvedPuzzles ?? []),
      discoveredPoints: Object.fromEntries(
        Object.entries(data.runtime.investigation.discoveredPoints).map(
          ([sceneId, points]) => [sceneId, new Set(points ?? [])]
        )
      )
    }
  },
  deductionState: data.deductionState ?? {
    attemptsLeft: 3
  },
  log: data.log ?? [],
  tutorial: data.tutorial ?? {
    enabled: true,
    step: 0
  },
  flags: data.flags ?? {},
  caseHub: data.caseHub ?? {},
  hintsUsed: data.hintsUsed ?? 0,
  timeLeft: data.timeLeft ?? 0,
  timerStatus: data.timerStatus ?? 'stopped',
  hasUnreadLogEntries: data.hasUnreadLogEntries ?? false
});

const initialState: Partial<CaseState> = {
  case: null,
  lastOutcome: null,

  systemMessage: '',

  runtime: {
    investigation: {
      discoveredPoints: {},
      evidence: new Set<string>(),
      readMessages: new Set<string>(),
      seenDialogues: new Set<string>(),
      solvedPuzzles: new Set<string>()
    },
    board: {
      hypotheses: {},
      activeHypothesisId: ''
    }
  },

  deductionState: {
    attemptsLeft: 3
  },
  log: [],
  casesProgress: {},
  activeCaseId: null,

  timeLeft: 0,
  timerStatus: 'stopped',
  hintsUsed: 0,
  tutorial: {
    enabled: true,
    step: 0
  },
  hasUnreadLogEntries: false,
  caseHub: {} as CaseHubType,

  flags: {}
};

export const useCaseStore = create<CaseState>((set, get) => ({
  ...initialState as CaseState,

  setSystemMessage: (msg: string) => set(() => ({
    systemMessage: msg
  })),

  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) =>
    set(state => ({
      caseHub: {
        ...state.caseHub,
        [key]: status
      }
    })),

  markMessageRead: (messageId) => set(state => {
    const existing = state.runtime.investigation.readMessages ?? new Set<string>();

    if (existing.has(messageId)) return state;

    const newSet = new Set(existing);
    newSet.add(messageId);

    return {
      runtime: {
        ...state.runtime,
        investigation: {
          ...state.runtime.investigation,
          readMessages: newSet
        }
      }
    };
  }),
  markDialogueSeen: (dialogueId) => set(state => {
    const existing = state.runtime.investigation.seenDialogues ?? new Set<string>();

    if (existing.has(dialogueId)) return state;

    const newSet = new Set(existing);
    newSet.add(dialogueId);

    return {
      runtime: {
        ...state.runtime,
        investigation: {
          ...state.runtime.investigation,
          seenDialogues: newSet
        }
      }
    };
  }),
  markPuzzleSolved: (puzzleId) => set(state => {
    const existing = state.runtime.investigation.solvedPuzzles ?? new Set<string>();

    if (existing.has(puzzleId)) return state;

    const newSet = new Set(existing);
    newSet.add(puzzleId);

    return {
      runtime: {
        ...state.runtime,
        investigation: {
          ...state.runtime.investigation,
          solvedPuzzles: newSet
        }
      }
    };
  }),
  markScenePoint: (sceneId, pointId) => set(state => {
    const existing = state.runtime.investigation.discoveredPoints[sceneId] ?? new Set<string>();

    if (existing.has(pointId)) return state;

    const newSet = new Set(existing);
    newSet.add(pointId);

    return {
      runtime: {
        ...state.runtime,
        investigation: {
          ...state.runtime.investigation,
          discoveredPoints: {
            ...state.runtime.investigation.discoveredPoints,
            [sceneId]: newSet
          }
        }
      }
    };
  }),
  markEvidenceUnlock: (evidenceId: string) => set(state => {
    if (state.runtime.investigation.evidence.has(evidenceId)) return state;

    const evidence = state.case?.evidence?.[evidenceId];

    if (!evidence) return state;

    const newSet = new Set(state.runtime.investigation?.evidence ?? []);
    newSet.add(evidenceId);

    state.addLog(
      'evidence',
      `${evidence.title}: ${evidence.description}`,
      'normal'
    );

    return {
      runtime: {
        ...state.runtime,
        investigation: {
          ...state.runtime.investigation,
          evidence: newSet
        }
      }
    };
  }),

  hasFlag: (key) => Boolean(get().flags[key]),
  setFlag: (key) => set(state => ({
    flags: {...state.flags, [key]: true}
  })),
  markLogAsRead: () => {
    set({hasUnreadLogEntries: false});
  },

  advanceTutorial: (step: TutorialStep) => set(state => ({
    tutorial: {
      ...state.tutorial,
      step
    }
  })),
  finishTutorial: () => set({
    tutorial: {
      enabled: false,
      step: 5
    }
  }),

  spendTime: (amount: number) => set(state => {
    if (state.timerStatus !== 'running') return state;

    const newTime = Math.max(0, state.timeLeft - amount);

    return {
      timeLeft: newTime,
      timerStatus: newTime === 0 ? 'stopped' : state.timerStatus
    };
  }),
  startTimer: () => {
    if (get().timerStatus === 'running') return;

    set({timerStatus: 'running'});

    const interval = setInterval(() => {
      const state = get();

      if (state.timerStatus !== 'running') {
        clearInterval(interval);
        return;
      }

      if (state.timeLeft <= 1) {
        clearInterval(interval);

        set({
          timeLeft: 0,
          timerStatus: 'stopped',
          lastOutcome: null,
        });

        state.addLog(
          'system',
          'Час вичерпано. Слідство було змушене завершити.'
        );

        return;
      }

      set({timeLeft: state.timeLeft - 1});
    }, 1000);
  },

  resetGame: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({...initialState});
    console.log('RESETED GAME');
  },
  saveGame: async () => {
    const state = get();
    const data = serializeState(state);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  },
  loadGame: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) return;

    const data = JSON.parse(raw) as CaseState;
    const savedState = hydrateState(data);

    if (savedState.activeCaseId) {
      savedState.case = casesData[savedState.activeCaseId];
    } else {
      const [firstCase] = casesMeta;

      savedState.case = casesData[firstCase.id];
    }

    set(state => ({
      ...state,
      ...savedState
    }));
  },

  loadCase: (caseId: string): CaseData | undefined => {
    const caseData = casesData[caseId];

    if (!caseData) return;

    const boardLayout = caseData.boardLayout;
    const deductions = caseData.deductions;
    const hypotheses = deductions.reduce<Record<string, HypothesisBoard>>((acc, deduction) => {
      if (!acc[deduction.id]) {
        acc[deduction.id] = {sections: {}};
      }

      acc[deduction.id].sections = boardLayout.reduce<Record<string, string[]>>((a, section) => {
        a[section.id] = [];

        return a;
      }, {});

      return acc;
    }, {});

    set({
      case: caseData,
      activeCaseId: caseId,

      caseHub: caseData.caseHub,

      runtime: {
        investigation: {
          discoveredPoints: {},
          evidence: new Set<string>(),
          readMessages: new Set<string>(),
          seenDialogues: new Set<string>(),
          solvedPuzzles: new Set<string>()
        },
        board: {
          hypotheses,
          activeHypothesisId: caseData.deductions[0].id,
        }
      },

      deductionState: {
        attemptsLeft: caseData.attempts || 1
      },

      timeLeft: caseData.timeLimit,
      timerStatus: 'stopped',

      hintsUsed: 0
    });

    return caseData;
  },
  completeActiveCase: () => {
    set(state => {
      if (!state.activeCaseId || !state.lastOutcome)
        return state;

      const caseId = state.activeCaseId;

      return {
        activeCaseId: null,
        casesProgress: {
          ...state.casesProgress,
          [caseId]: {
            completed: true,
            rating: state.lastOutcome.ratingGrade,
            endingId: state.lastOutcome.endingId,
            completedAt: Date.now()
          }
        }
      };
    });
  },

  submitDeduction: (deductionId): CaseOutcome => {
    const state = get();
    if (!state.case) return {resultType: 'failed'} as CaseOutcome;

    const outcome = resolveCaseOutcome(
      state.case,
      {
        investigation: state.runtime.investigation,
        board: state.runtime.board,
        attemptsLeft: state.deductionState.attemptsLeft
      },
      deductionId
    );

    const attemptsLeft =
      outcome.resultType === 'failed'
        ? Math.max(0, state.deductionState.attemptsLeft - 1)
        : state.deductionState.attemptsLeft;

    set({
      lastOutcome: outcome,
      deductionState: {
        attemptsLeft
      }
    });

    return outcome;
  },

  addLog: (type: LogType, text: string, importance?: LogImportance) =>
    set(state => ({
      hasUnreadLogEntries: true,
      log: [
        {
          id: crypto.randomUUID(),
          type,
          text,
          timestamp: Date.now(),
          importance: importance ?? 'normal'
        },
        ...state.log
      ]
    })),

  // BOARD
  setActiveHypothesis: (id: string) => set(state => ({
    runtime: {
      ...state.runtime,
      board: {
        ...state.runtime.board,
        activeHypothesisId: id
      }
    }
  })),
  toggleEvidenceOnSection(sectionId: string, evidenceId: string) {
    set(state => {
      const {activeHypothesisId, hypotheses} = state.runtime.board;

      if (!activeHypothesisId) {
        return state;
      }

      const section = hypotheses[activeHypothesisId]?.sections?.[sectionId] || [];

      const isExist = section?.includes(evidenceId);
      const updatedEvidences = isExist ?
        section.filter(e => e !== evidenceId) :
        [...section, evidenceId];

      return {
        runtime: {
          ...state.runtime,
          board: {
            ...state.runtime.board,
            hypotheses: {
              ...state.runtime.board.hypotheses,
              [activeHypothesisId]: {
                sections: {
                  ...state.runtime.board.hypotheses[activeHypothesisId]?.sections || {},
                  [sectionId]: updatedEvidences
                }
              }
            }
          }
        }
      };
    });
  },
  isBoardValidFor(id: string) {
    const {runtime, case: caseData} = get();
    const layout = caseData?.boardLayout;

    if (!layout) return false;

    const hypothesis = runtime.board.hypotheses[id];

    return layout.every(section => {
      const placed = hypothesis.sections[section.id] || [];

      return section.requiredEvidence.every(e =>
        placed.includes(e)
      );
    });
  }
}));

useCaseStore.subscribe(
  async (state: CaseState) => {
    const currentStorage = await AsyncStorage.getItem(STORAGE_KEY);
    const nextStorage = JSON.stringify(serializeState(state));

    if (currentStorage === nextStorage) {
      console.log('SKIPPED SAVE');

      return;
    }

    await AsyncStorage.setItem(STORAGE_KEY, nextStorage);
    console.log('SAVED');
  }
);

