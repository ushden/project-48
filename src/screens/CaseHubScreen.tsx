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
          navigation.navigate('CaseMap');
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
        source={require('../../assets/casehub/desk_bg.webp')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Board */}
      <CaseHubObject
        image={require('../../assets/casehub/board_full.png')}
        title="Дошка доказів"
        style={styles.board}
        onPress={() => {
          if (caseHub.case !== 'visited') {
            updateCaseHubObjectStatus('board', 'visited');
          }

          navigation.navigate('MindBoard');
        }}
        state={caseHub.board}
      />

      {/* Case */}
      <CaseHubObject
        image={require('../../assets/casehub/case_file.png')}
        title="Закрити справу"
        style={styles.case}
        // imgStyle={{transform: [{rotateX: '40deg'}]}}
        onPress={() => {
          if (caseHub.case !== 'visited') {
            updateCaseHubObjectStatus('case', 'visited');
          }

          navigation.navigate('DeductionDialogue');
        }}
        state={caseHub.case}
      />

      {/* Questions */}
      <CaseHubObject
        image={require('../../assets/casehub/case_file.png')}
        title="Блокнот (питання справи)"
        style={styles.questions}
        // imgStyle={{transform: [{rotateX: '40deg'}]}}
        onPress={() => {
          if (caseHub.case !== 'visited') {
            updateCaseHubObjectStatus('case', 'visited');
          }

          navigation.navigate('Questions');
        }}
        state={caseHub.case}
      />

      {/* Crime Scene */}
      {caseHub.crimeScene !== 'locked' && (
        <CaseHubObject
          image={require('../../assets/casehub/crime_scene.png')}
          title="Місце злочину"
          style={styles.crimeScene}
          imgStyle={{transform: [{rotateX: '40deg'}]}}
          onPress={() => {
            if (caseHub.crimeScene !== 'visited') {
              updateCaseHubObjectStatus('crimeScene', 'visited');
            }

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
            if (caseHub.witnesses !== 'visited') {
              updateCaseHubObjectStatus('witnesses', 'visited');
            }

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
            if (caseHub.victimPhone !== 'visited') {
              updateCaseHubObjectStatus('victimPhone', 'visited');
            }

            navigation.navigate('PhoneHome');
          }}
          state={caseHub.victimPhone}
        />
      )}

      {/* Floating UI */}
      <FloatingJournalButton />
    </SafeAreaView>
  );
}

type CaseHubObjectProps = {
  image: any;
  title: string;
  state: CaseHubProgressStatus;
  onPress: () => void;
  style: any;
  imgStyle?: any;
};

function CaseHubObject(data: CaseHubObjectProps) {
  const {image, title, onPress, style, imgStyle, state} = data;

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
      <Image source={image} style={[styles.objectImage, imgStyle]} resizeMode="cover" />
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
    textAlign: 'center',
    fontSize: 13,
    color: '#cfcfcf',
    opacity: 0.6
  },
  /* Positions */
  board: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.15,
    left: width * 0.1,
    width: 250,
    height: 250
  },
  case: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.8,
    left: width * 0.02,
    width: 150,
    height: 150
  },
  questions: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.8,
    left: width * 0.38,
    width: 150,
    height: 150
  },
  crimeScene: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.55,
    left: width * 0.4,
    width: 120,
    height: 120
  },
  witnesses: {
    top: height * 0.64,
    left: width * 0.01,
    width: 120,
    height: 120
  },
  phone: {
    top: height * 0.73,
    right: width * 0.01,
    width: 100,
    height: 100
  },
  visited: {
    opacity: 0.8
  }
});