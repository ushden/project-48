import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

export default function InvestigationLogScreen() {
  const log = useCaseStore(s => s.log);

  return (
    <View style={styles.container}>
      <StyledText style={styles.title}>
        Investigation Log
      </StyledText>

      <FlatList
        data={log}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.entry}>
            <StyledText style={styles.type}>
              [{item.type.toUpperCase()}]
            </StyledText>
            <StyledText style={styles.text}>
              {item.text}
            </StyledText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212'
  },
  title: {
    color: 'white',
    fontSize: 20,
    marginBottom: 16
  },
  entry: {
    marginBottom: 12
  },
  type: {
    color: '#888',
    fontSize: 12
  },
  text: {
    color: '#ddd'
  }
});
