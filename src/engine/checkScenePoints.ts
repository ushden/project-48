import {SceneProgress} from '../types/case';

export function hasRequiredScenePoints(
  required: string[] | undefined,
  sceneProgress: SceneProgress
): boolean {
  if (!required || required.length === 0) return true;

  return required.every(pointId =>
    Object.values(sceneProgress).some(scene =>
      scene.discoveredPoints.includes(pointId)
    )
  );
}
