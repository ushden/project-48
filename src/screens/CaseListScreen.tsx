import {Pressable, StyleSheet, Text, View} from 'react-native';
import {casesIndex} from '../data';
import {useCaseStore} from '../store/caseStore';
import {useNavigation} from '@react-navigation/native';
import {StyledText} from '../components/StyledText';

export default function CaseListScreen() {
  const navigation = useNavigation<any>();
  const loadCase = useCaseStore(s => s.loadCase);
  const resetGame = useCaseStore(s => s.resetGame);
  const progress = useCaseStore(s => s.casesProgress);

  return (
    <View style={styles.container}>
      <Pressable onPress={resetGame} style={{backgroundColor: '#2a2a2a', padding: 12, borderRadius: 8}}>
        <StyledText style={{color: 'white', textAlign: 'center'}}>
          RESET PROGRESS
        </StyledText>
      </Pressable>

      <StyledText style={styles.title}>
        Cases
      </StyledText>

      {casesIndex.map(c => {
        const state = progress[c.id];

        return (
          <Pressable
            key={c.id}
            style={styles.card}
            onPress={() => {
              loadCase(c.id);
              navigation.navigate('EvidenceList');
            }}
          >
            <StyledText style={styles.caseTitle}>
              {c.title}
            </StyledText>

            <StyledText style={styles.desc}>
              {c.description}
            </StyledText>

            {state?.status === 'completed' && (
              <StyledText style={styles.rating}>
                Rating: {state.rating}
              </StyledText>
            )}
          </Pressable>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212'
  },
  title: {
    color: 'white',
    fontSize: 22,
    marginBottom: 16
  },
  card: {
    backgroundColor: '#1f1f1f',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  caseTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  desc: {
    color: '#aaa',
    marginTop: 6
  },
  rating: {
    color: '#ffd700',
    marginTop: 8
  }
});
