import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import {AppIcon} from '../components/AppIcon';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import PhoneFrame from '../components/PhoneFrame';
import {StyledText} from '../components/StyledText';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneHome'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

export default function PhoneHomeScreen({navigation}: Props) {
  const {case: caseData} = useCaseStore();

  const hasMessages = !!caseData?.victimPhone?.messages?.length;
  const hasNotes = !!caseData?.victimPhone?.notes?.length;

  return (
    <PhoneFrame>
      <Image
        source={require('../../assets/phone_bg.jpg')}
        style={[
          StyleSheet.absoluteFill,
        ]}
        resizeMode="cover"
      />
      <View style={styles.container}>
        <View style={styles.dateTimeContainer}>
          <StyledText style={styles.time}>
            {new Date().getHours()}:{new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()}
          </StyledText>
          <StyledText style={styles.date}>
            {new Date().getDate()}.{new Date().getMonth() + 1 < 10 ? '0' + new Date().getMonth() : new Date().getMonth()}.{new Date().getFullYear()}
          </StyledText>
        </View>

        <View style={styles.grid}>
          <AppIcon
            icon="chatbubble-ellipses-outline"
            label="Сообщения"
            highlight={hasMessages}
            onPress={() => navigation.navigate('PhoneMessages')}
          />

          <AppIcon
            icon="document-text-outline"
            label="Заметки"
            highlight={hasNotes}
            onPress={() => navigation.navigate('PhoneNotes' as any)}
          />

        </View>
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    // backgroundColor: '#181818'
  },
  dateTimeContainer: {
    flexDirection: 'column',
    marginBottom: 40
  },
  time: {
    fontSize: 58,
    color: '#e0e0e0',
    textAlign: 'center'
  },
  date: {
    fontSize: 18,
    color: '#5c6b78',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20
  }
});