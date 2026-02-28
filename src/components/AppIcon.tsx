import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import React from 'react';

type Props = {
  icon: string;
  label: string;
  onPress: () => void;
  highlight?: boolean;
};

export function AppIcon(props: Props) {
  const {icon, label, onPress, highlight} = props;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.iconWrapper,
        pressed && {opacity: 0.6}
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon as any}
          size={28}
          color={highlight ? '#e6e6e6' : '#888'}
        />

        {highlight && <View style={styles.dot} />}
      </View>

      <Text style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center'
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: '#a0a0a0'
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7b1e1e'
  }
});