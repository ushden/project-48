import React from 'react';
import {StyleSheet, View} from 'react-native';
import {StyledText} from './StyledText';

type Props = {
  title: string;
  size?: 'small' | 'large';
};

export function NoteCard(props: Props) {
  const {title, size = 'small'} = props;
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.paper,
        isLarge && styles.largePaper
      ]}
    >
      {/* Булавка */}
      <View style={styles.pinWrapper}>
        <View style={styles.pin} />
      </View>

      <StyledText
        style={[
          styles.text,
          isLarge && styles.largeText
        ]}
      >
        {title}
      </StyledText>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#e6d8b8',
    borderRadius: 4,
    padding: 12,
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {width: 2, height: 4},

    borderWidth: 1,
    borderColor: '#c9b88f'
  },

  largePaper: {
    minHeight: 110
  },

  text: {
    color: '#1e1e1e',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16
  },

  largeText: {
    fontSize: 14,
    fontWeight: '600'
  },

  pinWrapper: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    alignItems: 'center'
  },

  pin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7b1e1e',

    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: {width: 1, height: 2}
  }
});