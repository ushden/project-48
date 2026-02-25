import {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from './StyledText';

export const SystemMessage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {systemMessage, setSystemMessage} = useCaseStore();

  useEffect(() => {
    if (systemMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();

      setTimeout(() => {
        setSystemMessage('');
      }, 4000);
    }
  }, [systemMessage]);

  if (!systemMessage) return null;

  return (
    <Animated.View style={[
      styles.messageContainer,
      {opacity: fadeAnim}
    ]}>
      <StyledText style={styles.textContent}>{systemMessage}</StyledText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: 50,
    left: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'rgba(250,250,250,0.35)'
  },
  textContent: {
    textAlign: 'center',
    fontSize: 16,
    color: '#ccc',
    padding: 12
  }
});