import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCaseStore } from '../store/caseStore';
import { StyledText } from './StyledText';

export function FloatingJournalButton() {
  const navigation = useNavigation<any>();
  const hasUnread = useCaseStore(s => s.hasUnreadLogEntries);
  const markAsRead = useCaseStore(s => s.markLogAsRead);

  const hiddenScreens = ['Dialogue', 'Deduction', 'MindBoard'];
  console.log(navigation.route?.name, 'Route name');
  if (hiddenScreens.includes(navigation.route?.name)) {
    return null;
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        markAsRead();
        navigation.navigate('InvestigationLog');
      }}
    >
      <View style={styles.icon}>
        <StyledText style={styles.iconText}>📓</StyledText>
      </View>

      {hasUnread && <View style={styles.dot} />}
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
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(20, 22, 30, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cfa96e', // тёплый, не красный
  },
});