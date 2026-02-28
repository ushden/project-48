import React, {useEffect} from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {StyleSheet, View} from 'react-native';

import {Message} from '../types/case';
import {StyledText} from './StyledText';

export function MessageBubble({message, index}: {message: Message, index: number}) {
  const isOwner = message.from === 'owner';

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withDelay(
      index * 60,
      withTiming(1, {duration: 300})
    );

    translateY.value = withDelay(
      index * 60,
      withTiming(0, {duration: 300})
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}]
  }));

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        isOwner && styles.ownerWrapper,
        animatedStyle
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwner && styles.ownerBubble
        ]}
      >
        <StyledText
          style={[
            styles.messageText,
            isOwner && styles.ownerText
          ]}
        >
          {message.text}
        </StyledText>
      </View>

      <StyledText style={styles.time}>
        {message.time}
      </StyledText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    fontSize: 16,
    color: '#d0d0d0',
    marginBottom: 20
  },
  messageWrapper: {
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  ownerWrapper: {
    alignItems: 'flex-end'
  },
  bubble: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 14,
    maxWidth: '75%'
  },
  ownerBubble: {
    backgroundColor: '#2a2a2a'
  },
  messageText: {
    color: '#e6e6e6',
    fontSize: 14,
    lineHeight: 20
  },
  ownerText: {
    color: '#ffffff'
  },
  time: {
    fontSize: 10,
    color: '#5c6b78',
    marginTop: 4
  }
});