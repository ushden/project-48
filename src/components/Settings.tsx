import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Animated, BackHandler, Modal, Pressable, StyleSheet, View, Image} from 'react-native';
import Fontisto from '@expo/vector-icons/Fontisto';
import {useCaseStore} from '../store/caseStore';
import {StyledText} from './StyledText';

const Settings = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [settingsModalOpened, setSettingsModalOpened] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);

  const {resetGame} = useCaseStore();

  useEffect(() => {
    const backAction = () => {
      if (settingsModalOpened) {
        setSettingsModalOpened(false);
      }

      return confirmModalOpened;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (settingsModalOpened || confirmModalOpened) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [settingsModalOpened, confirmModalOpened]);

  const handleSettingsModalToggle = () => {
    setSettingsModalOpened((s) => !s);
  };

  const handleResetProgress = async () => {
    await resetGame();
    await new Promise(resolve => setTimeout(resolve, 500));
    setConfirmModalOpened(false);
  };

  return (
    <Fragment>
      <Pressable
        style={styles.settingsButton}
        onPress={() => setSettingsModalOpened(true)}
      >
        <Image source={require('../../assets/settings.png')} style={{width: 40, height: 40}} />
      </Pressable>

      <Modal
        visible={settingsModalOpened}
        statusBarTranslucent={false}
        transparent
        animationType="fade"
        onRequestClose={handleSettingsModalToggle}>
        <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}]
              }
            ]}>

            <View style={styles.content}>
              <View style={styles.header}>
                <StyledText style={styles.title}>Налаштування</StyledText>
                <Pressable onPress={handleSettingsModalToggle}>
                  <Fontisto name="close-a" size={18} color="black" />
                </Pressable>
              </View>
              {/*<View style={styles.settings}>*/}
              {/*  <View style={styles.settingsItem}>*/}
              {/*    <StyledText style={styles.label}>Музика</StyledText>*/}
              {/*    <Switch value={settings.musicEnabled} onValueChange={handleChangeMusicMode} />*/}
              {/*  </View>*/}

              {/*  <View style={styles.settingsItem}>*/}
              {/*    <StyledText style={styles.label}>Звуки</StyledText>*/}
              {/*    <Switch value={settings.soundEnabled} onValueChange={handleChangeSoundMode} />*/}
              {/*  </View>*/}

              {/*  <View style={styles.settingsItem}>*/}
              {/*    <StyledText style={styles.label}>Вібрація</StyledText>*/}
              {/*    <Switch*/}
              {/*      value={settings.vibrationEnabled}*/}
              {/*      onValueChange={handleChangeVibrationMode}*/}
              {/*    />*/}
              {/*  </View>*/}
              {/*</View>*/}
              <Pressable
                style={[styles.resetProgressButton]}
                onPress={() => setConfirmModalOpened(true)}
              >
                <StyledText style={styles.resetProgressButtonText}>Скинути прогрес</StyledText>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <Modal
        visible={confirmModalOpened}
        statusBarTranslucent={false}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModalOpened(false)}>
        <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
          <Animated.View
            style={[
              styles.modal,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}]
              }
            ]}>
            <View style={styles.content}>
              <StyledText style={styles.question}>Весь прогрес буде втрачено, Ви впевнені?</StyledText>

              <View style={styles.buttonsContainer}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setConfirmModalOpened(false)}
                >
                  <StyledText style={styles.cancelButtonText}>Закрити</StyledText>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.exitButton]}
                  onPress={handleResetProgress}
                >
                  <StyledText style={styles.exitButtonText}>Підтвердити</StyledText>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    color: '#000',
  },
  content: {
    padding: 24
  },
  settings: {
    flexDirection: 'column'
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  resetProgressButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 0,
    zIndex: 99,
    width: 48,
    height: 48
  },
  resetProgressButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'red'
  },
  question: {
    fontSize: 17,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569'
  },
  exitButton: {
    backgroundColor: '#ef4444'
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff'
  }
});

export default Settings;
