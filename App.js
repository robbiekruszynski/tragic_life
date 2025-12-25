import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from './screens/MenuScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import GameScreen from './screens/GameScreen';
import EndGameScreen from './screens/EndGameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        >
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="EndGame" component={EndGameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

