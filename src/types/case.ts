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
  id: string;
  from: string;
  text: string;
  time: string;
  unlocksEvidence?: string;
  log?: Log;
};

export type Note = {
  id: string;
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
  journal: CaseHubProgressStatus;
  crimeScene: CaseHubProgressStatus;
  witnesses: CaseHubProgressStatus;
  victimPhone: CaseHubProgressStatus;
  notepad: CaseHubProgressStatus;
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

export type ConditionType =
  | 'pointDiscovered'
  | 'evidenceFound'
  | 'messageRead'
  | 'notesRead'
  | 'dialogueSeen'
  | 'puzzleSolved';
export type Condition = {
  type: ConditionType
  id?: string
  pointId?: string
  sceneId?: string
}

export type CaseMeta = {
  id: string;
  witness: WitnessMeta[];
  scenes: CrimeSceneMeta[];
  introDialogue: Portrait;
}

export type EvidenceData = {
  id: string;
  title: string;
  description: string;
  source: 'scene' | 'phone' | 'dialogue' | 'document' | 'puzzle';
  category: 'behavior' | 'object' | 'digital' | 'environment' | 'note';
};

export type Question = {
  id: string;
  text: string;
  resolveConditions: Condition[];
  resolved?: boolean;
  questionHint?: string;
};

export type BoardLayout = {
  id: string;
  title: string;
  requiredEvidence: string[];
};

export type SceneAction =
  | {type: 'evidence'; evidenceId: string}
  | {type: 'dialogue'; dialogueId: string}
  | {type: 'document'; documentId: string}
  | {type: 'puzzle'; puzzleId: string}
  | {type: 'inspect'; text: string}
export type ScenePoint = {
  id: string
  x: number
  y: number
  action: SceneAction
  conditions?: Condition[]
}
export type Scene = {
  id: string;
  points: ScenePoint[];
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
  questions: Question[];
  evidence: Record<string, EvidenceData>;
  unlockConditions: CaseUnlockCondition[];
  introDialogue: DialogueBlock;
  scenes: Scene[];
  witnesses: Witness[];
  victimPhone: VictimPhone;
  boardLayout: BoardLayout[];
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


export type LogType = 'evidence' | 'dialogue' | 'deduction' | 'system';
export type LogImportance = 'normal' | 'hint' | 'story';
export type LogEntry = {
  id: string;
  type: LogType;
  text: string;
  timestamp: number;
  importance?: LogImportance;
};

export type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5;
