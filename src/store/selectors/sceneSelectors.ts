import {ScenePoint} from '../../types/case';

export const getSceneProgress = (scenePoint: ScenePoint[], discovered: Set<string>) => {
  const left = scenePoint.filter(p => !discovered.has(p.id)).length;

  return {
    left: scenePoint.length - left,
    total: scenePoint.length,
  };
};