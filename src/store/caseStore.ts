import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'expo-crypto';

import {
  BoardState,
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
import {InvestigationState} from '../types/investigation';

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

  systemMessage: string;

  caseHub: CaseHubType;

  deductionState: {
    attemptsLeft: number;
  };

  investigation: InvestigationState;

  log: LogEntry[];
  logFlags: Record<string, boolean>;
  hasUnreadLogEntries: boolean;

  casesProgress: Record<string, {
    completed: boolean;
    rating?: string;
    endingId?: string;
    completedAt?: number;
  }>;

  board: BoardState;

  timeLeft: number;
  timerStatus: 'running' | 'stopped';

  hintsUsed: number;
  tutorial: {enabled: boolean; step: TutorialStep};

  // SYSTEM
  setSystemMessage: (msg: string) => void;

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
  hasLogFlag: (key: string) => boolean;
  setLogFlag: (key: string) => void;

  // BOARD
  setActiveHypothesis: (id: string) => void;
  toggleEvidenceForActiveHypothesis: (evidenceId: string) => void;
  isBoardValidFor: (id: string) => boolean;
};

const serializeState = (state: CaseState) => ({
  casesProgress: state.casesProgress,
  activeCaseId: state.activeCaseId,
  deductionState: state.deductionState,
  log: state.log,
  logFlags: state.logFlags,
  caseHub: state.caseHub,
  board: state.board,
  tutorial: state.tutorial,
  hintsUsed: state.hintsUsed,
  timeLeft: state.timeLeft,
  timerStatus: state.timerStatus,
  hasUnreadLogEntries: state.hasUnreadLogEntries,
  investigation: {
    evidence: Array.from(state.investigation.evidence),
    readMessages: Array.from(state.investigation.readMessages),
    seenDialogues: Array.from(state.investigation.seenDialogues),
    solvedPuzzles: Array.from(state.investigation.solvedPuzzles),
    discoveredPoints: Object.fromEntries(
      Object.entries(state.investigation.discoveredPoints).map(
        ([sceneId, points]) => [sceneId, Array.from(points)]
      )
    )
  }
});

