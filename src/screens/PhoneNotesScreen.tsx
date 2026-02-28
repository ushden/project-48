import React, {useEffect} from 'react';
import {FlatList, Image, Pressable, StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {useCaseStore} from '../store/caseStore';
import PhoneFrame from '../components/PhoneFrame';
import {Ionicons} from '@expo/vector-icons';
import {StyledText} from '../components/StyledText';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/navigation';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhoneNotes'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

function AnimatedNoteCard({text, date, index}: {text: string; date: string; index: number}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, {duration: 350})
    );

    translateY.value = withDelay(
      index * 80,
      withTiming(0, {duration: 350})
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}]
  }));

  return (
    <Animated.View style={[styles.noteCard, animatedStyle]}>
      {date && (
        <StyledText style={styles.noteDate}>
          {date}
        </StyledText>
      )}
      <StyledText style={styles.noteText}>
        {text}
      </StyledText>
    </Animated.View>
  );
}

export default function PhoneNotesScreen({navigation}: Props) {
  const {case: caseData, addLog} = useCaseStore();

  const notes = caseData?.victimPhone?.notes || [];

  useEffect(() => {
    notes.forEach(note => {
      if (note.log) {
        addLog(note.log.type, note.text, note.log.importance);
      }
    });
  }, []);

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
            Нотатки
          </StyledText>
        </Pressable>

        <FlatList
          data={notes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item, index}) => (
            <AnimatedNoteCard
              text={item.text}
              index={index}
              date={item.date}
            />
          )}
          contentContainerStyle={{paddingBottom: 40}}
        />
      </View>
    </PhoneFrame>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20
  },
  header: {
    fontSize: 16,
    color: '#d0d0d0',
    paddingBottom: 5
  },
  noteCard: {
    backgroundColor: '#202020',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,

    borderWidth: 1,
    borderColor: '#2a2a2a',

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4}
  },
  noteDate: {
    fontSize: 11,
    color: '#5f6b78',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  noteText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 22
  }
});