import {ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {useEffect} from 'react';

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function LogScreen() {
  const log = useCaseStore(s => s.log);
  const markAsRead = useCaseStore(s => s.markLogAsRead);

  useEffect(() => {
    markAsRead();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {log.length === 0 && (
            <StyledText style={styles.empty}>
              Записів наразі немає.
            </StyledText>
          )}

          {log.map(entry => (
            <View key={entry.id} style={styles.entry}>
              <StyledText style={styles.date}>
                {formatDate(entry.timestamp)}
              </StyledText>

              <StyledText
                style={[
                  styles.text,
                  entry.importance === 'hint' && styles.hint,
                  entry.importance === 'story' && styles.story
                ]}
              >
                {entry.text}
              </StyledText>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a1a1d' // внешний фон
  },
  page: {
    flex: 1,
    backgroundColor: '#1a1a1d'
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f2efe9', // "бумага"
    minHeight: '100%'
  },
  entry: {
    marginBottom: 28
  },
  date: {
    fontSize: 12,
    color: '#6b6b6b',
    marginBottom: 6,
    fontFamily: 'InterRegular'
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: '#1e1e1e',
  },
  hint: {
    color: '#3a4a6a'
  },
  story: {
    color: '#2a2a2a',
    fontFamily: 'LibreBold'
  },
  empty: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 40,
    textAlign: 'center'
  },
});