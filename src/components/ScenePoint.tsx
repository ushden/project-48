import {GestureResponderEvent, Pressable, StyleSheet, View} from 'react-native';

type Props = {
  onPress: (event: GestureResponderEvent) => void;
  left: number;
  top: number;
  width: number;
  height: number;
};

const debugMode = false;

export function ScenePoint({onPress, top, left, width, height}: Props) {
  return (
    <Pressable
      onPress={(event) => onPress(event)}
      style={[
        styles.pointContainer,
        {
          top,
          left,
          width,
          height
        },
        debugMode ? {
          borderWidth: 1,
          borderColor: 'red'
        } : {},
      ]}
    >
      <View
        style={styles.point}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pointContainer: {
    position: 'absolute',
    zIndex: 100,
  },
  point: {
    width: '100%',
    height: '100%'
  }
});