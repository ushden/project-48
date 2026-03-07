import {Condition} from '../types/case';
import {InvestigationState} from '../types/investigation';

export function checkConditions(
  conditions: Condition[] | undefined,
  state: InvestigationState
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    switch (condition.type) {
      case 'evidenceFound':
        return state.evidence.has(condition.id!);

      case 'messageRead':
        return state.readMessages.has(condition.id!);

      case 'dialogueSeen':
        return state.seenDialogues.has(condition.id!);

      case 'puzzleSolved':
        return state.solvedPuzzles.has(condition.id!);

      case 'pointDiscovered':
        if (!condition.sceneId || !condition.pointId) return false;
        return (
          state.discoveredPoints[condition.sceneId]?.has(condition.pointId) ??
          false
        );

      default:
        return false;
    }
  });
}
