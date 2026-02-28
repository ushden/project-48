import React, {useEffect, useMemo} from 'react';
import {FlatList, Image, ImageBackground, Pressable, StyleSheet, View} from 'react-native';
import Animated, {FadeIn, FadeOut, LinearTransition} from 'react-native-reanimated';
import {useCaseStore} from '../store/caseStore';
import HypothesisSlider from '../components/HypothesisSlider';
import {getEvidencePositions} from '../engine/getEvidencePositions';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyledText} from '../components/StyledText';
import {NoteCard} from '../components/NoteCard';
import {SystemMessage} from '../components/SystemMessage';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MindBoard'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

export default function MindBoardScreen({navigation}: Props) {
  const {
    case: caseData,
    unlockedEvidence,
    board,
    setActiveHypothesis,
    toggleEvidenceForActiveHypothesis,
    updateCaseHubObjectStatus,
    isBoardValidFor,
    setSystemMessage
  } = useCaseStore();

  useEffect(() => {
    updateCaseHubObjectStatus('board', 'visited');
  }, []);

  useEffect(() => {
    if (!board.activeHypothesisId) {
      setActiveHypothesis(caseData?.deductions[0]?.id || '');
    }
  }, [board.activeHypothesisId]);

  if (!caseData) return null;

  const activeHypothesis = caseData.deductions.find(
    d => d.id === board.activeHypothesisId
  );

  const evidenceList = useMemo(() => {
    return Array.from(unlockedEvidence)
      .map(id => caseData.evidence[id])
      .filter(Boolean);
  }, [unlockedEvidence, caseData]);

  const attachedEvidenceIds =
    board.activeHypothesisId
      ? board.hypotheses[board.activeHypothesisId] || []
      : [];

  const attachedEvidence = attachedEvidenceIds
    .map(id => caseData.evidence[id])
    .filter(Boolean);
  const positions = getEvidencePositions(attachedEvidence.length);

  return (
    <ImageBackground
      source={require('../../assets/mind_board.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <SystemMessage />
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              setSystemMessage('Доска расследования\n\nПерелистывай версии сверху\nПрикалывай к ним факты\nВерсия должна объяснять всё\nИначе это всего лишь догадка');
            }}
          >
            <Image
              source={require('../../assets/help.png')}
              style={{width: '100%', height: '100%'}}
              resizeMode="cover"
            />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              navigation.navigate('CaseHub');
            }}
          >
            <Image
              source={require('../../assets/office_icon.png')}
              style={{width: '100%', height: '100%'}}
              resizeMode="cover"
            />
          </Pressable>
        </View>

        <View style={styles.hypothesisContainer}>
          <HypothesisSlider
            deductions={caseData.deductions}
            activeId={board.activeHypothesisId}
            onChange={(id: string) => setActiveHypothesis(id)}
          />
        </View>

        <View style={styles.boardArea}>
          {activeHypothesis && (
            <StyledText style={styles.activeTitle}>
              Гіпотеза
            </StyledText>
          )}

          <View style={StyleSheet.absoluteFill}>
            {attachedEvidence.map((e, index) => {
              const pos = positions[index];
              const rotation = (index % 2 === 0 ? -2 : 2) * 2;

              return (
                <Animated.View
                  key={e.id}
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={LinearTransition.springify()}
                  style={[
                    styles.attachedCard,
                    {
                      position: 'absolute',
                      left: pos.x - 150,
                      top: pos.y - 20,
                      transform: [
                        {rotate: `${rotation}deg`}
                      ]
                    }
                  ]}
                >
                  <Pressable onPress={() => toggleEvidenceForActiveHypothesis(e.id)}>
                    <NoteCard title={e.title} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {board.activeHypothesisId && (
            <StyledText style={styles.status}>
              {isBoardValidFor(board.activeHypothesisId)
                ? 'Версія виглядає цілісною.'
                : 'Є деталі, які не пояснені.'}
            </StyledText>
          )}
        </View>

        <View style={styles.evidenceList}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={evidenceList}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingHorizontal: 16}}
            renderItem={({item}) => {
              const attached = attachedEvidenceIds?.includes(item.id);

              if (attached) return null;

              return (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={LinearTransition.springify()}
                >
                  <Pressable
                    onPress={() =>
                      toggleEvidenceForActiveHypothesis(item.id)
                    }
                    style={styles.evidenceCard}
                  >
                    <StyledText style={styles.evidenceText}>
                      {item.title}
                    </StyledText>
                  </Pressable>
                </Animated.View>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'LibreFranklinRegular',
    color: '#e0e0e0',
    marginLeft: 12
  },
  headerButton: {
    width: 40,
    height: 40
  },
  hypothesisContainer: {
    justifyContent: 'center'
  },
  boardArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-start'
  },
  activeTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center'
  },
  attachedArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  attachedCard: {
    backgroundColor: '#f5e6c8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 4
  },
  status: {
    textAlign: 'center',
    color: '#ddd',
    fontStyle: 'italic'
  },
  evidenceList: {
    height: 110,
    paddingBottom: 20
  },
  evidenceCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    minWidth: 120
  },
  evidenceText: {
    color: '#fff',
    fontSize: 12
  }
});