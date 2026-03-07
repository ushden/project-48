import {useEffect, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {StyledText} from '../components/StyledText';
import {casesMeta} from '../data';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Dialogue'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dialogue'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function DialogueScreen({route, navigation}: Props) {
  const {dialogue, caseId, onFinishAction, nextScreen, nextParams, witnessState, portrait} = route.params;
  const caseMeta = casesMeta.find(c => c.id === caseId);
  const witnessMeta = caseMeta?.witness?.find(w => w.id === witnessState?.witnessId || '');
  const [index, setIndex] = useState(0);
  const addLog = useCaseStore(s => s.addLog);
  const markDialogueSeen = useCaseStore(s => s.markDialogueSeen);

  useEffect(() => {
    const removeListener = navigation.addListener('beforeRemove', e => {
      const type = (e.data.action.type || '').toLowerCase();

      if (!type || (type !== 'replace' && type !== 'navigate')) {
        e.preventDefault();
      }
    });

    return () => {
      removeListener();
    };
  }, [navigation]);

  const line = dialogue.lines[index];

  const next = () => {
    if (line?.log) {
      addLog(line.log.type, line.text, line.log.importance);
    }

    if (index + 1 < dialogue.lines.length) {
      setIndex(i => i + 1);
    } else {
      if (witnessState) {
        markDialogueSeen(witnessState.witnessId);
      } else {
        markDialogueSeen(dialogue.id);
      }

      if (onFinishAction === 'replace') {
        navigation.replace(nextScreen!, nextParams);
      } else if (onFinishAction === 'navigate') {
        navigation.navigate(nextScreen!, nextParams);
      } else {
        navigation.goBack();
      }
    }
  };

  if (!line) return null;

  const source = portrait === 'intro' ? caseMeta?.introDialogue.source : witnessMeta?.dialoguePortrait.source;
  const position = portrait === 'intro' ? caseMeta?.introDialogue.position : witnessMeta?.dialoguePortrait.position;

  return (
    <Pressable style={styles.container} onPress={next}>
      {source && (
        <Image
          source={source}
          resizeMode="contain"
          style={[
            styles.portrait,
            !position ? styles.center : position === 'right'
              ? styles.right
              : styles.left
          ]}
        />
      )}

      <View style={styles.bubble}>
        <StyledText style={styles.speaker}>
          {dialogue.speaker}
        </StyledText>
        <StyledText style={styles.text}>
          {line.text}
        </StyledText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: '#000'
  },
  speaker: {
    color: '#fff',
    marginBottom: 12
  },
  portrait: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  center: {},
  left: {},
  right: {},
  bubble: {
    backgroundColor: '#111',
    padding: 40,
    paddingLeft: 18,
    paddingRight: 1,
    borderRadius: 12
  },
  text: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22
  }
});