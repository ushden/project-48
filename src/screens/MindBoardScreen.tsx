import React, {useEffect, useMemo, useState} from 'react';
import {Image, ImageBackground, Pressable, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import HypothesisSlider from '../components/HypothesisSlider';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyledText} from '../components/StyledText';
import {NoteCard} from '../components/NoteCard';
import {SystemMessage} from '../components/SystemMessage';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import EvidencePickerSheet from '../components/EvidencePickerSheet';
import {
  getAvailableEvidence,
  getEvidenceBySection,
  getHypothesisProgress,
  getSectionsForHypothesis
} from '../store/selectors/boardSelectors';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MindBoard'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

export default function MindBoardScreen({navigation}: Props) {
  const runtime = useCaseStore(s => s.runtime);
  const caseData = useCaseStore(s => s.case);

  const toggleEvidenceOnSection = useCaseStore(s => s.toggleEvidenceOnSection);
  const setActiveHypothesis = useCaseStore(s => s.setActiveHypothesis);
  const setSystemMessage = useCaseStore(s => s.setSystemMessage);
  const hasFlag = useCaseStore(s => s.hasFlag);
  const setFlag = useCaseStore(s => s.setFlag);

  const board = runtime.board;
  const hypothesisId = board.activeHypothesisId;
  const deductions = caseData?.deductions || [];

  const sections = useMemo(() => getSectionsForHypothesis(deductions, hypothesisId), [deductions, hypothesisId]);
  const sectionEvidence = useMemo(() => getEvidenceBySection(runtime, hypothesisId), [runtime, hypothesisId]);
  const availableEvidence = useMemo(() => getAvailableEvidence(runtime, hypothesisId), [runtime, hypothesisId]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFlag('mind_board_first_visit')) {
      setSystemMessage('Дошка розслідування\n' +
        '\n' +
        'Перегортай версії зверху\n' +
        'Приколюй до них факти\n' +
        'Версія має пояснювати все\n' +
        'Інакше це лише здогад'
      );
      setFlag('mind_board_first_visit');
    }
  }, []);

  function openPicker(sectionId: string) {
    setSelectedSection(sectionId);
    setPickerVisible(true);
  }

  function handleSelectEvidence(evidenceId: string) {
    if (!selectedSection || !hypothesisId) return;

    toggleEvidenceOnSection(selectedSection, evidenceId);

    setPickerVisible(false);
  }

  function handleDeduction() {
    if (!hypothesisId) return;

    const {total, done} = getHypothesisProgress(sections, runtime, hypothesisId);

    if (total !== done) {
      setSystemMessage('Нееееее, шось не так. Подивись уважно на дошку, сформуй теорію. Я ХЗ, тут нада робить шось таке, чи ні. ААААаа')

      return;
    }

    navigation.navigate('DeductionDialogue');
  }

  if (!caseData) return null;

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
              setSystemMessage('Дошка розслідування\n' +
                '\n' +
                'Перегортай версії зверху\n' +
                'Приколюй до них факти\n' +
                'Версія має пояснювати все\n' +
                'Інакше це лише здогад'
              );
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

        <ScrollView style={styles.boardArea} showsVerticalScrollIndicator={false}>
          {sections.map(section => {
            const evidenceIds = sectionEvidence[section.id] || [];
            const expected = section.requiredEvidence?.length || 0;
            const isValid =
              section.requiredEvidence?.every(e => evidenceIds.includes(e)) &&
              evidenceIds.length === expected;

            return (
              <View
                key={section.id}
                style={styles.section}
              >
                <StyledText
                  style={styles.sectionTitle}
                >
                  {section.title} ({evidenceIds.length}/{expected})
                  {isValid ? ' ✓' : ''}
                </StyledText>
                <View style={styles.sectionContent}>
                  {evidenceIds.map(id => {
                    const evidence = caseData.evidence[id];

                    if (!evidence) return null;

                    return (
                      <NoteCard
                        key={id}
                        title={evidence.title}
                        description={evidence.description}
                        onPress={() => toggleEvidenceOnSection(section.id, id)}
                      />
                    );
                  })}
                  <TouchableOpacity
                    style={styles.addEvidence}
                    onPress={() => openPicker(section.id)}
                    activeOpacity={0.7}
                  >
                    <StyledText style={styles.addEvidenceText}>
                      Додати доказ
                    </StyledText>
                  </TouchableOpacity>

                </View>

              </View>
            );
          })}
        </ScrollView>

        <View style={styles.deductionContainer}>
          <TouchableOpacity
            style={styles.deductionButton}
            onPress={handleDeduction}
            activeOpacity={0.9}
          >
            <StyledText style={styles.deductionText}>
              СФОРМУВАТИ ВИСНОВОК
            </StyledText>
          </TouchableOpacity>
        </View>

        <EvidencePickerSheet
          visible={pickerVisible}
          evidenceIds={availableEvidence}
          evidenceMap={caseData.evidence}
          onSelect={handleSelectEvidence}
          onClose={() => setPickerVisible(false)}
        />
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
    paddingHorizontal: 16
  },
  section: {
    marginBottom: 28,
    padding: 6
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12
  },
  sectionContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8
  },
  addEvidence: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderColor: '#fff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  addEvidenceText: {
    color: '#fff',
    fontSize: 14
  },
  deductionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#444'
  },
  deductionButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  deductionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
});
