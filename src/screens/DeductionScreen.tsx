import {useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import CaseStatus from '../components/CaseStatus';
import {StyledText} from '../components/StyledText';

function CenterMessage({text}: {text: string}) {
  return (
    <View style={styles.center}>
      <StyledText style={{color: 'white'}}>{text}</StyledText>
    </View>
  );
}

export default function DeductionScreen() {
  const navigation = useNavigation<any>();

  const caseData = useCaseStore(s => s.case);
  const isUnlocked = useCaseStore(s => s.isUnlocked);
  const checkDeduction = useCaseStore(s => s.checkDeduction);
  const spendTime = useCaseStore(s => s.spendTime);
  const deductionState = useCaseStore(s => s.deductionState);
  const addLog = useCaseStore(s => s.addLog);

  useEffect(() => {
    addLog('dialogue', `Interview started`);
  }, []);


  const [selected, setSelected] = useState<string[]>([]);

  if (!caseData) {
    return (
      <View style={styles.center}>
        <StyledText style={{color: 'white'}}>
          Loading deduction…
        </StyledText>
      </View>
    );
  }

  if (deductionState.status === 'failed') {
    return (
      <CenterMessage text="Investigation failed." />
    );
  }

  if (deductionState.status === 'solved') {
    return (
      <CenterMessage text="Case solved!" />
    );
  }

  const unlockedEvidence = caseData.evidence.filter(e =>
    isUnlocked(e.id)
  );

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const onCheck = () => {
    const correct = checkDeduction(selected);

    spendTime('wrongDeduction');

    navigation.navigate('CaseResult', {
      success: correct
    });
  };


  return (
    <View style={styles.container}>
      <CaseStatus />

      <StyledText style={styles.title}>
        Deduction Board
      </StyledText>
      <StyledText style={styles.attempts}>
        Attempts left: {deductionState.attemptsLeft}
      </StyledText>

      <FlatList
        data={unlockedEvidence}
        keyExtractor={e => e.id}
        renderItem={({item}) => {

          const active = selected.includes(item.id);

          return (
            <Pressable
              style={[
                styles.card,
                active && styles.active
              ]}
              onPress={() => toggle(item.id)}
            >
              <StyledText style={styles.text}>
                {item.title}
              </StyledText>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={styles.check}
        onPress={onCheck}
      >
        <StyledText style={styles.checkText}>
          Check deduction
        </StyledText>
      </Pressable>
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
    fontSize: 20,
    marginBottom: 16
  },
  card: {
    padding: 14,
    marginVertical: 6,
    backgroundColor: '#1f1f1f',
    borderRadius: 8
  },
  active: {
    backgroundColor: '#3a3a3a'
  },
  text: {
    color: 'white'
  },
  check: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    marginTop: 16,
    borderRadius: 8
  },
  checkText: {
    color: 'white',
    textAlign: 'center'
  },
  result: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 12
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  },
  attempts: {
    color: '#aaa',
    marginBottom: 10
  }
});
