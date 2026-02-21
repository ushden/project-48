import {useEffect} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from '../components/StyledText';

export default function EvidenceDetailScreen() {
  const route = useRoute<any>();
  const {evidenceId} = route.params;

  const caseData = useCaseStore(s => s.case);
  const spendTime = useCaseStore(s => s.spendTime);

  useEffect(() => {
    spendTime('openEvidence');
  }, []);


  const evidence = caseData?.evidence.find(
    e => e.id === evidenceId
  );

  if (!evidence) {
    return (
      <View style={styles.center}>
        <StyledText style={{color: 'white'}}>
          Evidence not found
        </StyledText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StyledText style={styles.title}>
        {evidence.title}
      </StyledText>

      <StyledText style={styles.type}>
        {evidence.type}
      </StyledText>

      <StyledText style={styles.content}>
        {evidence.content}
      </StyledText>

    </ScrollView>
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  type: {
    color: '#aaa',
    marginBottom: 16
  },
  content: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 22
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212'
  }
});
