import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import {Deduction} from '../types/case';
import {StyledText} from './StyledText';
import {NoteCard} from './NoteCard';

const ITEM_WIDTH = 280;
const SPACING = 16;

type Props = {
  item: Deduction;
  index: number;
  scrollX: SharedValue<number>;
  isActive: boolean;
};

export function HypothesisCard(props: Props) {
  const {item, index, scrollX, isActive} = props;

  const glow = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      glow.value = withRepeat(
        withTiming(1, {duration: 1800}),
        -1,
        true
      );
    } else {
      glow.value = 0;
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    const position = index * (ITEM_WIDTH + SPACING);
    const distance = Math.abs(scrollX.value - position);

    const scale = interpolate(
      distance,
      [0, ITEM_WIDTH],
      [1, 0.9],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      distance,
      [0, ITEM_WIDTH],
      [1, 0.6],
      Extrapolation.CLAMP
    );
    const glowOpacity = interpolate(
      glow.value,
      [0, 1],
      [0.2, 0.6]
    );

    return {
      transform: [{scale}],
      opacity,
      shadowOpacity: isActive ? glowOpacity : 0,
      shadowRadius: isActive ? 20 : 0,
      shadowColor: '#8b1c1c'
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <NoteCard
        title={item.text}
        size="large"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#f5e6c8',
    padding: 8,
    borderRadius: 8,
    elevation: 4
  }
});