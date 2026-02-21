import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as crypto from 'expo-crypto';

import {
  BoardLink,
  BoardLinkType,
  CaseData,
  CaseStatus,
  DeductionLinkRule,
  DeductionStatus,
  Ending,
  Hint,
  LogEntry,
  LogType,
  Rating,
  TimeCosts,
  TutorialStep
} from '../types/case';
import {caseMapping, casesIndex} from '../data';

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
  unlockedEvidence: Set<string>;
  deductionState: {
    attemptsLeft: number,
    status: DeductionStatus;
  },
  log: LogEntry[],
  casesProgress: Record<string, {
    status: CaseStatus
    rating?: Rating
  }>;
  activeCaseId: string | null;
  boardLinks: BoardLink[];
  nodePositions: Record<string, {x: number, y: number}>;
  timeLeft: number;
  timerStatus: 'running' | 'stopped';
  hintsUsed: number;
  tutorial: {
    enabled: boolean,
    step: TutorialStep
  },

  loadGame: () => void;
  loadCase: (caseId: string) => void
  completeCase: () => void
  unlockEvidence: (id: string) => void
  isUnlocked: (id: string) => boolean
  checkDeduction: (selected: string[]) => boolean
  calculateRating: () => Rating
  addLog: (type: LogType, text: string) => void
  getEnding: () => Ending | null
  addBoardLink: (fromId: string, toId: string, type: BoardLinkType) => void;
  removeBoardLink: (fromId: string, toId: string) => void;
  saveGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  resetDeduction: () => void;
  checkReasoning: () => {ok: boolean, penalty: boolean};
  setNodePosition: (id: string, x: number, y: number) => void;
  maybeAddHint: (reason: 'wrong' | 'missingLinks') => void;
  calculateLinkScore: () => number;
  startTimer: () => void;
  spendTime: (action: keyof TimeCosts) => void;
  advanceTutorial: (step: TutorialStep) => void;
  finishTutorial: () => void;
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
  boardLinks: state.boardLinks,
  nodePositions: state.nodePositions,
  tutorial: state.tutorial,
  hintsUsed: state.hintsUsed,
  timeLeft: state.timeLeft,
  timerStatus: state.timerStatus
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
  hintsUsed: data.hintsUsed ?? 0,
  timeLeft: data.timeLeft ?? 0,
  timerStatus: data.timerStatus ?? 'stopped'
});

