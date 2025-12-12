import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import WelcomeScreen from './src/screens/WelcomeScreen';
import WaitingScreen from './src/screens/WaitingScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';
import DemographicScreen from './src/screens/DemographicScreen';
import ResultsScreen from './src/screens/ResultsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Waiting"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ title: 'Ultimatum Game' }}
        />
        <Stack.Screen 
          name="Waiting" 
          component={WaitingScreen}
          options={{ title: 'Finding Match', headerBackVisible: false }}
        />
        <Stack.Screen 
          name="Lobby" 
          component={LobbyScreen}
          options={{ title: 'Game Lobby', headerBackVisible: false }}
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen}
          options={{ title: 'Game Round', headerBackVisible: false }}
        />
        <Stack.Screen 
          name="Demographic" 
          component={DemographicScreen}
          options={{ title: 'Demographic Questions' }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{ title: 'Results' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

