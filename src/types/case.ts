export type Evidence = {
  id: string
  title: string
  type: string
  content: string
  unlocked: boolean
}

export type Rating = 'S' | 'A' | 'B' | 'C' | 'F';

export type CaseStatus = 'locked' | 'available' | 'completed' | 'active';

export type CaseUnlockCondition =
  | {type: 'caseCompleted'; caseId: string}
  | {type: 'minRating'; rating: Rating}
  | {type: 'timeRemaining'; minMinutes: number}
  | {type: 'requiredLinks'; count: number}
  | {type: 'secretEndingUnlocked'; caseId: string};

export type DialogueLine = {
  text: string
  unlocks?: string[]
}

export type Dialogue = {
  npc: string
  lines: DialogueLine[]
}

export type EndingConditions = {
  minRating?: Rating
  requiredLinksComplete?: boolean
  noForbiddenLinks?: boolean
  minTimeLeft?: number
  noHintsUsed?: boolean
}

export type Ending = {
  id: string
  title: string
  requiredEvidence: string[]
  minRating: Rating;
  text: string
  secret?: boolean
  conditions?: EndingConditions
}

export type DeductionLinkRule = {
  fromId: string;
  toId: string;
  type: BoardLinkType;
  score?: number
}

export type Deduction = {
  correctEvidence: string[];
  requiredLinks?: DeductionLinkRule[];
  forbiddenLinks?: DeductionLinkRule[];
  endings: Ending[];
  hints: Hint[];
}

export type TimeCosts = {
  openEvidence: number;
  dialogueStep: number;
  wrongDeduction: number;
}

export type CaseMeta = {
  id: string;
  title: string;
  description: string;
  region: string;
  position: {
    x: number
    y: number
  };
  difficulty: 1 | 2 | 3 | 4 | 5;
  unlockConditions: CaseUnlockCondition[];
}

export type CaseData = {
  id: string;
  title: string;
  timeLimit: number;
  timeCosts: TimeCosts;
  evidence: Evidence[];
  dialogues: Dialogue[];
  deduction: Deduction;
  crimeScene?: CrimeScene;
}

export type DeductionStatus = 'idle' | 'solved' | 'failed';

export type LogType = 'evidence' | 'dialogue' | 'deduction' | 'system';
export type LogImportance = 'normal' | 'hint' | 'story';

export type LogEntry = {
  id: string;
  type: LogType;
  text: string;
  timestamp: number;
  importance?: LogImportance;
};

export type BoardLinkType =
  | 'supports'
  | 'contradicts'
  | 'related'

export type BoardLink = {
  fromId: string
  toId: string
  type: BoardLinkType
}

export type Hint = {
  id: string
  condition: 'onWrongDeduction' | 'onMissingLinks'
  text: string
}

export type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5;

export type SceneCondition =
  | {type: 'pointDiscovered'; pointId: string}
  | {type: 'evidenceUnlocked'; evidenceId: string};
export type SceneProgress = Record<string, {discoveredPoints: string[]}>;
export type ScenePoint = {
  id: string;
  x: number;
  y: number;
  type: 'evidence' | 'log' | 'choice' | 'empty';
  payload?: any;
  conditions?: SceneCondition[];
};

export type CrimeScene = {
  id: string;
  image: string;
  points: ScenePoint[];
};
