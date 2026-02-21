import {Pressable, StyleSheet, Text} from 'react-native';
import {Evidence} from '../types/case';
import {StyledText} from './StyledText';

type Props = {
  evidence: Evidence
  onPress: () => void
}

export default function EvidenceCard({evidence, onPress}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <StyledText style={styles.title}>{evidence.title}</StyledText>
      <StyledText style={styles.type}>{evidence.type}</StyledText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#1f1f1f',
    borderRadius: 8
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  type: {
    color: '#aaa',
    marginTop: 4
  }
});
