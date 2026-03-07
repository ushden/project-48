export type InvestigationState = {
  evidence: Set<string>
  discoveredPoints: Record<string, Set<string>>
  readMessages: Set<string>
  seenDialogues: Set<string>
  solvedPuzzles: Set<string>
};