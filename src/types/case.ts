export type Evidence = {
  id: string
  title: string
  type: string
  content: string
  unlocked: boolean
}

export type CaseStatus = 'locked' | 'available' | 'completed'

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
  minRating: 'S' | 'A' | 'B' | 'C' | 'F'
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
  id: string
  title: string
  description: string;
  region: string
  position: {
    x: number
    y: number
  }
  difficulty: 1 | 2 | 3 | 4 | 5
}

export type CaseData = {
  id: string;
  title: string;
  timeLimit: number;
  timeCosts: TimeCosts;
  evidence: Evidence[];
  dialogues: Dialogue[];
  deduction: Deduction;
}

export type DeductionStatus = 'idle' | 'solved' | 'failed';

export type Rating = 'S' | 'A' | 'B' | 'C' | 'F'

export type LogType = 'evidence' | 'dialogue' | 'deduction' | 'system'

export type LogEntry = {
  id: string
  type: LogType
  text: string
  timestamp: number
}

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
