import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'expo-crypto';

import {
  BoardLink,
  BoardLinkType,
  CaseData,
  CaseEnding,
  CaseHubProgress,
  CaseHubProgressStatus,
  CaseHubType,
  DeductionResult,
  LogEntry,
  LogImportance,
  LogType,
  Rating,
  TutorialStep
} from '../types/case';
import {casesData, casesMeta} from '../data';
import {evidenceIndex} from '../data/evidence';

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

  unlockedEvidence: Set<string>;
  sceneProgress: Record<string, {discoveredPoints: string[]}>;
  caseHub: CaseHubType;

  deductionState: {
    attemptsLeft: number;
    status: DeductionResult; // 'idle' | 'failed' | 'success'
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

  boardLinks: BoardLink[];
  nodePositions: Record<string, {x: number; y: number}>;

  timeLeft: number;
  timerStatus: 'running' | 'stopped';

  hintsUsed: number;
  tutorial: {enabled: boolean; step: TutorialStep};

  witnessesFlags: Record<string, {isInterviewed: boolean}>;

  loadGame: () => void;
  loadCase: (caseId: string) => CaseData | undefined;
  completeActiveCase: () => void
  unlockEvidence: (id: string) => void
  isUnlockedEvidence: (id: string) => boolean
  submitDeduction: (deductionId: string) => {success: boolean, result: DeductionResult}
  calculateRating: () => Rating
  addLog: (type: LogType, text: string, importance?: LogImportance) => void
  getEnding: () => CaseEnding | null
  addBoardLink: (fromId: string, toId: string, type: BoardLinkType) => void;
  removeBoardLink: (fromId: string, toId: string) => void;
  saveGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  resetDeduction: () => void;
  setNodePosition: (id: string, x: number, y: number) => void;
  calculateLinkScore: () => number;
  startTimer: () => void;
  spendTime: (amount: number) => void;
  advanceTutorial: (step: TutorialStep) => void;
  finishTutorial: () => void;
  markLogAsRead: () => void;
  hasLogFlag: (key: string) => boolean;
  setLogFlag: (key: string) => void;
  markScenePoint: (sceneId: string, pointId: string) => void;
  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) => void;
  setWitnessFlag: (id: string, key: 'isInterviewed', value: boolean) => void;
};

const upgrade = (r: Rating): Rating => {
  if (r === 'A') return 'S';
  if (r === 'B') return 'A';
  if (r === 'C') return 'B';
  return r;
};

const downgrade = (r: Rating): Rating => {
  if (r === 'S') return 'A';
  if (r === 'A') return 'B';
  if (r === 'B') return 'C';
  return 'F';
};

