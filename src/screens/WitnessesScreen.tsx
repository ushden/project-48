import {useEffect} from 'react';
import {FlatList, Image, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useCaseStore} from '../store/caseStore';
import {RootStackParamList} from '../types/navigation';
import {casesData, casesMeta} from '../data';
import {DialogueBlock, Witness} from '../types/case';
import {StyledText} from '../components/StyledText';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Witnesses'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Witnesses'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function WitnessesScreen({navigation, route}: Props) {
  const {caseId} = route.params;

  const caseData = casesData[caseId];
  const witnesses: Witness[] = caseData.witnesses;

  const {seenDialogues} = useCaseStore(s => s.runtime.investigation);

  useEffect(() => {
    const removeListener = navigation.addListener('beforeRemove', e => {
      const type = (e.data.action.type || '').toLowerCase();

      console.log(type);
    });

    return () => {
      removeListener();
    };
  }, [navigation]);

  function openDialogue(witnessId: string) {
    const witness = witnesses.find(w => w.id === witnessId);

    if (!witness) {
      console.log('Witness not found', witnessId);
      return;
    }

    const witnessMeta = casesMeta
      ?.find(c => c.id === caseId)?.witness
      ?.find(w => w.id === witness.id);

    if (!witnessMeta) {
      console.log('Witness meta not found', witnessId);
      return;
    }

    const dialogueBlock: DialogueBlock = {
      id: witness.id,
      speaker: witness.name,
      lines: witness.dialogue
    };

    navigation.navigate('Dialogue', {
      caseId,
      dialogue: dialogueBlock,
      portrait: 'witness',
      witnessState: {
        witnessId: witness.id
      },
      onFinishAction: 'replace',
      nextScreen: 'Witnesses',
      nextParams: {caseId}
    });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <StyledText style={styles.headerTitle}>Свідки</StyledText>
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

      <FlatList
        data={witnesses}
        contentContainerStyle={styles.list}
        keyExtractor={w => w.id}
        renderItem={({item}) => {
          const witnessMeta = casesMeta
            ?.find(c => c.id === caseId)?.witness
            ?.find(w => w.id === item.id);
          const isInterviewed = seenDialogues.has(item.id);

          return (
            <Pressable
              onPress={() => openDialogue(item.id)}
              disabled={!item.isAvailable}
              style={[
                styles.card,
                !item.isAvailable && styles.cardDisabled
              ]}
            >
              <View style={styles.row}>
                {/* Portrait */}
                {witnessMeta && (
                  <View style={styles.portraitWrapper}>
                    <Image
                      source={witnessMeta.listPortrait.source}
                      style={[
                        styles.portrait,
                        isInterviewed && {opacity: 0.45}
                      ]}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* Text */}
                <View style={styles.textBlock}>
                  <StyledText style={styles.name}>{item.name}</StyledText>
                  <StyledText style={styles.description}>{item.description}</StyledText>

                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        isInterviewed
                          ? styles.statusDone
                          : styles.statusNew
                      ]}
                    />
                    <StyledText style={styles.statusText}>
                      {isInterviewed ? 'Опитано' : 'Не опитано'}
                    </StyledText>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 12
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
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center'
  },
  list: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: '#1b1b1b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  cardDisabled: {
    opacity: 0.4
  },
  portraitWrapper: {
    width: 96,
    height: 96,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  portrait: {
    width: '100%',
    height: '100%',
    opacity: 0.85
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textBlock: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontFamily: 'LibreFranklinRegular',
    color: '#e0e0e0'
  },
  description: {
    fontSize: 13,
    color: '#9a9a9a',
    marginTop: 4,
    lineHeight: 18
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 6,
    marginRight: 6
  },
  statusText: {
    fontSize: 12,
    color: '#9a9a9a',
    marginBottom: 3
  },
  statusNew: {
    backgroundColor: '#c9b27c'
  },
  statusDone: {
    backgroundColor: '#6fa06f'
  }
});