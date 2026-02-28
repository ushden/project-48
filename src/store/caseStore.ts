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
import {CaseOutcome, resolveCaseOutcome} from './caseCore';

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

  unlockedEvidence: Set<string>;
  sceneProgress: Record<string, {discoveredPoints: string[]}>;
  caseHub: CaseHubType;

  deductionState: {
    attemptsLeft: number;
  };

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

  witnessesFlags: Record<string, {isInterviewed: boolean}>;

  loadGame: () => void;
  loadCase: (caseId: string) => CaseData | undefined;
  setSystemMessage: (msg: string) => void;
  completeActiveCase: () => void
  unlockEvidence: (id: string) => void
  isUnlockedEvidence: (id: string) => boolean
  submitDeduction: (deductionId: string) => CaseOutcome
  addLog: (type: LogType, text: string, importance?: LogImportance) => void
  saveGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  resetDeduction: () => void;
  markScenePoint: (sceneId: string, pointId: string) => void;
  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) => void;
  setWitnessFlag: (id: string, key: 'isInterviewed', value: boolean) => void;

  // TIMER
  startTimer: () => void;
  spendTime: (amount: number) => void;

  // TUTORIAL
  advanceTutorial: (step: TutorialStep) => void;
  finishTutorial: () => void;

  // LOGS
  markLogAsRead: () => void;
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
  unlockedEvidence: Array.from(state.unlockedEvidence),
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
  sceneProgress: state.sceneProgress,
  witnessesFlags: state.witnessesFlags
});

const hydrateState = (data: CaseState): Partial<CaseState> => ({
  casesProgress: data.casesProgress ?? {},
  activeCaseId: data.activeCaseId ?? null,
  unlockedEvidence: new Set(data.unlockedEvidence ?? []),
  deductionState: data.deductionState ?? {
    attemptsLeft: 3,
  },
  log: data.log ?? [],
  board: data.board ?? {activeHypothesisId: null, hypotheses: {}},
  tutorial: data.tutorial ?? {
    enabled: true,
    step: 0
  },
  logFlags: data.logFlags ?? {},
  sceneProgress: data.sceneProgress ?? {},
  caseHub: data.caseHub ?? {},
  witnessesFlags: data.witnessesFlags ?? {},
  hintsUsed: data.hintsUsed ?? 0,
  timeLeft: data.timeLeft ?? 0,
  timerStatus: data.timerStatus ?? 'stopped',
  hasUnreadLogEntries: data.hasUnreadLogEntries ?? false
});

export const useCaseStore = create<CaseState>((set, get) => ({
  case: null,
  unlockedEvidence: new Set(),
  lastOutcome: null,
  systemMessage: '',
  deductionState: {
    attemptsLeft: 3,
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
  sceneProgress: {},
  caseHub: {} as CaseHubType,

  logFlags: {},
  witnessesFlags: {},

  setSystemMessage: (msg: string) => set(() => ({
    systemMessage: msg
  })),

  setWitnessFlag: (id: string, key, value: boolean) => set(state => ({
    witnessesFlags: {
      ...state.witnessesFlags,
      [id]: {
        ...state.witnessesFlags[id],
        [key]: value
      }
    }
  })),

  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) =>
    set(state => ({
      caseHub: {
        ...state.caseHub,
        [key]: status
      }
    })),

  markScenePoint: (sceneId, pointId) => set(state => {
    const existing =
      state.sceneProgress[sceneId]?.discoveredPoints ?? [];

    if (existing.includes(pointId))
      return state;

    return {
      sceneProgress: {
        ...state.sceneProgress,
        [sceneId]: {
          discoveredPoints: [...existing, pointId]
        }
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

      unlockedEvidence: new Set(),
      sceneProgress: {},

      deductionState: {
        attemptsLeft: caseData.attempts || 1,
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

  unlockEvidence: (evidenceId: string) => set(state => {
    if (state.unlockedEvidence.has(evidenceId))
      return state;

    const evidence = state.case?.evidence[evidenceId];
    if (!evidence) return state;

    const newSet = new Set(state.unlockedEvidence);
    newSet.add(evidenceId);

    state.addLog(
      'evidence',
      `${evidence.title}: ${evidence.description}`,
      'normal'
    );

    return {
      unlockedEvidence: newSet
    };
  }),

  isUnlockedEvidence: (id) => {
    return get().unlockedEvidence.has(id);
  },

  submitDeduction: (deductionId): CaseOutcome => {
    const state = get();
    if (!state.case) return {resultType: 'failed'} as CaseOutcome;

    const outcome = resolveCaseOutcome(
      state.case,
      {
        unlockedEvidence: state.unlockedEvidence,
        sceneProgress: state.sceneProgress,
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
        attemptsLeft,
      }
    });

    return outcome;
  },

  resetDeduction: () =>
    set({
      deductionState: {
        attemptsLeft: 3,
      }
    }),

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

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(serializeState(state))
    );
    console.log('SAVED');
  }
);

