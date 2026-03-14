import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {Dimensions, Image, Pressable, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {useCaseStore} from '../store/caseStore';
import {CaseHubProgressStatus} from '../types/case';
import {StyledText} from '../components/StyledText';

const {width, height} = Dimensions.get('window');

export default function CaseHubScreen() {
  const navigation = useNavigation<any>();

  const {
    caseHub,
    case: caseData,
    updateCaseHubObjectStatus,
    activeCaseId,
    hasUnreadLogEntries,
    setActiveHypothesis
  } = useCaseStore();

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
          if (!caseData) return;

          if (caseHub.board !== 'visited') {
            updateCaseHubObjectStatus('board', 'visited');
          }

          setActiveHypothesis(caseData.deductions[0].id);

          navigation.navigate('MindBoard');
        }}
        state={caseHub.board}
      />

      {/* Journal */}
      <CaseHubObject
        image={require('../../assets/casehub/case_file.png')}
        title="Журнал"
        style={styles.journal}
        onPress={() => {
          if (caseHub.journal !== 'visited') {
            updateCaseHubObjectStatus('journal', 'visited');
          }

          navigation.navigate('Log');
        }}
        state={caseHub.journal}
        tooltip={hasUnreadLogEntries ? 'Новий допис' : ''}
      />

      {/* Questions */}
      <CaseHubObject
        image={require('../../assets/casehub/notepad.webp')}
        title="Записник"
        style={styles.questions}
        onPress={() => {
          if (caseHub.notepad !== 'visited') {
            updateCaseHubObjectStatus('notepad', 'visited');
          }

          navigation.navigate('Questions');
        }}
        state={caseHub.notepad}
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
  tooltip?: string;
};

function CaseHubObject(data: CaseHubObjectProps) {
  const {image, title, onPress, style, imgStyle, state, tooltip} = data;

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
      {tooltip && (<StyledText style={styles.objectTooltip}>{tooltip}</StyledText>)}
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
  objectTooltip: {
    position: 'absolute',
    top: 20,
    zIndex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#cfcfcf',
    paddingHorizontal: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,60,255,0.4)'
  },
  /* Positions */
  board: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.05,
    left: width * 0.02,
    width: 280,
    height: 280
  },
  journal: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.72,
    left: width * 0.01,
    width: 200,
    height: 200
  },
  questions: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.77,
    left: width * 0.55,
    width: 160,
    height: 160
  },
  crimeScene: {
    position: 'absolute',
    zIndex: 999,
    top: height * 0.4,
    left: width * 0.2,
    width: 130,
    height: 130
  },
  witnesses: {
    top: height * 0.55,
    left: width * 0.01,
    width: 130,
    height: 130
  },
  phone: {
    top: height * 0.55,
    right: width * 0.1,
    width: 150,
    height: 150
  },
  visited: {
    opacity: 0.8
  }
});