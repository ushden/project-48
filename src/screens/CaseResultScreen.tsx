import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useCaseStore} from '../store/caseStore';

export default function CaseResultScreen() {
  const navigation = useNavigation<any>();

  const {
    case: caseData,
    getEnding,
    calculateRating,
    deductionState,
    calculateLinkScore,
    completeActiveCase
  } = useCaseStore();

  if (!caseData) return null;

  const ending = getEnding();
  const rating = calculateRating();
  const linkScore = calculateLinkScore();

  const summary = buildSummary({
    attemptsLeft: deductionState.attemptsLeft,
    linkScore
  });

  const handleContinue = () => {
    completeActiveCase();
    navigation.replace('CaseMap');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.closed}>Дело закрыто</Text>

      <Text style={styles.title}>{caseData.title}</Text>

      <View style={styles.ratingWrapper}>
        <Text style={styles.rating}>{rating}</Text>
      </View>

      <Text style={styles.ending}>{ending?.text}</Text>

      <View style={styles.divider} />

      <Text style={styles.summary}>{summary}</Text>

      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          Вернуться к карте
        </Text>
      </Pressable>
    </View>
  );
}

function buildSummary(data: {
  attemptsLeft: number;
  linkScore: number;
}) {
  const {attemptsLeft, linkScore} = data;

  if (attemptsLeft === 3)
    return 'Вы не торопились с выводами и внимательно изучили детали.';

  if (attemptsLeft === 2)
    return 'Вы сомневались, но продолжили расследование.';

  if (attemptsLeft <= 1)
    return 'Вы действовали решительно, рискуя ошибиться.';

  if (linkScore > 6)
    return 'Ваши рассуждения были связными и последовательными.';

  return 'Вы дошли до истины, но путь был непростым.';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    padding: 24,
    justifyContent: 'space-between'
  },

  closed: {
    color: '#777',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8
  },

  ratingWrapper: {
    alignSelf: 'center',
    marginVertical: 24
  },

  rating: {
    fontSize: 64,
    fontWeight: '700',
    color: '#e5e5e5'
  },

  ending: {
    color: '#ddd',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center'
  },

  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 24
  },

  summary: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },

  button: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#e5e5e5',
    alignItems: 'center'
  },

  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600'
  }
});