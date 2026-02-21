import {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

export default function CaseResultScreen() {
  const navigation = useNavigation<any>();
  const ending = useCaseStore(s => s.getEnding());

  if (!ending) return null;

  const completeCase = useCaseStore(s => s.completeCase);

  useEffect(() => {
    completeCase();
  }, []);

  return (
    <View style={styles.container}>
      {ending.secret && (
        <StyledText style={styles.secret}>
          Secret Ending Unlocked
        </StyledText>
      )}

      <StyledText style={styles.title}>
        {ending.title}
      </StyledText>

      <StyledText style={styles.text}>
        {ending.text}
      </StyledText>

      <Pressable
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <StyledText style={styles.buttonText}>
          Close case
        </StyledText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#121212'
  },
  secret: {
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 12
  },
  title: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12
  },
  text: {},
  description: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24
  },
  rating: {
    color: '#ffd700',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  }
});
