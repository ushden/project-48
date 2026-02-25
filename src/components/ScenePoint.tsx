import {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

type Props = {
  onPress: () => void;
  isDiscovered: boolean;
  left: number;
  top: number;
};

export function ScenePoint({onPress, isDiscovered, top, left}: Props) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  function handlePress() {
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.15,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true
      })
    ]).start();

    onPress();
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.pointContainer,
        {
          top,
          left,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.point,
          {
            opacity: isDiscovered ? 0.35 : opacity,
            transform: [{scale: Animated.multiply(scale, pulse)}]
          }
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pointContainer: {
    position: 'absolute',
    zIndex: 100,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  point: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.75)',
  }
});