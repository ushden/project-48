import React, {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {useCaseStore} from '../store/caseStore';
import {casesMeta} from '../data';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyledText} from '../components/StyledText';

export default function DeductionDialogueScreen() {
  const navigation = useNavigation<any>();
  const {
    case: caseData,
    submitDeduction,
    lastOutcome
  } = useCaseStore();

  const [phase, setPhase] = useState<'intro' | 'choice' | 'reaction'>('intro');

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, {duration: 400});
    translateY.value = withTiming(0, {duration: 400});
  }, [phase]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}]
  }));

  if (!caseData) return null;

  const caseMeta = casesMeta.find(c => c.id === caseData.id);

  if (!caseMeta) return null;

  const dialogueData = caseData.deductionDialogue;
  const reactions = caseData.reactions;

  const handleSelect = (id: string) => {
    const outcome = submitDeduction(id);
    if (!outcome) return;

    setPhase('reaction');

    setTimeout(() => {
      navigation.replace('CaseResult');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Portrait */}
      <Image
        source={caseMeta.introDialogue.source}
        style={styles.portrait}
        resizeMode="cover"
      />

      <Animated.View style={[styles.dialogueBlock, animatedStyle]}>
        {phase === 'intro' && (
          <>
            <StyledText style={styles.name}>
              {dialogueData.characterName}
            </StyledText>

            <StyledText style={styles.text}>
              {dialogueData.introText}
            </StyledText>

            <Pressable
              style={styles.continueButton}
              onPress={() => setPhase('choice')}
            >
              <StyledText style={styles.continueText}>
                Відповісти
              </StyledText>
            </Pressable>
          </>
        )}

        {phase === 'choice' && (
          <>
            <StyledText style={styles.name}>
              Ви
            </StyledText>

            {caseData.deductions.map(d => (
              <Pressable
                key={d.id}
                style={styles.option}
                onPress={() => handleSelect(d.id)}
              >
                <StyledText style={styles.optionText}>
                  {d.text}
                </StyledText>
              </Pressable>
            ))}
          </>
        )}

        {phase === 'reaction' && lastOutcome && (
          <>
            <StyledText style={styles.name}>
              {dialogueData.characterName}
            </StyledText>

            <StyledText style={styles.text}>
              {reactions[lastOutcome.resultType]}
            </StyledText>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 10,
    paddingHorizontal: 24
  },
  portrait: {
    width: '100%',
    height: 450,
    borderRadius: 55,
    alignSelf: 'center',
    marginBottom: 40
  },
  dialogueBlock: {
    marginTop: 20
  },
  name: {
    fontSize: 12,
    color: '#6f6f6f',
    letterSpacing: 1,
    marginBottom: 8
  },
  text: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    marginBottom: 40
  },
  continueButton: {
    paddingVertical: 14
  },
  continueText: {
    color: '#9a9a9a'
  },
  option: {
    marginBottom: 22
  },
  optionText: {
    fontSize: 15,
    color: '#d0d0d0',
    lineHeight: 22
  }
});