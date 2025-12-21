import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import EndGameScreen from './screens/EndGameScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  React.useEffect(() => {
    // Lock to landscape orientation
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

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
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="EndGame" component={EndGameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

