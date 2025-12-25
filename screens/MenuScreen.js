import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function MenuScreen({ navigation }) {
  const [playerCount, setPlayerCount] = useState(4);

  // Lock to landscape orientation when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }, [])
  );

  const handleStartGame = () => {
    navigation.navigate('PlayerSetup', { playerCount });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tragic Life</Text>

        <View style={styles.playerSelection}>
          <Text style={styles.label}>Declare the amount of athletes</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setPlayerCount(Math.max(2, playerCount - 1))}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.countText}>{playerCount}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setPlayerCount(Math.min(6, playerCount + 1))}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#aaa',
    marginBottom: 60,
  },
  playerSelection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  countText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});

