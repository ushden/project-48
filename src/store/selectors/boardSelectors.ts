import {BoardState, CaseRuntimeState} from '../../types/investigation';
import {BoardLayout, CaseData, Deduction} from '../../types/case';

export function getEvidenceOnBoard(board: BoardState, hypothesisId: string) {
  const hypothesis = board.hypotheses[hypothesisId];

  if (!hypothesis) return [];

  return Object.values(hypothesis.sections).flat();
}

export function getAvailableEvidence(runtime: CaseRuntimeState, hypothesisId: string) {
  const discovered = Array.from(runtime.investigation.evidence);

  const placed = getEvidenceOnBoard(runtime.board, hypothesisId);

  return discovered.filter(id => !placed.includes(id));
}

export function getEvidenceBySection(runtime: CaseRuntimeState, hypothesisId: string) {
  const hypothesis = runtime.board.hypotheses[hypothesisId];

  return hypothesis?.sections ?? {};
}

export function getHypothesisProgress(boardLayout: BoardLayout[], runtime: CaseRuntimeState, id: string) {
  const hypothesis = runtime.board.hypotheses[id];

  if (!boardLayout || !hypothesis) return {done: 0, total: 0};

  let done = 0;

  boardLayout.forEach(section => {
    const placed = hypothesis.sections[section.id] || [];

    const ok = section.requiredEvidence.every(e =>
      placed.includes(e)
    );

    if (ok) done++;
  });

  return {
    done,
    total: boardLayout.length
  };
}

export function getSectionsForHypothesis(deductions: Deduction[], hypothesisId: string) {
  const deduction = deductions?.find(s => s.id === hypothesisId);

  return deduction?.layout || [];
}