import {ScenePoint} from '../types/case';

export function isScenePointAvailable(
  point: ScenePoint,
  discoveredPoints: string[],
  unlockedEvidence: Set<string>
): boolean {
  if (!point.conditions || point.conditions.length === 0) {
    return true;
  }

  return point.conditions.every(cond => {
    switch (cond.type) {
      case 'pointDiscovered':
        return discoveredPoints.includes(cond.pointId);

      case 'evidenceUnlocked':
        return unlockedEvidence.has(cond.evidenceId);

      default:
        return false;
    }
  });
}