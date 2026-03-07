import {BoardState, CaseData} from '../types/case';
import {InvestigationState} from '../types/investigation';

export type CaseOutcome = {
  resultType: 'success' | 'partial' | 'failed';
  ratingScore: number;
  ratingGrade: string;
  linkScore: number;
  endingId?: string;
};

type PlayerSnapshot = {
  investigation: InvestigationState;
  board: BoardState;
  attemptsLeft: number;
};

function resolveDeductionResult(
  caseData: CaseData,
  snapshot: PlayerSnapshot,
  deductionId: string
): 'success' | 'partial' | 'failed' {
  const ded = caseData.deductions.find(d => d.id === deductionId);
  if (!ded) return 'failed';

  const {evidence, discoveredPoints} = snapshot.investigation;

  const hasEvidence = ded.requiredEvidence?.every(e => evidence.has(e)) ?? true;
  const hasPoints = ded.requiredScenePoints?.every(
    p => Object.values(discoveredPoints).some(sp => sp.has(p))
  ) ?? true;

  const fullyConfirmed = hasEvidence && hasPoints;

  if (ded.result === 'success')
    return fullyConfirmed ? 'success' : 'partial';

  if (ded.result === 'partial')
    return fullyConfirmed ? 'partial' : 'failed';

  return 'failed';
}

function calculateLinkScore(board: BoardState): number {
  return Object.values(board.hypotheses).reduce((acc, arr) => acc + arr.length, 0);
}

function calculateRating(
  resultType: 'success' | 'partial' | 'failed',
  attemptsLeft: number,
  linkScore: number
): {score: number; grade: string} {
  const base = resultType === 'success' ? 70 : resultType === 'partial' ? 40 : 0;
  const score = base + attemptsLeft * 5 + linkScore * 3;
  const grade = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';

  return {score, grade};
}

function resolveEnding(
  caseData: CaseData,
  resultType: 'success' | 'partial' | 'failed'
) {
  return caseData.endings.find(e => e.condition === resultType);
}

export function resolveCaseOutcome(
  caseData: CaseData,
  snapshot: PlayerSnapshot,
  deductionId: string
): CaseOutcome {
  const resultType = resolveDeductionResult(
    caseData,
    snapshot,
    deductionId
  );
  const linkScore = calculateLinkScore(snapshot.board);
  const {score, grade} = calculateRating(
    resultType,
    snapshot.attemptsLeft,
    linkScore
  );

  const ending = resolveEnding(caseData, resultType);

  return {
    resultType,
    ratingScore: score,
    ratingGrade: grade,
    linkScore,
    endingId: ending?.id
  };
}