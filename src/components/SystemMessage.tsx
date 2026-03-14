import {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from './StyledText';

export const SystemMessage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {systemMessage, setSystemMessage} = useCaseStore();

  useEffect(() => {
    if (systemMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();

      setTimeout(() => {
        setSystemMessage('');
      }, 6000);
    }
  }, [systemMessage]);

  if (!systemMessage) return null;

  return (
    <Animated.View style={[
      styles.messageContainer,
      {opacity: fadeAnim}
    ]}>
      <Pressable onPress={() => setSystemMessage('')}>
        <StyledText style={styles.textContent}>{systemMessage}</StyledText>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: 80,
    left: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c9b88f',
    backgroundColor: '#e6d8b8'
  },
  textContent: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    padding: 12
  }
});