import {useEffect} from 'react';
import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';
import {isScenePointAvailable} from '../engine/sceneConditions';
import {ScenePoint} from '../components/ScenePoint';

const {width, height} = Dimensions.get('window');

export default function CrimeSceneScreen() {
  const navigation = useNavigation();

  const currentCase = useCaseStore(s => s.case);
  const sceneProgress = useCaseStore(s => s.sceneProgress);
  const unlockedEvidence = useCaseStore(s => s.unlockedEvidence);

  const markScenePoint = useCaseStore(s => s.markScenePoint);
  const unlockEvidence = useCaseStore(s => s.unlockEvidence);
  const addLog = useCaseStore(s => s.addLog);

  const scene = currentCase?.crimeScene;

  useEffect(() => {
    if (!scene) return;

    if (!sceneProgress[scene.id]) {
      addLog(
        'system',
        'Я осматриваю место происшествия.',
        'story'
      );
    }
  }, [scene]);

  if (!scene) {
    return null;
  }

  const discovered =
    sceneProgress[scene.id]?.discoveredPoints ?? [];

  function handlePointPress(point: any) {
    if (discovered.includes(point.id) || !scene) return;

    markScenePoint(scene.id, point.id);

    switch (point.type) {
      case 'evidence': {
        unlockEvidence(point.payload.evidenceId);

        addLog(
          'system',
          'Этот объект может иметь значение.'
        );
        break;
      }
      case 'log': {
        addLog(
          'system',
          point.payload.text
        );
        break;
      }
      case 'choice': {
        addLog(
          'system',
          'Я обратил внимание на одну деталь.',
          'hint'
        );
        break;
      }

      case 'empty': {
        addLog(
          'system',
          'Здесь нет ничего важного.'
        );
        break;
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={{uri: scene.image}}
          style={styles.image}
        />

        {scene.points.map(point => {
          const left = point.x * width;
          const top = point.y * height;
          const isFound = discovered.includes(point.id);
          const isAvailable = isScenePointAvailable(
            point,
            discovered,
            unlockedEvidence
          );

          if (!isAvailable) return null;

          return (
            <ScenePoint
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
    width,
    height,
    resizeMode: 'cover'
  },
  point: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.75)'
  },
  back: {
    position: 'absolute',
    bottom: 24,
    left: 16
  }
});