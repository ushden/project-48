import {useEffect, useRef, useState} from 'react';
import {Animated, Image, Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {casesIndex} from '../data';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {CaseMeta, CaseStatus} from '../types/case';
import {CaseDot} from '../components/CaseDot';

export default function CaseMapScreen() {
  const cardAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<any>();

  const loadCase = useCaseStore(s => s.loadCase);
  const progress = useCaseStore(s => s.casesProgress);
  const activeCaseId = useCaseStore(s => s.activeCaseId);
  const addLog = useCaseStore(s => s.addLog);
  const hasLogFlag = useCaseStore(s => s.hasLogFlag);
  const setLogFlag = useCaseStore(s => s.setLogFlag);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(casesIndex[0].id);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedCase = casesIndex.find(
    c => c.id === selectedCaseId
  );


  useEffect(() => {
    if (!hasLogFlag('map_intro')) {
      addLog(
        'evidence',
        'Город выглядит спокойным. Но я знаю — тишина здесь обманчива.',
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

  function isUnlocked(c: CaseMeta) {
    if (!c.unlockConditions.length) return true;
    return c.unlockConditions.every(cond => {
      if (cond.type === 'caseCompleted') {
        return progress[cond.caseId]?.status === 'completed';
      }
      return true;
    });
  }

  function getCaseMapState(caseMeta?: CaseMeta): CaseStatus {
    if (!caseMeta) return 'locked';

    const done = progress[caseMeta.id]?.status === 'completed';
    const isActive = activeCaseId === caseMeta.id;

    if (done) return 'completed';
    if (isActive) return 'active';

    return isUnlocked(caseMeta) ? 'available' : 'locked';
  }

  const state = getCaseMapState(selectedCase);
  const actionLabel =
    state === 'active' ? 'Продолжить' :
      state === 'available' ? 'Начать дело' :
        state === 'completed' ? 'Завершено' :
          'Недоступно';

  const actionDisabled = state === 'locked' || state === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.settingsButton}
        onPress={() => setSettingsOpen(true)}
      >
        <Image source={require('../assets/icon-settings.png')} />
      </Pressable>

      <StyledText style={styles.name}>The Quiet City</StyledText>
      <View style={styles.map}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedCaseId(null)}>
          <Image
            source={require('../../assets/world_map_dark.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
        </Pressable>

        {casesIndex.map(c => {
          const state = getCaseMapState(c);

          return (
            <CaseDot
              key={c.id}
              state={state}
              caseMeta={c}
              selectedCaseId={selectedCaseId}
              setSelectedCaseId={setSelectedCaseId}
            />
          );
        })}
      </View>

      {/* Нижняя панель дела */}
      {selectedCase && (
        <View
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
            Region: {selectedCase.description}
          </StyledText>

          <DifficultyDots
            value={selectedCase.difficulty}
          />

          <Pressable
            style={styles.button}
            disabled={actionDisabled}
            onPress={() => {
              if (state === 'locked') {
                if (!hasLogFlag(`locked_attempt_${selectedCase.id}`)) {
                  addLog(
                    'system',
                    'Я тороплюсь. Без нужного опыта это расследование только запутает меня.',
                    'hint'
                  );
                  setLogFlag(`locked_attempt_${selectedCase.id}`);
                }
                return;
              }

              if (state === 'available' || state === 'active') {
                loadCase(selectedCase.id);
                navigation.navigate('EvidenceList');
              }
            }}
          >
            <StyledText style={styles.buttonText}>
              {actionLabel}
            </StyledText>
          </Pressable>
        </View>
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
  name: {
    fontFamily: 'Cormorant',
    textAlign: 'center',
    color: 'white',
    fontSize: 55,
    paddingTop: 80
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32
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