import {useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {DeductionResult} from '../types/case';

export default function DeductionScreen() {
  const navigation = useNavigation<any>();

  const {
    case: caseData,
    deductionState,
    submitDeduction,
    boardLinks
  } = useCaseStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!caseData) return null;

  const handleSubmit = () => {
    if (!selectedId || isSubmitting) return;

    // Мягкий UX-хинт, если игрок вообще не фиксировал рассуждения
    if (boardLinks.length === 0) {
      Alert.alert(
        'Вы уверены?',
        'Вы не зафиксировали свои рассуждения на доске.',
        [
          {text: 'Продолжить', style: 'cancel'},
          {
            text: 'Сделать вывод',
            onPress: () => commitDeduction()
          }
        ]
      );
      return;
    }

    commitDeduction();
  };

  const commitDeduction = () => {
    setIsSubmitting(true);

    const result = submitDeduction(selectedId!);

    handleResult(result.result);
    setIsSubmitting(false);
  };

  const handleResult = (result: DeductionResult) => {
    switch (result) {
      case 'failed':
        // остаёмся на экране
        return;

      case 'partial':
        // даём продолжить расследование
        // UX-решение: просто остаёмся
        return;

      case 'success':
        navigation.replace('CaseResult');
        return;

      default:
        return;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Что, по-вашему, произошло?
      </Text>

      <View style={styles.options}>
        {caseData.deductions.map(deduction => {
          const selected = selectedId === deduction.id;

          return (
            <Pressable
              key={deduction.id}
              onPress={() => setSelectedId(deduction.id)}
              style={[
                styles.option,
                selected && styles.optionSelected
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected
                ]}
              >
                {deduction.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={!selectedId || isSubmitting}
        style={[
          styles.submit,
          (!selectedId || isSubmitting) &&
          styles.submitDisabled
        ]}
      >
        <Text style={styles.submitText}>
          Сделать вывод
        </Text>
      </Pressable>

      <Text style={styles.attempts}>
        Осталось попыток: {deductionState.attemptsLeft}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 24,
    justifyContent: 'space-between'
  },

  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 24,
    fontWeight: '600'
  },

  options: {
    flex: 1
  },

  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#151515',
    marginBottom: 12
  },

  optionSelected: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#444'
  },

  optionText: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22
  },

  optionTextSelected: {
    color: '#fff'
  },

  submit: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    marginTop: 16
  },

  submitDisabled: {
    opacity: 0.4
  },

  submitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600'
  },

  attempts: {
    marginTop: 12,
    textAlign: 'center',
    color: '#777',
    fontSize: 13
  }
});