import {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {tutorialMessages, useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

export default function DialogueScreen() {
  const caseData = useCaseStore(s => s.case);
  const tutorial = useCaseStore(s => s.tutorial);
  const unlockEvidence = useCaseStore(s => s.unlockEvidence);
  const spendTime = useCaseStore(s => s.spendTime);
  const advanceTutorial = useCaseStore(s => s.advanceTutorial);
  const addLog = useCaseStore(s => s.addLog);

  const dialogue = caseData?.dialogues[0];

  const [index, setIndex] = useState(0);

  if (!dialogue) {
    return (
      <View style={styles.center}>
        <StyledText style={{color: 'white'}}>No dialogue</StyledText>
      </View>
    );
  }

  const line = dialogue.lines[index];

  const nextLine = () => {
    line.unlocks?.forEach(unlockEvidence);

    if (index < dialogue.lines.length - 1) {
      setIndex(index + 1);
    }

    spendTime('dialogueStep');

    if (tutorial.enabled && tutorial.step === 1) {
      advanceTutorial(2)
      addLog("system", tutorialMessages[2])
    }
  };

  return (
    <View style={styles.container}>

      <StyledText style={styles.npc}>
        {dialogue.npc}
      </StyledText>

      <StyledText style={styles.text}>
        {line.text}
      </StyledText>

      <Pressable style={styles.button} onPress={nextLine}>
        <StyledText style={styles.buttonText}>
          {index < dialogue.lines.length - 1
            ? 'Continue'
            : 'End Dialogue'}
        </StyledText>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#121212'
  },
  npc: {
    color: '#aaa',
    fontSize: 14
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginVertical: 20
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  }
});
