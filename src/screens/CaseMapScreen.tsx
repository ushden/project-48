import {useState} from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {casesIndex} from '../data';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

const {width, height} = Dimensions.get('window');

export default function CaseMapScreen() {
  const navigation = useNavigation<any>();

  const loadCase = useCaseStore(s => s.loadCase);
  const progress = useCaseStore(s => s.casesProgress);
  const activeCaseId = useCaseStore(s => s.activeCaseId);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(casesIndex[0].id);

  const selectedCase = casesIndex.find(
    c => c.id === selectedCaseId
  );

  return (
    <SafeAreaView style={styles.container}>
      <StyledText style={styles.name}>The Quiet City</StyledText>
      <View style={styles.map}>
        <Image
          source={require('../../assets/world_map_dark.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />
        {/*<View*/}
        {/*  style={{*/}
        {/*    ...StyleSheet.absoluteFillObject,*/}
        {/*    backgroundColor: '#1d3460',*/}
        {/*    opacity: 0.9*/}
        {/*  }}*/}
        {/*/>*/}

        {casesIndex.map(c => {
          const state = progress[c.id]?.status ?? 'available';

          const isActive = c.id === activeCaseId;
          const isSelected = c.id === selectedCaseId;

          const left = c.position.x * width;
          const top = c.position.y * height;

          return (
            <Pressable
              key={c.id}
              style={[
                styles.casePoint,
                {left, top},
                state === 'completed' && styles.completed,
                isActive && styles.active,
                isSelected && styles.selected
              ]}
              onPress={() => setSelectedCaseId(c.id)}
            />
          );
        })}
      </View>

      {/* Нижняя панель дела */}
      {selectedCase && (
        <View style={styles.panel}>
          <StyledText style={styles.title}>
            {selectedCase.title}
          </StyledText>

          <StyledText style={styles.meta}>
            Region: {selectedCase.region}
          </StyledText>

          <DifficultyDots
            value={selectedCase.difficulty}
          />

          <Pressable
            style={styles.button}
            onPress={() => {
              loadCase(selectedCase.id);
              navigation.navigate('EvidenceList');
            }}
          >
            <StyledText style={styles.buttonText}>
              Take case
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
    backgroundColor: '#100d13',
  },
  name: {
    fontFamily: 'Cormorant',
    textAlign: 'center',
    color: 'white',
    fontSize: 55,
    paddingTop: 80,
  },
  map: {
    flex: 1,
  },
  mapImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  casePoint: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0'
  },
  completed: {
    backgroundColor: '#4caf50'
  },
  active: {
    backgroundColor: "#ff9800",
    shadowColor: "#ff9800",
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  selected: {
    borderWidth: 2,
    borderColor: '#ffd700'
  },
  panel: {
    backgroundColor: '#1f1f1f',
    padding: 16
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