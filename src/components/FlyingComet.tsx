import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet} from 'react-native';
import {scheduleOnRN} from 'react-native-worklets';
import Animated, {SharedValue, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';

// 1. Define the interface for the Ref actions
export interface FlyingCometRef {
  start: (startX: number, startY: number) => void;
}

interface Props {
  targetX: number;
  targetY: number;
  onArrival?: () => void; // Optional callback when comet hits target
}

const FlyingComet = forwardRef<FlyingCometRef, Props>(({targetX, targetY, onArrival}, ref) => {
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Expose the start method to the parent
  useImperativeHandle(ref, () => ({
    start: (startX: number, startY: number) => {
      // Reset position immediately
      opacity.value = 0;
      posX.value = startX;
      posY.value = startY;

      // Start Sequence
      opacity.value = withTiming(1, {duration: 100});

      posX.value = withTiming(targetX, {duration: 600});
      posY.value = withTiming(targetY, {duration: 600}, (finished) => {
        if (finished) {
          opacity.value = withTiming(0, {duration: 100});
          if (onArrival) scheduleOnRN(onArrival);
        }
      });
    }
  }));

  // Internal component for the trail parts to keep code DRY
  const TrailPart = ({
                       x, y, size, alpha, delay
                     }: {
    x: SharedValue<number>,
    y: SharedValue<number>,
    size: number,
    alpha: number,
    delay: number
  }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        {translateX: withDelay(delay, withTiming(x.value, {duration: 50}))},
        {translateY: withDelay(delay, withTiming(y.value, {duration: 50}))}
      ],
      opacity: opacity.value * alpha,
      width: size,
      height: size,
      borderRadius: size / 2
    }));

    return <Animated.View style={[styles.particle, animatedStyle]} />;
  };

  return (
    <>
      {/* Tail - furthest and smallest */}
      <TrailPart x={posX} y={posY} size={10} alpha={0.2} delay={80} />
      {/* Middle trail */}
      <TrailPart x={posX} y={posY} size={16} alpha={0.5} delay={40} />
      {/* Head - bright and glowing */}
      <TrailPart x={posX} y={posY} size={24} alpha={1} delay={0} />
    </>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    backgroundColor: '#FFD700', // Gold color
    shadowColor: '#FFD700',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5 // For Android glow
  }
});

export default FlyingComet;
