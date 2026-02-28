import React from 'react';
import {FlatList, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useCaseStore} from '../store/caseStore';
import PhoneFrame from '../components/PhoneFrame';
import {Messages} from '../types/case';
import {RootStackParamList} from '../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import {Ionicons} from '@expo/vector-icons';
import {StyledText} from '../components/StyledText';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneMessages'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

export default function PhoneMessagesScreen({navigation}: Props) {
  const {case: caseData} = useCaseStore();

  const messages = caseData?.victimPhone?.messages || [];

  return (
    <PhoneFrame>
      <Image
        source={require('../../assets/phone_bg.jpg')}
        style={[
          StyleSheet.absoluteFill
        ]}
        resizeMode="cover"
      />
      <View style={styles.container}>
        <Pressable
          style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20}}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color="#e6e6e6"
          />
          <StyledText style={styles.header}>
            Сообщения
          </StyledText>
        </Pressable>


        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}: {item: Messages}) => (
            <Pressable
              style={styles.chatItem}
              onPress={() =>
                navigation.navigate('PhoneChat', {
                  chat: item
                })
              }
            >
              <View style={styles.row}>
                <View style={{flex: 1}}>
                  <Text style={styles.contact}>
                    {item.name}
                  </Text>
                  <Text style={styles.preview}>
                    {item.messages[item.messages.length - 1].text}
                  </Text>
                </View>

                <Text style={styles.time}>
                  {item.messages[item.messages.length - 1].time}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  time: {
    fontSize: 11,
    color: '#5c6b78',
    marginLeft: 10
  },
  header: {
    fontSize: 18,
    color: '#d0d0d0',
    paddingBottom: 5,
  },
  chatItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  contact: {
    color: '#e6e6e6',
    fontSize: 14,
    marginBottom: 4
  },
  preview: {
    color: '#8a8a8a',
    fontSize: 12
  }
});