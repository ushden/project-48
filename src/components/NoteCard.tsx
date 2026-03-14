import React, {useEffect, useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

type Props = {
  title: string;
  description?: string;
  onPress: () => void;
};

const AnimatedView = Animated.createAnimatedComponent(View);

export function NoteCard({title, description, onPress}: Props) {
  const rotation = useMemo(() => {
    const deg = Math.random() * 6 - 3;
    return `${deg}deg`;
  }, []);

  const offset = useMemo(() => {
    return {
      x: Math.random() * 12 - 6,
      y: Math.random() * 12 - 6
    };
  }, []);

  const scale = useSharedValue(0.75);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 120
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: offset.x},
      {translateY: offset.y},
      {rotate: rotation},
      {scale: scale.value}
    ]
  }));

  return (
    <AnimatedView style={[styles.wrapper, animatedStyle]}>
      <View style={styles.pin} />
      <Pressable style={styles.card} onPress={onPress}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.desc}>{description}</Text>
        ) : null}
      </Pressable>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 6
  },
  pin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c0392b',
    marginBottom: -5,
    zIndex: 2
  },
  card: {
    width: 140,
    minHeight: 90,

    backgroundColor: '#fff3b0',
    borderRadius: 6,
    padding: 10,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},

    elevation: 5
  },
  title: {
    fontFamily: 'SweetMavka',
    fontSize: 16,
    fontWeight: '500'
  },
  desc: {
    fontFamily: 'SweetMavka',
    fontSize: 14,
    marginTop: 4,
    color: '#444'
  }
});