import {useEffect} from 'react';
import {Dimensions, Image, Pressable, View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

const {width, height} = Dimensions.get('window');

export default function CrimeSceneScreen() {
  const navigation = useNavigation();

  const activeCase = useCaseStore(s => s.activeCase);
  const sceneProgress = useCaseStore(s => s.sceneProgress);
  const markScenePoint = useCaseStore(s => s.markScenePoint);
  const addEvidence = useCaseStore(s => s.addEvidence);
  const addLog = useCaseStore(s => s.addLog);
  const setFlag = useCaseStore(s => s.setFlag);

  const scene = activeCase?.crimeScene;

  useEffect(() => {
    if (!scene) return;

    addLog({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      importance: 'story',
      text: 'Я осматриваю место происшествия.'
    });
  }, []);

  if (!scene) {
    return null;
  }

  const discovered =
    sceneProgress[scene.id]?.discoveredPoints ?? [];

  function handlePointPress(point) {
    if (discovered.includes(point.id)) return;

    markScenePoint(scene.id, point.id);

    switch (point.type) {
      case 'evidence':
        addEvidence(point.payload.evidenceId);
        addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text: 'Этот объект может иметь значение.'
        });
        break;

      case 'log':
        addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text: point.payload.text
        });
        break;

      case 'choice':
        setFlag(point.payload.flag);
        addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text: 'Я обратил внимание на одну деталь.'
        });
        break;

      case 'empty':
        addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text: 'Здесь нет ничего важного.'
        });
        break;
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

          return (
            <Pressable
              key={point.id}
              onPress={() => handlePointPress(point)}
              style={[
                styles.point,
                {
                  left,
                  top,
                  opacity: isFound ? 0.4 : 1
                }
              ]}
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
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },
  point: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  back: {
    position: 'absolute',
    bottom: 24,
    left: 16,
  },
});