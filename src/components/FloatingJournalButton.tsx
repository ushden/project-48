import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useCaseStore} from '../store/caseStore';
import {useEffect, useRef} from 'react';

export function FloatingJournalButton() {
  const pulse = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation<any>();
  const hasUnread = useCaseStore(s => s.hasUnreadLogEntries);

  const hiddenScreens = ['Dialogue', 'Deduction', 'MindBoard'];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  if (hiddenScreens.includes(navigation.route?.name)) {
    return null;
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        navigation.navigate('Log');
      }}
    >
      <View style={styles.icon}>
        <Image
          source={require('../../assets/notebook.png')}
          resizeMode="cover"
        />
      </View>

      {hasUnread && (
        <Animated.View
          style={[
            styles.dot,
            {transform: [{scale: pulse}]}
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 22, 30, 0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dot: {
    position: 'absolute',
    top: -10,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cfa96e'
  }
});