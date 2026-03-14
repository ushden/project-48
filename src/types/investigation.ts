export type HypothesisBoard = {
  sections: Record<string, string[]>
}
export type InvestigationState = {
  evidence: Set<string>
  discoveredPoints: Record<string, Set<string>>
  readMessages: Set<string>
  seenDialogues: Set<string>
  solvedPuzzles: Set<string>
};
export type BoardState = {
  activeHypothesisId: string;
  hypotheses: Record<string, HypothesisBoard>;
}

export type CaseRuntimeState = {
  investigation: InvestigationState
  board: BoardState
}
