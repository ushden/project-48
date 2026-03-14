import React, {useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

function buildSummary(
  resultType: 'success' | 'partial' | 'failed'
) {
  if (resultType === 'success')
    return 'Ви зібрали факти та вибудували послідовну версію подій.';

  if (resultType === 'partial')
    return 'Версія виглядає переконливою, але деякі деталі вимагають перегляду.';

  return 'Факти не підтверджують вибрану версію. Можливо, ви пропустили важливі деталі.';
}

export default function CaseResultScreen() {
  const navigation = useNavigation<any>();
  const {
    case: caseData,
    lastOutcome,
    completeActiveCase
  } = useCaseStore();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, {duration: 500});
    translateY.value = withTiming(0, {duration: 500});
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}]
  }));

  if (!caseData || !lastOutcome) return null;

  const {resultType, ratingScore, ratingGrade, endingId} = lastOutcome;

  const ending = caseData.endings.find(e => e.id === endingId);

  const headerText =
    resultType === 'success'
      ? 'Справу закрито'
      : resultType === 'partial'
        ? 'Версія потребує детальнішого розгляду'
        : 'Висновок не підтверджено';

  const summaryText = buildSummary(resultType);

  const handleCloseCase = () => {
    completeActiveCase();
    navigation.replace('CaseMap');
  };

  const handleContinue = () => {
    navigation.replace('CaseHub');
  };

  const handleRestart = () => {
    navigation.replace('CaseHub');
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <StyledText style={styles.header}>
        {headerText}
      </StyledText>

      <StyledText style={styles.caseTitle}>
        {caseData.title}
      </StyledText>

      {resultType !== 'failed' && (
        <View style={styles.ratingBlock}>
          <StyledText style={styles.ratingScore}>
            {ratingScore}
          </StyledText>
          <StyledText style={styles.ratingLabel}>
            Оцінка розслідування
          </StyledText>
          <StyledText style={styles.ratingGrade}>
            Клас: {ratingGrade}
          </StyledText>
        </View>
      )}

      {ending?.text && (
        <StyledText style={styles.endingText}>
          {ending.text}
        </StyledText>
      )}

      <View style={styles.divider} />

      <StyledText style={styles.summary}>
        {summaryText}
      </StyledText>

      {/* BUTTONS */}

      {resultType === 'success' && (
        <Pressable style={styles.primaryButton} onPress={handleCloseCase}>
          <StyledText style={styles.primaryButtonText}>
            Повернутись до карти справ
          </StyledText>
        </Pressable>
      )}

      {resultType === 'partial' && (
        <>
          <Pressable style={styles.primaryButton} onPress={handleContinue}>
            <StyledText style={styles.primaryButtonText}>
              Продовжити розслідування
            </StyledText>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleCloseCase}>
            <StyledText style={styles.secondaryButtonText}>
              Закрити справу
            </StyledText>
          </Pressable>
        </>
      )}

      {resultType === 'failed' && (
        <Pressable style={styles.primaryButton} onPress={handleRestart}>
          <StyledText style={styles.primaryButtonText}>
            Розпочати розслідування заново
          </StyledText>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 100,
    paddingHorizontal: 24
  },

  header: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 8
  },

  caseTitle: {
    fontSize: 14,
    color: '#8a8a8a',
    marginBottom: 30
  },

  ratingBlock: {
    marginBottom: 30
  },

  ratingScore: {
    fontSize: 48,
    color: '#e0e0e0'
  },

  ratingLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 4
  },

  ratingGrade: {
    fontSize: 14,
    color: '#cfcfcf',
    marginTop: 10
  },

  endingText: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 22,
    marginBottom: 30
  },

  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 20
  },

  summary: {
    fontSize: 13,
    color: '#8a8a8a',
    lineHeight: 20,
    marginBottom: 40
  },

  primaryButton: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },

  primaryButtonText: {
    color: '#e0e0e0'
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },

  secondaryButtonText: {
    color: '#9a9a9a'
  }
});