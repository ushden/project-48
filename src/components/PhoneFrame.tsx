import React from 'react';
import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StyledText} from './StyledText';
import {FloatingJournalButton} from './FloatingJournalButton';

const {width, height} = Dimensions.get('window');

export default function PhoneFrame({children}: {children: React.ReactNode}) {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <StyledText style={styles.headerTitle}>Телефон</StyledText>
        <Pressable
          style={styles.headerButton}
          onPress={() => {
            navigation.navigate('CaseHub');
          }}
        >
          <Image
            source={require('../../assets/office_icon.png')}
            style={{width: '100%', height: '100%'}}
            resizeMode="cover"
          />
        </Pressable>
      </View>

      <View style={styles.phoneBody}>
        <View style={styles.speaker} />

        <View style={styles.screen}>
          {children}

          <LinearGradient
            colors={[
              'rgba(255,255,255,0.08)',
              'rgba(255,255,255,0.03)',
              'transparent'
            ]}
            start={{x: 0, y: 0}}
            end={{x: 0.8, y: 0.6}}
            style={styles.glassReflection}
          />
        </View>
      </View>

      <FloatingJournalButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    position: 'absolute',
    top: 30,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 18,
    color: '#e0e0e0',
    marginLeft: 12
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center'
  },
  phoneBody: {
    width: width * 0.88,
    height: height * 0.85,
    backgroundColor: '#0e1111',
    borderRadius: 42,
    padding: 14,

    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 25,
    shadowOffset: {width: 0, height: 20},

    elevation: 30
  },
  speaker: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a1a1a',
    opacity: 0.8
  },
  screen: {
    flex: 1,
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#181818'
  },
  glassReflection: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }
});