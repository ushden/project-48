import {StyleSheet, Text} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from './StyledText';

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function CaseStatus() {
  const attempts = useCaseStore(s => s.deductionState.attemptsLeft);
  const timeLeft = useCaseStore(s => s.timeLeft);
  const links = useCaseStore(s => s.boardLinks.length);


  return (
    <StyledText style={styles.status}>
      Links: {links} • Attempts: {attempts} • Time: {formatTime(timeLeft)}
    </StyledText>
  );
}

const styles = StyleSheet.create({
  status: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8
  }
});
