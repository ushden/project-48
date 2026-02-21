import {StyleSheet} from 'react-native';
import {useEffect} from 'react';
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useCaseStore} from './src/store/caseStore';
import EvidenceListScreen from './src/screens/EvidenceListScreen';
import DialogueScreen from './src/screens/DialogueScreen';
import EvidenceDetailScreen from './src/screens/EvidenceDetailScreen';
import DeductionScreen from './src/screens/DeductionScreen';
import CaseResultScreen from './src/screens/CaseResultScreen';
import InvestigationLogScreen from './src/screens/InvestigationLogScreen';
import MindBoardScreen from './src/screens/MindBoardScreen';
import CaseMapScreen from './src/screens/CaseMapScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const loadGame = useCaseStore(s => s.loadGame);
  const [loaded, error] = useFonts({
    Cormorant: require('./assets/fonts/CormorantGaramond-Bold.ttf'),
    LibreBold: require('./assets/fonts/LibreBaskerville-Bold.ttf'),
    LibreRegular: require('./assets/fonts/LibreBaskerville-Regular.ttf'),
    LibreMedium: require('./assets/fonts/LibreBaskerville-Medium.ttf'),
    LibreSemiBold: require('./assets/fonts/LibreBaskerville-SemiBold.ttf'),
  });

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      setTimeout(() => SplashScreen.hideAsync(), 2000);
    }
  }, [loaded, error]);

  if (!loaded) {
    return null;
  }

  if (error) {
    console.warn(error);
  }

  return (
    <NavigationContainer>
      <StatusBar hidden />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: '#1f1f1f'},
          headerTintColor: 'white'
        }}
      >
        <Stack.Screen
          name="Main"
          component={CaseMapScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="EvidenceList"
          component={EvidenceListScreen}
          options={{title: 'Evidence'}}
        />
        <Stack.Screen
          name="EvidenceDetail"
          component={EvidenceDetailScreen}
          options={{title: 'Evidence'}}
        />
        <Stack.Screen
          name="Dialogue"
          component={DialogueScreen}
          options={{title: 'Interview'}}
        />
        <Stack.Screen
          name="Deduction"
          component={DeductionScreen}
          options={{title: 'Deduction'}}
        />
        <Stack.Screen
          name="CaseResult"
          component={CaseResultScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Log"
          component={InvestigationLogScreen}
          options={{title: 'Log'}}
        />
        <Stack.Screen
          name="Board"
          component={MindBoardScreen}
          options={{title: 'Board'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
