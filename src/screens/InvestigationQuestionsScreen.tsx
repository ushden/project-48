import React, {useEffect} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {Condition, EvidenceData, Question} from '../types/case';
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

const getQuestionHintByType = (condition: Condition, evidences: Record<string, EvidenceData>): string => {
  switch (condition.type) {
    case 'dialogueSeen':
      return 'Допит свідка';
    case 'evidenceFound':
      const evidence = evidences[condition.id || ''];

      if (!evidence) {
        return '';
      }

      return `Доказ: ${evidence.title}`;
    case 'messageRead':
      return 'Повідомлення в телефоні';
    case 'notesRead':
      return 'Замітка в телефоні';
    default:
      return '';
  }
};

export default function InvestigationQuestionsScreen({route, navigation}: Props) {
  const isIntro = route?.params?.isIntro;
  const questionsData = useCaseStore(s => s.case?.questions || []);
  const investigationState = useCaseStore(s => s.runtime.investigation);
  const evidences = useCaseStore(s => s.case?.evidence || {});

  const {questions, resolvedCount} = questionsData.reduce<QuestionData>((acc, q) => {
    const isResolved = checkConditions(q.resolveConditions, investigationState);

    if (isResolved) {
      acc.resolvedCount += 1;

      q.resolved = true;
      q.questionHint = q.resolveConditions.map((c) => getQuestionHintByType(c, evidences)).filter(Boolean).join(', ');
    } else {
      q.resolved = false;
    }

    acc.questions.push(q);

    return acc;
  }, {resolvedCount: 0, questions: []});

  return (
    <View style={{flex: 1, width: '100%'}}>
      <Image
        style={styles.bgImage}
        source={require('../../assets/note_bg.webp')}
        resizeMode="cover"
      />
      <View style={styles.container}>

        <StyledText style={styles.title}>Питання справи:</StyledText>

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
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
  },
  title: {
    fontFamily: 'SweetMavka',
    fontSize: 30,
    letterSpacing: 1,
    color: '#002b59',
    marginBottom: 30,
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
    fontSize: 25,
    marginRight: 12,
    width: 28,
    color: '#002b59'
  },
  checkboxResolved: {
    color: '#2c6e49'
  },
  questionTextContainer: {
    flex: 1
  },
  questionText: {
    fontFamily: 'SweetMavka',
    // paddingVertical: 8,
    fontSize: 20,
    lineHeight: 35,
    color: '#002b59'
  },
  resolvedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6
  },
  back: {
    position: 'absolute',
    bottom: 51,
    left: 16
  },
  backText: {
    color: '#002b59'
  },
  progressBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
    color: '#002b59',
    textAlign: 'right'
  },
  evidenceNote: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
    color: '#002b59'
  },
  introButton: {
    width: '100%',
    paddingVertical: 20,
    marginTop: 20,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#000'
  },
  introText: {
    color: '#002b59',
    textAlign: 'center'
  }
});