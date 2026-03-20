import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet} from 'react-native';
import {scheduleOnRN} from 'react-native-worklets';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

export interface FlyingHintRef {
  start: (startX: number, startY: number) => void;
}

interface Props {
  targetX: number;
  targetY: number;
  onArrival?: () => void;
}

const FlyingHint = forwardRef<FlyingHintRef, Props>(
  ({targetX, targetY, onArrival}, ref) => {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(0);

    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      start: (x: number, y: number) => {
        startX.value = x;
        startY.value = y;

        progress.value = 0;
        opacity.value = 1;

        progress.value = withTiming(
          1,
          {
            duration: 700,
            easing: Easing.out(Easing.cubic)
          },
          (finished) => {
            if (finished) {
              opacity.value = withTiming(0, {duration: 150});
              if (onArrival) scheduleOnRN(onArrival);
            }
          }
        );
      }
    }));

    const animatedStyle = useAnimatedStyle(() => {
      const x =
        startX.value +
        (targetX - startX.value) * progress.value;

      const y =
        startY.value +
        (targetY - startY.value) * progress.value +
        Math.sin(progress.value * Math.PI) * -40; // лёгкая дуга

      return {
        transform: [
          {translateX: x},
          {translateY: y}
        ],
        opacity: opacity.value
      };
    });

    return (
      <Animated.View style={[styles.dot, animatedStyle]} />
    );
  }
);

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    zIndex: 9999,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8FA3B8',
    opacity: 0.9
  },
});

export default FlyingHint;