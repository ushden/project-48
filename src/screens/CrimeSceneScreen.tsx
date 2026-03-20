import {useEffect, useRef, useState} from 'react';
import {Dimensions, GestureResponderEvent, Image, Pressable, StyleSheet, View} from 'react-native';
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
import FlyingComet, {FlyingHintRef} from '../components/FlyingComet';
import {getSceneProgress} from '../store/selectors/sceneSelectors';

const {width, height} = Dimensions.get('window');

type GameScreenRouteProp = RouteProp<RootStackParamList, 'CrimeScene'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrimeScene'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function CrimeSceneScreen({navigation, route}: Props) {
  const {caseId, crimeSceneId} = route.params;

  const cometRef = useRef<FlyingHintRef>(null);
  const journalRef = useRef<any>(null);

  const caseMeta = casesMeta.find(c => c.id === caseId);
  const sceneMeta = caseMeta?.scenes?.find(c => c.id === crimeSceneId);

  const caseData = casesData[caseId];
  const scene = caseData?.scenes?.find(c => c.id === crimeSceneId);

  const investigation = useCaseStore(s => s.runtime.investigation);

  const markScenePoint = useCaseStore(s => s.markScenePoint);
  const markEvidenceUnlock = useCaseStore(s => s.markEvidenceUnlock);
  const addLog = useCaseStore(s => s.addLog);
  const setFlag = useCaseStore(s => s.setFlag);
  const hasFlag = useCaseStore(s => s.hasFlag);
  const setSystemMessage = useCaseStore(s => s.setSystemMessage);

  const [target, setTarget] = useState<{x: number; y: number}>({x: 0, y: 0});

  useEffect(() => {
    journalRef.current?.measure((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
      setTarget({
        x: pageX + w / 2,
        y: pageY + h / 2
      });
    });
  }, [journalRef.current]);

  useEffect(() => {
    if (!scene) return;

    if (!hasFlag(scene.id)) {
      addLog(
        'system',
        'Я оглядаю місце події.',
        'story'
      );
      setFlag(scene.id);
    }
  }, [scene]);

  if (!scene || !sceneMeta) {
    return null;
  }

  const discovered = investigation.discoveredPoints[scene.id] ?? new Set<string>();
  const {total, left} = getSceneProgress(scene.points, discovered);

  function handlePointPress(point: ScenePoint, event: GestureResponderEvent) {
    if (discovered.has(point.id) || !scene) return;

    const {pageX, pageY} = event?.nativeEvent || {};
    const isAvailable = checkConditions(point.conditions, investigation);

    if (!isAvailable) {
      const hints = (point.conditions || [])?.map(c => c.hint).filter(Boolean);

      if (hints?.length) {
        setSystemMessage(hints.join('\n'));
      }

      return;
    }

    markScenePoint(scene.id, point.id);

    switch (point.action.type) {
      case 'evidence': {
        markEvidenceUnlock(point.action.evidenceId, true);

        break;
      }
      case 'inspect': {
        addLog(
          'system',
          point.action.text
        );
        setSystemMessage(point.action.text);
        break;
      }
    }

    if (cometRef.current) {
      cometRef.current.start(pageX, pageY);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <SystemMessage />
      <FlyingComet
        ref={cometRef}
        targetX={target.x}
        targetY={target.y}
        onArrival={() => console.log('Target hit!')}
      />
      <View style={styles.container}>
        <StyledText style={styles.progress}>Прогрес: {left}/{total}</StyledText>
        <Image
          source={sceneMeta.portrait.source}
          style={styles.image}
        />

        {scene.points.map(point => {
          const left = point.x * width;
          const top = point.y * height;

          return (
            <ScenePointComp
              left={left}
              top={top}
              width={point.width}
              height={point.height}
              key={point.id}
              onPress={(event) => handlePointPress(point, event)}
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

      <FloatingJournalButton ref={journalRef}/>
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
  progress: {
    position: 'absolute',
    top: 12,
    left: '38%',
    zIndex: 1,
    color: '#fff',
    fontFamily: 'SweetMavka',
    fontSize: 16,
    letterSpacing: 1,
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