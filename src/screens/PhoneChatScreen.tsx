import React, {useEffect} from 'react';
import {StyleSheet, View, FlatList, Image, Pressable} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useCaseStore} from '../store/caseStore';
import PhoneFrame from '../components/PhoneFrame';
import {RootStackParamList} from '../types/navigation';
import {MessageBubble} from '../components/MessageBubble';
import {StyledText} from '../components/StyledText';
import {Ionicons} from '@expo/vector-icons';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'PhoneChat'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneChat'>;

interface Props {
  route: GameScreenRouteProp;
  navigation: GameScreenNavigationProp;
}

export default function PhoneChatScreen({route, navigation}: Props) {
  const {chat} = route.params;

  const {unlockEvidence} = useCaseStore();

  useEffect(() => {
    const evidenceToUnlock = chat.messages.find(m => m.unlocksEvidence);

    if (evidenceToUnlock?.unlocksEvidence) {
      unlockEvidence(evidenceToUnlock.unlocksEvidence);
    }
  }, []);

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
            {chat.name}
          </StyledText>
        </Pressable>

        <FlatList
          data={chat.messages}
          keyExtractor={(item) => item.text}
          renderItem={({item, index}) => (
            <MessageBubble message={item} index={index} />
          )}
          contentContainerStyle={{paddingBottom: 20}}
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
  header: {
    fontSize: 18,
    paddingBottom: 5,
    color: '#d0d0d0',
  }
});