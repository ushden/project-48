import {FunctionComponent, useEffect} from 'react';
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {useCaseStore} from './src/store/caseStore';
import CaseHubScreen from './src/screens/CaseHubScreen';
import DialogueScreen from './src/screens/DialogueScreen';
import DeductionScreen from './src/screens/DeductionScreen';
import CaseResultScreen from './src/screens/CaseResultScreen';
import LogScreen from './src/screens/LogScreen';
import MindBoardScreen from './src/screens/MindBoardScreen';
import CaseMapScreen from './src/screens/CaseMapScreen';
import CrimeSceneScreen from './src/screens/CrimeSceneScreen';
import WitnessesScreen from './src/screens/WitnessesScreen';
import PhoneHomeScreen from './src/screens/PhoneHomeScreen';
import PhoneMessagesScreen from './src/screens/PhoneMessagesScreen';
import PhoneChatScreen from './src/screens/PhoneChatScreen';
import PhoneNotesScreen from './src/screens/PhoneNotesScreen';

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    background: '#121212',
    card: '#121212',
    text: '#e0e0e0',
    border: '#121212',
    primary: '#c9b27c',
    notification: '#c9b27c'
  }
};

export default function App() {
  const loadGame = useCaseStore(s => s.loadGame);
  const [loaded, error] = useFonts({
    Cormorant: require('./assets/fonts/CormorantGaramond-Bold.ttf'),
    LibreBold: require('./assets/fonts/LibreBaskerville-Bold.ttf'),
    LibreRegular: require('./assets/fonts/LibreBaskerville-Regular.ttf'),
    LibreMedium: require('./assets/fonts/LibreBaskerville-Medium.ttf'),
    LibreSemiBold: require('./assets/fonts/LibreBaskerville-SemiBold.ttf'),
    LibreFranklinRegular: require('./assets/fonts/LibreFranklin-Regular.ttf')
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
    <NavigationContainer theme={theme}>
      <StatusBar hidden />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: '#1f1f1f'},
          cardStyle: {backgroundColor: '#121212'},
          headerTintColor: '#121212',
          animation: 'fade',
          presentation: 'card',
          headerShown: false,
          freezeOnBlur: true
        }}
      >
        <Stack.Screen
          name="Main"
          component={CaseMapScreen}
        />
        <Stack.Screen
          name="CaseHub"
          component={CaseHubScreen}
        />
        <Stack.Screen
          name="Witnesses"
          component={WitnessesScreen as FunctionComponent}
        />
        <Stack.Screen
          name="Dialogue"
          component={DialogueScreen as FunctionComponent}
        />
        <Stack.Screen
          name="Deduction"
          component={DeductionScreen}
        />
        <Stack.Screen
          name="CaseResult"
          component={CaseResultScreen}
        />
        <Stack.Screen
          name="Log"
          component={LogScreen}
        />
        <Stack.Screen
          name="MindBoard"
          component={MindBoardScreen}
        />
        <Stack.Screen
          name="CrimeScene"
          component={CrimeSceneScreen as FunctionComponent}
        />
        <Stack.Screen
          name="PhoneHome"
          component={PhoneHomeScreen}
        />
        <Stack.Screen
          name="PhoneMessages"
          component={PhoneMessagesScreen}
        />
        <Stack.Screen
          name="PhoneChat"
          component={PhoneChatScreen}
        />
        <Stack.Screen
          name="PhoneNotes"
          component={PhoneNotesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
