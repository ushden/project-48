import {StatusBar} from 'expo-status-bar';
import {StyleSheet, Text, View} from 'react-native';
import {useEffect} from "react";
import {useCaseStore} from "./src/store/caseStore";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import EvidenceListScreen from "./src/screens/EvidenceListScreen";
import DialogueScreen from "./src/screens/DialogueScreen"
import EvidenceDetailScreen from "./src/screens/EvidenceDetailScreen";
import DeductionScreen from "./src/screens/DeductionScreen"
import CaseResultScreen from "./src/screens/CaseResultScreen"
import InvestigationLogScreen from "./src/screens/InvestigationLogScreen"
import CaseListScreen from './src/screens/CaseListScreen';
import MindBoardScreen from './src/screens/MindBoardScreen';

const Stack = createNativeStackNavigator()

export default function App() {
  const loadGame = useCaseStore(s => s.loadGame)

  const unlocked = useCaseStore(s => s.unlockedEvidence)
  console.log(unlocked)

  useEffect(() => {
    loadGame();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#1f1f1f" },
          headerTintColor: "white"
        }}
      >
        <Stack.Screen
          name="Cases"
          component={CaseListScreen}
          options={{ title: "Investigations" }}
        />
        <Stack.Screen
          name="EvidenceList"
          component={EvidenceListScreen}
          options={{ title: "Evidence" }}
        />
        <Stack.Screen
          name="EvidenceDetail"
          component={EvidenceDetailScreen}
          options={{ title: "Evidence" }}
        />
        <Stack.Screen
          name="Dialogue"
          component={DialogueScreen}
          options={{ title: "Interview" }}
        />
        <Stack.Screen
          name="Deduction"
          component={DeductionScreen}
          options={{ title: "Deduction" }}
        />
        <Stack.Screen
          name="CaseResult"
          component={CaseResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Log"
          component={InvestigationLogScreen}
          options={{ title: "Log" }}
        />
        <Stack.Screen
          name="Board"
          component={MindBoardScreen}
          options={{ title: "Board" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
