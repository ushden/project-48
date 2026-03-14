import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
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
      <View style={styles.pin} />
      <Text style={styles.title}>{item.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff3b0',
    padding: 8,
    paddingVertical: 20,
    borderRadius: 8,
    elevation: 2
  },
  title: {
    fontFamily: 'SweetMavka',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  pin: {
    position: 'absolute',
    top: -5,
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c0392b',
    marginBottom: -5,
    zIndex: 10
  },
});