const hasLink = (links: BoardLink[], rule: DeductionLinkRule) =>
  links.some(
    l =>
      l.fromId === rule.fromId &&
      l.toId === rule.toId &&
      l.type === rule.type
  );

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

  spendTime: (action: keyof TimeCosts) => {
    const state = get();
    const cost = state.case?.timeCosts[action] ?? 0;

    set({
      timeLeft: Math.max(0, state.timeLeft - cost)
    });

    state.addLog(
      'system',
      `Time spent: ${cost}s`
    );
  },

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
      savedState.case = caseMapping[savedState.activeCaseId];
    } else {
      const [firstCase] = casesIndex;

      savedState.case = caseMapping[firstCase.id];
    }

    set(state => ({
      ...state,
      ...savedState
    }));
  },

  loadCase: (caseId: string) => {
    const caseData = caseMapping[caseId];
    const activeCaseId = get().activeCaseId;

    if (activeCaseId === caseId) return;

    set({
      case: caseData,
      activeCaseId: caseId,
      unlockedEvidence: new Set(
        caseData.evidence.filter(e => e.unlocked).map(e => e.id)
      ),
      deductionState: {
        attemptsLeft: 3,
        status: 'idle'
      },
      log: [],
      timeLeft: caseData.timeLimit,
      timerStatus: 'running'
    });

    if (get().tutorial.enabled) {
      get().addLog('system', tutorialMessages[0]);
    }
  },

  completeCase: () => {
    const {activeCaseId, calculateRating, finishTutorial} = get();

    if (!activeCaseId) return;

    set(state => ({
      casesProgress: {
        ...state.casesProgress,
        [activeCaseId]: {
          status: 'completed',
          rating: calculateRating()
        }
      }
    }));

    finishTutorial();
  },

  unlockEvidence: (id) => {
    set(state => {
      if (state.tutorial.enabled && state.tutorial.step === 0) {
        state.advanceTutorial(1);
        state.addLog('system', tutorialMessages[1]);
      }

      if (state.unlockedEvidence.has(id)) return state;

      const updated = new Set(state.unlockedEvidence);
      updated.add(id);

      const evidence = state.case?.evidence.find(e => e.id === id);

      return {
        unlockedEvidence: updated,
        log: [
          ...state.log,
          {
            id: crypto.randomUUID(),
            type: 'evidence',
            text: `New evidence found: ${evidence?.title}`,
            timestamp: Date.now()
          }
        ]
      };
    });
  },


  isUnlocked: (id) => {
    return get().unlockedEvidence.has(id);
  },

  checkDeduction: (selected) => {
    const state = get();
    const correct =
      state.case?.deduction.correctEvidence ?? [];

    if (state.tutorial.enabled && state.tutorial.step === 3) {
      state.advanceTutorial(4);
      state.addLog('system', tutorialMessages[4]);
    }

    const reasoning = state.checkReasoning();

    const evidenceCorrect =
      selected.length === correct.length &&
      selected.every(id => correct.includes(id));

    // логическая ошибка — мгновенный провал
    if (reasoning.penalty) {
      set({
        deductionState: {
          attemptsLeft: 0,
          status: 'failed'
        }
      });
      state.addLog(
        'deduction',
        'Critical logical error in reasoning'
      );
      state.maybeAddHint('wrong');

      return false;
    }

    if (evidenceCorrect && reasoning.ok) {
      set({
        deductionState: {
          ...state.deductionState,
          status: 'solved'
        }
      });
      state.addLog(
        'deduction',
        'Correct conclusion with solid reasoning'
      );
      return true;
    }

    // частично правильно — теряем попытку
    const attemptsLeft = state.deductionState.attemptsLeft - 1;

    if (attemptsLeft === 1) {
      get().addLog('system', 'One last chance. Choose carefully.');
    }

    set({
      deductionState: {
        attemptsLeft,
        status: attemptsLeft <= 0 ? 'failed' : 'idle'
      }
    });

    state.addLog(
      'deduction',
      'Conclusion lacks sufficient reasoning'
    );
    state.maybeAddHint('missingLinks');

    return false;
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

  addLog: (type: LogType, text: string) =>
    set(state => ({
      log: [
        ...state.log,
        {
          id: crypto.randomUUID(),
          type,
          text,
          timestamp: Date.now()
        }
      ]
    })),

  getEnding: () => {
    const state = get();
    const caseData = state.case;
    if (!caseData) return null;

    const rating = state.calculateRating();
    const timeLeft = state.timeLeft;
    const links = state.boardLinks;
    const deduction = caseData.deduction;

    return deduction.endings.find(ending => {
      const c = ending.conditions;
      if (!c) return true;

      if (c.minRating && rating !== c.minRating) return false;

      if (c.minTimeLeft && timeLeft < c.minTimeLeft) return false;

      if (c.noHintsUsed && state.hintsUsed > 0) return false;

      if (c.noForbiddenLinks && deduction.forbiddenLinks) {
        const hasForbidden = deduction.forbiddenLinks.some(rule =>
          links.some(
            l =>
              l.fromId === rule.fromId &&
              l.toId === rule.toId &&
              l.type === rule.type
          )
        );
        if (hasForbidden) return false;
      }

      if (c.requiredLinksComplete && deduction.requiredLinks) {
        const allPresent = deduction.requiredLinks.every(rule =>
          links.some(
            l =>
              l.fromId === rule.fromId &&
              l.toId === rule.toId &&
              l.type === rule.type
          )
        );
        if (!allPresent) return false;
      }

      return true;
    }) ?? null;
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

  checkReasoning: () => {
    const state = get();
    const deduction = state.case?.deduction;
    if (!deduction) return {ok: true, penalty: false};

    const links = state.boardLinks;

    // обязательные связи
    if (deduction.requiredLinks) {
      const missing = deduction.requiredLinks.some(
        rule => !hasLink(links, rule)
      );
      if (missing) {
        return {ok: false, penalty: false};
      }
    }

    // запрещённые связи
    if (deduction.forbiddenLinks) {
      const hasForbidden = deduction.forbiddenLinks.some(
        rule => hasLink(links, rule)
      );
      if (hasForbidden) {
        return {ok: false, penalty: true};
      }
    }

    return {ok: true, penalty: false};
  },

  maybeAddHint: (reason: 'wrong' | 'missingLinks') => {
    const state = get();
    const hints = state.case?.deduction.hints;
    if (!hints) return;

    let condition: Hint['condition'];

    if (reason === 'wrong') condition = 'onWrongDeduction';
    else condition = 'onMissingLinks';

    const hint = hints.find(h => h.condition === condition);
    if (!hint) return;

    // чтобы не спамить одной и той же подсказкой
    const alreadyShown = state.log.some(
      l => l.type === 'system' && l.text === hint.text
    );
    if (alreadyShown) return;

    state.addLog('system', hint.text);
    set(state => ({
      hintsUsed: state.hintsUsed + 1
    }));
  },

  calculateLinkScore: () => {
    const state = get();
    const deduction = state.case?.deduction;
    if (!deduction) return 0;

    let score = 0;

    // бонусы
    deduction.requiredLinks?.forEach(rule => {
      const has = state.boardLinks.some(
        l =>
          l.fromId === rule.fromId &&
          l.toId === rule.toId &&
          l.type === rule.type
      );
      if (has) {
        score += rule.score ?? 1;
      }
    });

    // штрафы
    deduction.forbiddenLinks?.forEach(rule => {
      const has = state.boardLinks.some(
        l =>
          l.fromId === rule.fromId &&
          l.toId === rule.toId &&
          l.type === rule.type
      );
      if (has) {
        score -= Math.abs(rule.score ?? 1);
      }
    });

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

