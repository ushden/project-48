import {ImageSourcePropType} from 'react-native';

export type Rating = 'S' | 'A' | 'B' | 'C' | 'F';

export type CaseStatus = 'locked' | 'available' | 'completed' | 'active';

export type CaseUnlockCondition =
  | {type: 'caseCompleted'; caseId: string}
  | {type: 'minRating'; rating: Rating}
  | {type: 'timeRemaining'; minMinutes: number}
  | {type: 'requiredLinks'; count: number}
  | {type: 'secretEndingUnlocked'; caseId: string};

export type DeductionResult = 'failed' | 'partial' | 'success' | 'idle';

export type Deduction = {
  id: string;
  text: string;
  requiredEvidence?: string[];
  requiredScenePoints?: string[];
  result: DeductionResult;
  log?: {
    type: LogType;
    importance?: LogImportance;
    text: string;
  };
};

export type TimeCosts = {
  openEvidence: number;
  dialogueStep: number;
  wrongDeduction: number;
}

export type DialogueLine = {
  text: string;
  log?: {
    type: LogType;
    importance?: LogImportance;
  };
};

export type DialogueBlock = {
  id: string;
  speaker: string;
  lines: DialogueLine[];
};

export type Witness = {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  dialogue: DialogueLine[];

  isInterviewed?: boolean;
};

type Log = {
  type: LogType;
  importance?: LogImportance;
};

export type Messages = {
  id: string;
  name: string;
  messages: Message[];
}

export type Message = {
  from: string;
  text: string;
  time: string;
  unlocksEvidence?: string;
  log?: Log;
};

export type Note = {
  text: string;
  date: string;
  log?: Log;
}

export type VictimPhone = {
  messages?: Messages[];
  notes?: Note[];
};

export type CaseEnding = {
  id: string;
  condition: DeductionResult;
  rating: 'S' | 'A' | 'B' | 'C' | 'F';
  text: string;
};

export type CaseHubProgressStatus = 'locked' | 'available' | 'visited';

export type CaseHubProgress = {
  board: CaseHubProgressStatus;
  case: CaseHubProgressStatus;
  crimeScene: CaseHubProgressStatus;
  witnesses: CaseHubProgressStatus;
  victimPhone: CaseHubProgressStatus;
};

export type CaseHubType = Record<keyof CaseHubProgress, CaseHubProgressStatus>;

export type Portrait = {
  source: ImageSourcePropType;
  position?: 'left' | 'right' | 'center';
};

export type WitnessMeta = {
  id: string;
  listPortrait: Portrait;
  dialoguePortrait: Portrait;
};

export type CrimeSceneMeta = {
  id: string;
  portrait: Portrait;
};

export type CaseMeta = {
  id: string;
  witness: WitnessMeta[];
  crimeScene: CrimeSceneMeta[];
  introDialogue: Portrait;
}

export type EvidenceData = {
  id: string;
  title: string;
  description: string;
};

export type CaseData = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  attempts: number;
  timeLimit: number;
  position: {
    x: number
    y: number
  };
  evidence: Record<string, EvidenceData>;
  unlockConditions: CaseUnlockCondition[];
  introDialogue: DialogueBlock;
  crimeScene: CrimeScene[];
  witnesses: Witness[];
  victimPhone: VictimPhone;
  deductions: Deduction[];
  endings: CaseEnding[];
  caseHub: CaseHubType;
  deductionDialogue: {
    characterName: string;
    introText: string;
  };
  reactions: {
    success: string;
    partial: string;
    failed: string;
  };
};

export type CrimeScene = {
  id: string;
  points: ScenePoint[];
};

export type LogType = 'evidence' | 'dialogue' | 'deduction' | 'system';
export type LogImportance = 'normal' | 'hint' | 'story';

export type LogEntry = {
  id: string;
  type: LogType;
  text: string;
  timestamp: number;
  importance?: LogImportance;
};

export type BoardState = {
  activeHypothesisId: string | null;
  hypotheses: Record<string, string[]>;
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
