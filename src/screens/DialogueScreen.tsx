import {useEffect, useState} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Dialogue'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dialogue'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function DialogueScreen({route, navigation}: Props) {
  const {dialogue, portrait, onFinishAction, nextScreen, nextParams, witnessState} = route.params;
  const [index, setIndex] = useState(0);
  const addLog = useCaseStore(s => s.addLog);
  const setWitnessFlag = useCaseStore(s => s.setWitnessFlag);

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
        setWitnessFlag(witnessState.witnessId, witnessState.key, witnessState.value);
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

  return (
    <Pressable style={styles.container} onPress={next}>
      {portrait && (
        <Image
          source={portrait.source}
          resizeMode="contain"
          style={[
            styles.portrait,
            !portrait.position ? styles.center : portrait.position === 'right'
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