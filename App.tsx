import {FunctionComponent, useEffect} from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from "expo-screen-orientation";
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {useCaseStore} from './src/store/caseStore';
import CaseHubScreen from './src/screens/CaseHubScreen';
import DialogueScreen from './src/screens/DialogueScreen';
import DeductionDialogueScreen from './src/screens/DeductionDialogueScreen';
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
import InvestigationQuestionsScreen from './src/screens/InvestigationQuestionsScreen';

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
    LibreFranklinRegular: require('./assets/fonts/LibreFranklin-Regular.ttf'),
    SweetMavka: require('./assets/fonts/Sweet-Mavka-Script.ttf'),
  });

  useEffect(() => {
    (async () => {
      await NavigationBar.setBackgroundColorAsync('#000000');
      await NavigationBar.setButtonStyleAsync('light');

      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
    })();
  }, []);

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
          name="CaseMap"
          component={CaseMapScreen}
        />
        <Stack.Screen
          name="CaseHub"
          component={CaseHubScreen}
        />
        <Stack.Screen
          name="Questions"
          component={InvestigationQuestionsScreen as FunctionComponent}
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
          name="DeductionDialogue"
          component={DeductionDialogueScreen}
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
          component={PhoneChatScreen as any}
        />
        <Stack.Screen
          name="PhoneNotes"
          component={PhoneNotesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
