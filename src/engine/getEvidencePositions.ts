import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export function getEvidencePositions(count: number) {
  const centerX = width / 2;
  const centerY = height * 0.35;

  const radius = 120;
  const totalAngle = Math.PI * 0.8;
  const startAngle = -totalAngle / 2;

  if (count === 0) return [];

  if (count === 1) {
    return [
      {
        x: centerX,
        y: centerY + radius
      }
    ];
  }

  return Array.from({length: count}).map((_, index) => {
    const angle =
      startAngle + (index / (count - 1)) * totalAngle;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
}