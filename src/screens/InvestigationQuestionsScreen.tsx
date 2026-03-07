import React, {useEffect} from 'react';
import {ScrollView, View, StyleSheet, Pressable} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {Question} from '../types/case';
import {checkConditions} from '../engine/conditions';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';

const AnimatedView = Animated.createAnimatedComponent(View);

type QuestionData = {
  resolvedCount: number;
  questions: Question[];
};

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Questions'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Questions'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function InvestigationQuestionsScreen({route, navigation}: Props) {
  const isIntro = route?.params?.isIntro;
  const questionsData = useCaseStore(s => s.case?.investigation?.questions || []);
  const investigationState = useCaseStore(s => s.investigation);

  const {questions, resolvedCount} = questionsData.reduce<QuestionData>((acc, q) => {
    const isResolved = checkConditions(q.resolveConditions, investigationState);

    if (isResolved) {
      acc.resolvedCount += 1;

      q.resolved = true;
      q.questionHint = q.resolveConditions.map(i => i.hint || '').filter(Boolean).join(', ');
    } else {
      q.resolved = false;
    }

    acc.questions.push(q);

    return acc;
  }, {resolvedCount: 0, questions: []});

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>Питання справи</StyledText>

      <ScrollView contentContainerStyle={styles.list}>
        {questions.map((q, index) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={index}
          />
        ))}
      </ScrollView>

      <View style={styles.progressBox}>
        {!isIntro && (
          <Pressable
            // style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <StyledText style={styles.backText}>← Назад</StyledText>
          </Pressable>
        )}
        <StyledText style={styles.progressText}>
          Прогрес: {resolvedCount} / {questions.length}
        </StyledText>
      </View>

      {isIntro && (
        <Pressable style={styles.introButton} onPress={() => {
          navigation.replace('CaseHub');
        }}>
          <StyledText style={styles.introText}>Почати справу</StyledText>
        </Pressable>
      )}
    </View>
  );
}

function QuestionItem({question, index}: {question: Question; index: number}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, {duration: 350}));
    translateY.value = withDelay(index * 80, withTiming(0, {duration: 350}));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}]
  }));

  return (
    <AnimatedView style={[styles.questionRow, animatedStyle]}>
      <StyledText style={[styles.checkbox, question.resolved && styles.checkboxResolved]}>
        {question.resolved ? '✓' : '□'}
      </StyledText>

      <View style={styles.questionTextContainer}>
        <StyledText style={[
          styles.questionText,
          question.resolved && styles.resolvedText
        ]}>
          {question.text}
        </StyledText>

        {question.resolved && question.questionHint && (
          <StyledText style={styles.evidenceNote}>
            {question.questionHint}
          </StyledText>
        )}

        <View style={styles.notebookLine} />
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    paddingHorizontal: 20,
    paddingVertical: 50
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 1,
    color: '#000',
  },
  list: {
    paddingBottom: 40
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18
  },
  checkbox: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    color: '#000',
  },
  checkboxResolved: {
    color: '#2c6e49'
  },
  questionTextContainer: {
    flex: 1
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
  },
  resolvedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6
  },
  notebookLine: {
    height: 1,
    backgroundColor: '#7fa1c3',
    marginTop: 6,
    opacity: 0.5
  },
  back: {
    position: 'absolute',
    bottom: 51,
    left: 16
  },
  backText: {
    color: '#000'
  },
  progressBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#d6d0c4',
    paddingTop: 12
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#000',
    textAlign: 'right'
  },
  evidenceNote: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
    fontStyle: "italic",
    color: '#000',
  },
  introButton: {
    width: '100%',
    paddingVertical: 20,
    marginTop: 20,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#000',
  },
  introText: {
    color: '#000',
    textAlign: 'center',
  },
});