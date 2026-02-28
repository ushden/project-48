import {useEffect, useRef, useState} from 'react';
import {Animated, Image, Platform, Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {casesData, casesMeta} from '../data';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {CaseData, CaseStatus} from '../types/case';
import {CaseDot} from '../components/CaseDot';
import {StatusBar} from 'expo-status-bar';
import Settings from '../components/Settings';

function GameTitle() {
  return (
    <View style={styles.nameContainer} pointerEvents="none">
      <StyledText style={styles.name}>The Quiet City</StyledText>
    </View>
  );
}

export default function CaseMapScreen() {
  const cardAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<any>();

  const loadCase = useCaseStore(s => s.loadCase);
  const progress = useCaseStore(s => s.casesProgress);
  const activeCaseId = useCaseStore(s => s.activeCaseId);
  const addLog = useCaseStore(s => s.addLog);
  const hasLogFlag = useCaseStore(s => s.hasLogFlag);
  const setLogFlag = useCaseStore(s => s.setLogFlag);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(casesMeta[0].id);

  const selectedCase = casesData[selectedCaseId || ''];

  useEffect(() => {
    if (!hasLogFlag('map_intro')) {
      addLog(
        'evidence',
        'Місто виглядає спокійним. Але я знаю – тиша тут оманлива.',
        'story'
      );
      setLogFlag('map_intro');
    }
  }, []);

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: selectedCase ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [selectedCase]);

  function isUnlocked(c: CaseData) {
    if (!c.unlockConditions.length) return true;
    return c.unlockConditions.every(cond => {
      if (cond.type === 'caseCompleted') {
        return !!progress[cond.caseId]?.completed;
      }
      return true;
    });
  }

  function getCaseMapState(caseData?: CaseData): CaseStatus {
    if (!caseData) return 'locked';

    const done = !!progress[caseData.id]?.completed;
    const isActive = activeCaseId === caseData.id;

    if (done) return 'completed';
    if (isActive) return 'active';

    return isUnlocked(caseData) ? 'available' : 'locked';
  }

  const state = getCaseMapState(selectedCase);
  const actionLabel =
    state === 'active' ? 'Продовжити' :
      state === 'available' ? 'Почати справу' :
        state === 'completed' ? 'Завершено' :
          'Недоступно';

  const actionDisabled = state === 'locked' || state === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <Settings/>

      <GameTitle />

      <View style={styles.map}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedCaseId(null)}>
          <Image
            source={require('../../assets/world_map_dark.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </Pressable>

        {casesMeta.map(c => {
          const _case = casesData[c.id];
          const state = getCaseMapState(_case);

          return (
            <CaseDot
              key={_case.id}
              state={state}
              caseData={_case}
              selectedCaseId={selectedCaseId}
              setSelectedCaseId={setSelectedCaseId}
            />
          );
        })}
      </View>

      {/* Нижняя панель дела */}
      {selectedCase && (
        <Animated.View
          style={[
            styles.panel,
            {
              opacity: cardAnim,
              transform: [
                {
                  translateY: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <StyledText style={styles.title}>
            {selectedCase.title}
          </StyledText>

          <StyledText style={styles.meta}>
            Опис: {selectedCase.description}
          </StyledText>

          <DifficultyDots
            value={selectedCase.difficulty}
          />

          <Pressable
            style={styles.button}
            disabled={actionDisabled}
            onPress={() => {
              const caseMeta = casesMeta.find(c => c.id === selectedCaseId);

              if (state === 'locked') {
                if (!hasLogFlag(`locked_attempt_${selectedCase.id}`)) {
                  addLog(
                    'system',
                    'Я поспішаю. Без потрібного досвіду це розслідування лише заплутає мене.',
                    'hint'
                  );
                  setLogFlag(`locked_attempt_${selectedCase.id}`);
                }
                return;
              }

              if (state === 'active') {
                navigation.navigate('CaseHub');
              }

              if (state === 'available') {
                const caseData = loadCase(selectedCase.id);

                if (!caseData) {
                  console.log('Something went wrong');

                  return;
                }

                navigation.replace('Dialogue', {
                  portrait: caseMeta?.introDialogue,
                  dialogue: caseData.introDialogue,
                  onFinishAction: 'replace',
                  nextScreen: 'CaseHub'
                });
              }
            }}
          >
            <StyledText style={styles.buttonText}>
              {actionLabel}
            </StyledText>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

function DifficultyDots({value}: {value: number}) {
  return (
    <View style={styles.difficulty}>
      {Array.from({length: 5}).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < value && styles.dotActive
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100d13'
  },
  nameContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 80,
    left: 0,
    right: 0,
    zIndex: 99,

    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  name: {
    fontFamily: 'Cormorant',
    fontSize: 55,
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#d8d8d8',
    opacity: 0.9
  },
  map: {
    flex: 1
  },
  mapImage: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 18, 25, 0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10
  },
  title: {
    color: 'white',
    fontSize: 18,
    marginBottom: 6
  },
  meta: {
    color: '#aaa',
    marginBottom: 10
  },
  difficulty: {
    flexDirection: 'row',
    marginBottom: 12
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444',
    marginRight: 6
  },
  dotActive: {
    backgroundColor: '#ffd700'
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  }
});