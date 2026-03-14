import {BoardLayout, CaseData} from '../types/case';
import {BoardState, InvestigationState} from '../types/investigation';

export type CaseOutcome = {
  resultType: 'success' | 'partial' | 'failed';
  ratingScore: number;
  ratingGrade: string;
  linkScore: number;
  deductionId: string;
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

function calculateLinkScore(boardLayout: BoardLayout[], board: BoardState, deductionId: string): number {
  return boardLayout.reduce((acc, arr) => {
    const section = board.hypotheses[deductionId].sections[arr.id];

    arr.requiredEvidence.forEach(i => {
      if (section.includes(i)) {
        acc += 5;
      }
    });

    return acc;
  }, 0);
}

function calculateRating(
  resultType: 'success' | 'partial' | 'failed',
  attemptsLeft: number,
  linkScore: number
): {score: number; grade: string} {
  const base = resultType === 'success' ? 80 : resultType === 'partial' ? 50 : 0;
  let score = base + attemptsLeft * 5 + linkScore * 3;

  if (score > 100) score = 100;

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
  const deduction = caseData?.deductions?.find(d => d.id === deductionId);
  const resultType = resolveDeductionResult(
    caseData,
    snapshot,
    deductionId
  );
  const linkScore = calculateLinkScore(deduction?.layout || [], snapshot.board, deductionId);
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
    deductionId,
    endingId: ending?.id
  };
}