const serializeState = (state: CaseState) => ({
  casesProgress: state.casesProgress,
  activeCaseId: state.activeCaseId,
  unlockedEvidence: Array.from(state.unlockedEvidence),
  deductionState: state.deductionState,
  log: state.log,
  logFlags: state.logFlags,
  caseHub: state.caseHub,
  boardLinks: state.boardLinks,
  nodePositions: state.nodePositions,
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
    status: 'idle'
  },
  log: data.log ?? [],
  boardLinks: data.boardLinks ?? [],
  nodePositions: data.nodePositions ?? {},
  tutorial: data.tutorial ?? {},
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
  deductionState: {
    attemptsLeft: 3,
    status: 'idle'
  },
  log: [],
  casesProgress: {},
  activeCaseId: null,
  boardLinks: [],
  nodePositions: {},
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

  setWitnessFlag: (id: string, key, value: boolean) => set(state => ({
    witnessesFlags: {
      ...state.witnessesFlags,
      [id]: {
        ...state.witnessesFlags[id],
        [key]: value
      },
    },
  })),

  updateCaseHubObjectStatus: (key: keyof CaseHubProgress, status: CaseHubProgressStatus) =>
    set(state => ({
      caseHub: {
        ...state.caseHub,
        [key]: status
      }
    })),

  markScenePoint: (sceneId, pointId) =>
    set(state => ({
      sceneProgress: {
        ...state.sceneProgress,
        [sceneId]: {
          discoveredPoints: [
            ...(state.sceneProgress[sceneId]?.discoveredPoints ?? []),
            pointId
          ]
        }
      }
    })),

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
          deductionState: {
            ...state.deductionState,
            status: 'failed'
          }
        });

        state.addLog(
          'system',
          'Time has run out. The investigation was forced to conclude.'
        );

        return;
      }

      set({timeLeft: state.timeLeft - 1});
    }, 1000);
  },

  setNodePosition: (id: string, x: number, y: number) =>
    set(state => ({
      nodePositions: {
        ...state.nodePositions,
        [id]: {x, y}
      }
    })),

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
        attemptsLeft: 3,
        status: 'idle'
      },

      boardLinks: [],
      nodePositions: {},

      timeLeft: caseData.timeLimit,
      timerStatus: 'stopped',

      hintsUsed: 0
    });

    return caseData;
  },
  completeActiveCase: () => {
    set(state => {
      if (!state.activeCaseId) return state;

      const caseId = state.activeCaseId;

      return {
        activeCaseId: null,

        casesProgress: {
          ...state.casesProgress,
          [caseId]: {
            completed: true,
            rating: state.calculateRating(),
            endingId: state.getEnding()?.id,
            completedAt: Date.now()
          }
        }
      };
    });
  },

  unlockEvidence: (evidenceId: string) =>
    set(state => {
      if (state.unlockedEvidence.has(evidenceId)) return state;

      const evidence = evidenceIndex[evidenceId];
      if (!evidence) return state;

      state.addLog(
        'evidence',
        `${evidence.title}: ${evidence.description}`,
        'normal'
      );

      return {
        unlockedEvidence: new Set(state.unlockedEvidence).add(evidenceId)
      };
    }),

  isUnlockedEvidence: (id) => {
    return get().unlockedEvidence.has(id);
  },

  submitDeduction: (deductionId: string) => {
    const currentCase = get().case;
    if (!currentCase) return {success: false, result: 'failed'};

    const ded = currentCase.deductions.find(d => d.id === deductionId);
    if (!ded) return {success: false, result: 'failed'};

    // проверка улик
    const hasEvidence = ded.requiredEvidence?.every(e =>
      get().unlockedEvidence.has(e)
    ) ?? true;

    // проверка scenePoints
    const hasPoints = ded.requiredScenePoints?.every(p =>
      Object.values(get().sceneProgress).some(sp =>
        sp.discoveredPoints.includes(p)
      )
    ) ?? true;

    // финальный результат
    const success = hasEvidence && hasPoints;

    return {success, result: ded.result};
  },

  resetDeduction: () =>
    set({
      deductionState: {
        attemptsLeft: 3,
        status: 'idle'
      }
    }),

  calculateRating: (): Rating => {
    const {deductionState} = get();

    if (deductionState.status === 'failed')
      return 'F';

    const attemptsUsed = 3 - deductionState.attemptsLeft;
    const linkScore = get().calculateLinkScore();

    let base: Rating;

    if (attemptsUsed === 0) base = 'S';
    else if (attemptsUsed === 1) base = 'A';
    else if (attemptsUsed === 2) base = 'B';
    else base = 'C';

    // коррекция рейтинга
    if (linkScore >= 2 && base !== 'S') {
      return upgrade(base);
    }

    if (linkScore <= -1) {
      return downgrade(base);
    }

    return base;
  },

  addLog: (type: LogType, text: string, importance?: LogImportance) =>
    set(state => ({
      hasUnreadLogEntries: true,
      log: [
        ...state.log,
        {
          id: crypto.randomUUID(),
          type,
          text,
          timestamp: Date.now(),
          importance: importance ?? 'normal'
        }
      ]
    })),

  getEnding: () => {
    const state = get();
    const caseData = state.case;
    if (!caseData) return null;

    const deductionResult = state.deductionState.status;
    return caseData.endings.find(e => e.condition === deductionResult) ?? null;
  },

  addBoardLink: (
    fromId: string,
    toId: string,
    type: BoardLinkType
  ) => {
    if (get().tutorial.enabled && get().tutorial.step === 2) {
      get().advanceTutorial(3);
      get().addLog('system', tutorialMessages[3]);
    }

    set(state => ({
      boardLinks: [
        ...state.boardLinks,
        {fromId, toId, type}
      ]
    }));
  },

  removeBoardLink: (
    fromId: string,
    toId: string
  ) => set(state => ({
    boardLinks: state.boardLinks.filter(
      l => !(l.fromId === fromId && l.toId === toId)
    )
  })),

  calculateLinkScore: () => {
    const {boardLinks} = get();

    if (boardLinks.length === 0) return 0;

    let score = 0;

    for (const link of boardLinks) {
      switch (link.type) {
        case 'supports':
          score += 2;
          break;
        case 'contradicts':
          score += 1;
          break;
        case 'related':
          score += 1;
          break;
      }
    }

    return score;
  }
}));

useCaseStore.subscribe(
  async (state: CaseState) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(serializeState(state))
    );
  }
);

