import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  BoardLink,
  BoardLinkType,
  CaseData,
  CaseStatus,
  DeductionLinkRule,
  DeductionStatus,
  Ending,
  LogEntry,
  LogType,
  Rating
} from '../types/case';
import {casesIndex} from '../data/cases';

const STORAGE_KEY = 'detective_game_save_v1';

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
  }>,
  activeCaseId: string | null,
  boardLinks: BoardLink[],
  nodePositions: Record<string, {x: number, y: number}>,

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
  resetDeduction: () => void;
  checkReasoning: () => {ok: boolean, penalty: boolean};
  setNodePosition: (id: string, x: number, y: number) => void;
}

const serializeState = (state: CaseState) => ({
  casesProgress: state.casesProgress,
  activeCaseId: state.activeCaseId,
  unlockedEvidence: Array.from(state.unlockedEvidence),
  deductionState: state.deductionState,
  log: state.log
});

const hydrateState = (data: CaseState): Partial<CaseState> => ({
  casesProgress: data.casesProgress ?? {},
  activeCaseId: data.activeCaseId ?? null,
  unlockedEvidence: new Set(data.unlockedEvidence ?? []),
  deductionState: data.deductionState ?? {
    attemptsLeft: 3,
    status: 'idle'
  },
  log: data.log ?? []
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

  setNodePosition: (id: string, x: number, y: number) =>
    set(state => ({
      nodePositions: {
        ...state.nodePositions,
        [id]: {x, y}
      }
    })),

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
      savedState.case = require(`../data/cases/${savedState.activeCaseId}.json`) as CaseData;
    } else {
      const [firstCase] = casesIndex;

      savedState.case = require(`../data/cases/${firstCase.id}.json`) as CaseData;
    }

    set(state => ({
      ...state,
      ...savedState
    }));
  },

  loadCase: (caseId: string) => {
    const caseData = require(`../data/cases/${caseId}.json`) as CaseData;

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
      log: []
    });
  },

  completeCase: () => {
    const {activeCaseId, calculateRating} = get();

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
  },

  unlockEvidence: (id) => {
    set(state => {
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

    if (attemptsUsed === 0) return 'S';
    if (attemptsUsed === 1) return 'A';
    if (attemptsUsed === 2) return 'B';

    return 'C';
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
    const unlocked = state.unlockedEvidence;

    const ratingOrder = ['F', 'C', 'B', 'A', 'S'];

    return caseData.deduction.endings.find(ending => {
      const ratingOk =
        ratingOrder.indexOf(rating) >=
        ratingOrder.indexOf(ending.minRating);

      const evidenceOk = ending.requiredEvidence.every(id =>
        unlocked.has(id)
      );

      return ratingOk && evidenceOk;
    }) ?? null;
  },

  addBoardLink: (
    fromId: string,
    toId: string,
    type: BoardLinkType
  ) => set(state => ({
    boardLinks: [
      ...state.boardLinks,
      {fromId, toId, type}
    ]
  })),

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

