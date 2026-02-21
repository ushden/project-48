import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import EvidenceCard from '../components/EvidenceCard';
import CaseStatus from '../components/CaseStatus';
import {StyledText} from '../components/StyledText';

export default function EvidenceListScreen() {
  const navigation = useNavigation<any>();

  const caseData = useCaseStore(s => s.case);
  const timeLeft = useCaseStore(s => s.timeLeft);
  const isUnlocked = useCaseStore(s => s.isUnlocked);

  if (!caseData) {
    return (
      <View style={styles.center}>
        <StyledText style={{color: 'white'}}>Loading case...</StyledText>
      </View>
    );
  }

  const unlockedEvidence = caseData.evidence.filter(e =>
    isUnlocked(e.id)
  );

  return (
    <View style={styles.container}>
      <CaseStatus />

      <StyledText style={styles.header}>
        {caseData.title}
      </StyledText>

      <StyledText style={{color: '#ff9800', marginBottom: 8}}>
        Time left: {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, '0')}
      </StyledText>

      <Pressable
        style={{
          backgroundColor: '#2a2a2a',
          padding: 10,
          marginBottom: 10,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate('Log')}
      >
        <StyledText style={{color: 'white', textAlign: 'center'}}>
          Investigation Log
        </StyledText>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: '#2a2a2a',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate('Dialogue')}
      >
        <StyledText style={{color: 'white', textAlign: 'center'}}>
          Talk to Manager
        </StyledText>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: '#2a2a2a',
          padding: 12,
          marginBottom: 10,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate('Deduction')}
      >
        <StyledText style={{color: 'white', textAlign: 'center'}}>
          Deduction Board
        </StyledText>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: '#2a2a2a',
          padding: 12,
          marginBottom: 10,
          borderRadius: 8
        }}
        onPress={() => navigation.navigate('Board')}
      >
        <StyledText style={{color: 'white', textAlign: 'center'}}>
          Investigation Board
        </StyledText>
      </Pressable>

      <FlatList
        data={unlockedEvidence}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <EvidenceCard
            evidence={item}
            onPress={() =>
              navigation.navigate('EvidenceDetail', {
                evidenceId: item.id
              })
            }
          />
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212'
  },
  header: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  }
});