const hydrateState = (data: CaseState): Partial<CaseState> => ({
  casesProgress: data.casesProgress ?? {},
  activeCaseId: data.activeCaseId ?? null,
  investigation: {
    evidence: new Set(data.investigation?.evidence ?? []),
    readMessages: new Set(data.investigation.readMessages ?? []),
    seenDialogues: new Set(data.investigation.seenDialogues ?? []),
    solvedPuzzles: new Set(data.investigation.solvedPuzzles ?? []),
    discoveredPoints: Object.fromEntries(
      Object.entries(data.investigation.discoveredPoints).map(
        ([sceneId, points]) => [sceneId, new Set(points ?? [])]
      )
    )
  },
  deductionState: data.deductionState ?? {
    attemptsLeft: 3
  },
  log: data.log ?? [],
  board: data.board ?? {activeHypothesisId: null, hypotheses: {}},
  tutorial: data.tutorial ?? {
    enabled: true,
    step: 0
  },
  logFlags: data.logFlags ?? {},
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

  investigation: {
    discoveredPoints: {},
    evidence: new Set<string>(),
    readMessages: new Set<string>(),
    seenDialogues: new Set<string>(),
    solvedPuzzles: new Set<string>()
  },

  deductionState: {
    attemptsLeft: 3
  },
  log: [],
  casesProgress: {},
  activeCaseId: null,
  board: {
    hypotheses: {},
    activeHypothesisId: null
  },
  timeLeft: 0,
  timerStatus: 'stopped',
  hintsUsed: 0,
  tutorial: {
    enabled: true,
    step: 0
  },
  hasUnreadLogEntries: false,
  caseHub: {} as CaseHubType,

  logFlags: {},
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
    const existing = state.investigation.readMessages ?? new Set<string>();

    if (existing.has(messageId)) return state;

    const newSet = new Set(existing);
    newSet.add(messageId);

    return {
      investigation: {
        ...state.investigation,
        readMessages: newSet
      }
    };
  }),
  markDialogueSeen: (dialogueId) => set(state => {
    const existing = state.investigation.seenDialogues ?? new Set<string>();

    if (existing.has(dialogueId)) return state;

    const newSet = new Set(existing);
    newSet.add(dialogueId);

    return {
      investigation: {
        ...state.investigation,
        seenDialogues: newSet
      }
    };
  }),
  markPuzzleSolved: (puzzleId) => set(state => {
    const existing = state.investigation.solvedPuzzles ?? new Set<string>();

    if (existing.has(puzzleId)) return state;

    const newSet = new Set(existing);
    newSet.add(puzzleId);

    return {
      investigation: {
        ...state.investigation,
        solvedPuzzles: newSet
      }
    };
  }),
  markScenePoint: (sceneId, pointId) => set(state => {
    const existing = state.investigation.discoveredPoints[sceneId] ?? new Set<string>();

    if (existing.has(pointId)) return state;

    const newSet = new Set(existing);
    newSet.add(pointId);

    return {
      investigation: {
        ...state.investigation,
        discoveredPoints: {
          ...state.investigation.discoveredPoints,
          [sceneId]: newSet
        }
      }
    };
  }),
  markEvidenceUnlock: (evidenceId: string) => set(state => {
    if (state.investigation.evidence.has(evidenceId)) return state;

    const evidence = state.case?.evidence?.[evidenceId];

    if (!evidence) return state;

    const newSet = new Set(state.investigation?.evidence ?? []);
    newSet.add(evidenceId);

    state.addLog(
      'evidence',
      `${evidence.title}: ${evidence.description}`,
      'normal'
    );

    return {
      investigation: {
        ...state.investigation,
        evidence: newSet
      }
    };
  }),

  hasLogFlag: (key) => Boolean(get().logFlags[key]),
  setLogFlag: (key) =>
    set(state => ({
      logFlags: {...state.logFlags, [key]: true}
    })),
  markLogAsRead: () => {
    set({hasUnreadLogEntries: false});
  },

  advanceTutorial: (step: TutorialStep) =>
    set(state => ({
      tutorial: {
        ...state.tutorial,
        step
      }
    })),
  finishTutorial: () =>
    set({
      tutorial: {
        enabled: false,
        step: 5
      }
    }),

  spendTime: (amount: number) =>
    set(state => {
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
          lastOutcome: {
            resultType: 'failed',
            ratingScore: 0,
            ratingGrade: 'F',
            linkScore: 0
          }
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

    set({
      case: caseData,
      activeCaseId: caseId,

      caseHub: caseData.caseHub,

      investigation: {
        discoveredPoints: {},
        evidence: new Set<string>(),
        readMessages: new Set<string>(),
        seenDialogues: new Set<string>(),
        solvedPuzzles: new Set<string>()
      },

      deductionState: {
        attemptsLeft: caseData.attempts || 1
      },

      board: {
        hypotheses: {},
        activeHypothesisId: null
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
        investigation: state.investigation,
        board: state.board,
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
    board: {
      ...state.board || {},
      activeHypothesisId: id
    }
  })),
  toggleEvidenceForActiveHypothesis(evidenceId: string) {
    set(state => {
      const {activeHypothesisId, hypotheses} = state.board;

      if (!activeHypothesisId) {
        return state;
      }

      const evidences = hypotheses[activeHypothesisId] || [];
      const isExist = evidences?.includes(evidenceId);
      const updatedEvidences = isExist ?
        evidences.filter(e => e !== evidenceId) :
        [...evidences, evidenceId];

      return {
        board: {
          ...state.board,
          hypotheses: {
            ...state.board.hypotheses,
            [activeHypothesisId]: updatedEvidences
          }
        }
      };
    });
  },
  isBoardValidFor(id: string) {
    const {board, case: caseData} = get();

    const deduction = caseData?.deductions.find(d => d.id === id);
    if (!deduction) return false;

    const hypothesisEvidence = board.hypotheses[id] || [];

    return deduction.requiredEvidence?.every(e =>
      hypothesisEvidence.includes(e)
    ) ?? true;
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

