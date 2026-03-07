import {useEffect} from 'react';
import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {ScenePoint as ScenePointComp} from '../components/ScenePoint';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {casesData, casesMeta} from '../data';
import {FloatingJournalButton} from '../components/FloatingJournalButton';
import {ScenePoint} from '../types/case';
import {SystemMessage} from '../components/SystemMessage';
import {checkConditions} from '../engine/conditions';

const {width, height} = Dimensions.get('window');

type GameScreenRouteProp = RouteProp<RootStackParamList, 'CrimeScene'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrimeScene'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function CrimeSceneScreen({navigation, route}: Props) {
  const {caseId, crimeSceneId} = route.params;

  const caseMeta = casesMeta.find(c => c.id === caseId);
  const sceneMeta = caseMeta?.scenes?.find(c => c.id === crimeSceneId);

  const caseData = casesData[caseId];
  const scene = caseData?.scenes?.find(c => c.id === crimeSceneId);

  const investigation = useCaseStore(s => s.investigation);

  const markScenePoint = useCaseStore(s => s.markScenePoint);
  const markEvidenceUnlock = useCaseStore(s => s.markEvidenceUnlock);
  const addLog = useCaseStore(s => s.addLog);
  const setLogFlag = useCaseStore(s => s.setLogFlag);
  const hasLogFlag = useCaseStore(s => s.hasLogFlag);
  const setSystemMessage = useCaseStore(s => s.setSystemMessage);

  useEffect(() => {
    if (!scene) return;

    if (!hasLogFlag(scene.id)) {
      addLog(
        'system',
        'Я оглядаю місце події.',
        'story'
      );
      setLogFlag(scene.id);
    }
  }, [scene]);

  if (!scene || !sceneMeta) {
    return null;
  }

  const discovered = investigation.discoveredPoints[scene.id] ?? new Set<string>();

  function handlePointPress(point: ScenePoint) {
    if (discovered.has(point.id) || !scene) return;

    markScenePoint(scene.id, point.id);

    switch (point.type) {
      case 'evidence': {
        markEvidenceUnlock(point.payload.evidenceId);

        setSystemMessage('Цей об\'єкт може мати значення. Потрібно перевірити свої записи');
        break;
      }
      case 'log': {
        addLog(
          'system',
          point.payload.text
        );
        setSystemMessage(point.payload.text);
        break;
      }
      case 'choice': {
        addLog(
          'system',
          'Я звернув увагу на одну деталь.',
          'hint'
        );
        setSystemMessage('Я звернув увагу на одну деталь.');
        break;
      }
      case 'empty': {
        setSystemMessage('Тут немає нічого важливого.');
        break;
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <SystemMessage />
      <View style={styles.container}>
        <Image
          source={sceneMeta.portrait.source}
          style={styles.image}
        />

        {scene.points.map(point => {
          const left = point.x * width;
          const top = point.y * height;
          const isFound = discovered.has(point.id);
          const isAvailable = checkConditions(point.conditions, investigation);

          if (!isAvailable) return null;

          return (
            <ScenePointComp
              left={left}
              top={top}
              key={point.id}
              isDiscovered={isFound}
              onPress={() => handlePointPress(point)}
            />
          );
        })}

        <Pressable
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <StyledText>← Назад</StyledText>
        </Pressable>
      </View>

      <FloatingJournalButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000'
  },
  container: {
    flex: 1
  },
  image: {
    position: 'absolute',
    width,
    height,
    resizeMode: 'cover'
  },
  back: {
    position: 'absolute',
    bottom: 24,
    left: 16
  }
});