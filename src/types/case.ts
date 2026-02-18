export type Evidence = {
  id: string
  title: string
  type: string
  content: string
  unlocked: boolean
}

export type CaseStatus = "locked" | "available" | "completed"

export type DialogueLine = {
  text: string
  unlocks?: string[]
}

export type Dialogue = {
  npc: string
  lines: DialogueLine[]
}

export type Ending = {
  id: string
  title: string
  requiredEvidence: string[]
  minRating: "S" | "A" | "B" | "C" | "F"
  text: string
}

export type DeductionLinkRule = {
  fromId: string
  toId: string
  type: BoardLinkType
}

export type Deduction = {
  correctEvidence: string[]
  requiredLinks?: DeductionLinkRule[]
  forbiddenLinks?: DeductionLinkRule[]
  endings: Ending[]
}

export type CaseData = {
  id: string
  title: string
  evidence: Evidence[]
  dialogues: Dialogue[]
  deduction: Deduction
}

export type DeductionStatus = "idle" | "solved" | "failed";

export type Rating = "S" | "A" | "B" | "C" | "F"

export type LogType = "evidence" | "dialogue" | "deduction" | "system"

export type LogEntry = {
  id: string
  type: LogType
  text: string
  timestamp: number
}

export type BoardLinkType =
  | "supports"
  | "contradicts"
  | "related"

export type BoardLink = {
  fromId: string
  toId: string
  type: BoardLinkType
}

