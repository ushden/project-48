import React from 'react';
import {Dimensions, Image, Pressable, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {FloatingJournalButton} from '../components/FloatingJournalButton';
import {CaseHubProgressStatus} from '../types/case';
import {StyledText} from '../components/StyledText';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width, height} = Dimensions.get('window');

export default function CaseHubScreen() {
  const navigation = useNavigation<any>();

  const {caseHub, updateCaseHubObjectStatus, activeCaseId} = useCaseStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      <Pressable
        style={styles.headerButton}
        onPress={() => {
          navigation.navigate('Main');
        }}
      >
        <Image
          source={require('../../assets/home_icon.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      </Pressable>

      {/* Background */}
      <Image
        source={require('../../assets/casehub/desk_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Crime Scene */}
      {caseHub.crimeScene !== 'locked' && (
        <CaseHubObject
          image={require('../../assets/casehub/crime_scene.png')}
          title="Місце злочину"
          style={styles.crimeScene}
          onPress={() => {
            updateCaseHubObjectStatus('crimeScene', 'visited');
            navigation.navigate('CrimeScene', {caseId: activeCaseId, crimeSceneId: 'office_scene'});
          }}
          state={caseHub.crimeScene}
        />
      )}

      {/* Witnesses */}
      {caseHub.witnesses !== 'locked' && (
        <CaseHubObject
          image={require('../../assets/casehub/witnesses.png')}
          title="Свідки"
          style={styles.witnesses}
          onPress={() => {
            updateCaseHubObjectStatus('witnesses', 'visited');
            navigation.navigate('Witnesses', {caseId: activeCaseId});
          }}
          state={caseHub.witnesses}
        />
      )}

      {/* Victim Phone */}
      {caseHub.victimPhone !== 'locked' && (
        <CaseHubObject
          image={require('../../assets/casehub/phone.png')}
          title="Телефон жертви"
          style={styles.phone}
          onPress={() => {
            updateCaseHubObjectStatus('victimPhone', 'visited');
            navigation.navigate('VictimPhone');
          }}
          state={caseHub.victimPhone}
        />
      )}

      {/* Floating UI */}
      <FloatingJournalButton />
      <Pressable
        style={styles.mindBoardButton}
        onPress={() => navigation.navigate('MindBoard')}
      >
        <Image
          resizeMode="cover"
          source={require('../../assets/brainstrom.png')}
        />
      </Pressable>
    </SafeAreaView>
  );
}

type CaseHubObjectProps = {
  image: any;
  title: string;
  state: CaseHubProgressStatus;
  onPress: () => void;
  style: any;
};

function CaseHubObject(data: CaseHubObjectProps) {
  const {image, title, onPress, style, state} = data;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.objectWrapper,
        state === 'visited' && styles.visited,
        style
      ]}
    >
      <StyledText style={styles.objectTitle}>{title}</StyledText>
      <Image source={image} style={styles.objectImage} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115'
  },
  headerButton: {
    position: 'absolute',
    zIndex: 100,
    top: 24,
    right: 10,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mindBoardButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '110%'
  },
  objectWrapper: {
    position: 'absolute',
    alignItems: 'center'
  },
  objectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  objectTitle: {
    marginTop: 6,
    fontSize: 16,
    color: '#cfcfcf',
    opacity: 0.8
  },
  /* Positions */
  crimeScene: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.15,
    left: width * 0.28,
    width: 180,
    height: 180
  },
  witnesses: {
    top: height * 0.4,
    left: width * -0.05,
    width: 180,
    height: 180
  },
  phone: {
    top: height * 0.45,
    right: width * -0.05,
    width: 180,
    height: 180
  },
  visited: {
    opacity: 0.6
  }
});