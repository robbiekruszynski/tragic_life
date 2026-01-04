import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

const { height, width } = Dimensions.get('window');
const WHEEL_ITEM_HEIGHT = 30;

export default function MenuScreen({ navigation }) {
  const [playerCount, setPlayerCount] = useState(4);
  const [gameMode, setGameMode] = useState('commander'); // 'commander', 'standard', 'modern', 'pioneer', 'legacy', or 'vintage'
  const scrollViewRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const modes = ['commander', 'legacy', 'modern', 'pioneer', 'standard', 'vintage'];
  const [selectedIndex, setSelectedIndex] = useState(0); // 0 = commander, 1 = legacy, 2 = modern, 3 = pioneer, 4 = standard, 5 = vintage

  // Lock to landscape orientation when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }, [])
  );

  // Update game mode when selected index changes
  useEffect(() => {
    setGameMode(modes[selectedIndex]);
  }, [selectedIndex]);

  // Scroll to selected index on mount
  useEffect(() => {
    scrollToIndex(selectedIndex, false);
  }, []);

  const scrollToIndex = (index, animated = true) => {
    const offset = index * WHEEL_ITEM_HEIGHT;
    scrollViewRef.current?.scrollTo({
      y: offset,
      animated,
    });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, modes.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
    }
  };

  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, modes.length - 1));
    
    scrollToIndex(clampedIndex, true);
    setSelectedIndex(clampedIndex);
  };

  const handleStartGame = () => {
    navigation.navigate('PlayerSetup', { playerCount, gameMode });
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
              onPress={() => setPlayerCount(Math.min(4, playerCount + 1))}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.modeToggleContainer}>
            <Text style={styles.modeLabel}>Game Mode</Text>
            <View style={styles.wheelContainer}>
              {/* Top gradient fade */}
              <LinearGradient
                colors={['#1a1a1a', 'transparent']}
                style={styles.wheelGradientTop}
                pointerEvents="none"
              />
              
              {/* Bottom gradient fade */}
              <LinearGradient
                colors={['transparent', '#1a1a1a']}
                style={styles.wheelGradientBottom}
                pointerEvents="none"
              />
              
              {/* Selection indicator */}
              <View style={styles.wheelSelector} />
              
              <ScrollView
                ref={scrollViewRef}
                style={styles.wheelScrollView}
                contentContainerStyle={styles.wheelContent}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                decelerationRate="fast"
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
              >
                {/* Spacer at top */}
                <View style={{ height: WHEEL_ITEM_HEIGHT }} />
                
                {modes.map((mode, index) => (
                  <View key={mode} style={styles.wheelItem}>
                    <Text style={[
                      styles.wheelItemText,
                      selectedIndex === index && styles.wheelItemTextSelected
                    ]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </View>
                ))}
                
                {/* Spacer at bottom */}
                <View style={{ height: WHEEL_ITEM_HEIGHT }} />
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.startButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 20 - (height * 0.08),
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 10,
  },
  startButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  modeToggleContainer: {
    alignItems: 'center',
  },
  modeLabel: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
    fontWeight: '600',
  },
  wheelContainer: {
    height: WHEEL_ITEM_HEIGHT * 3,
    width: 120,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  wheelGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT,
    zIndex: 2,
    pointerEvents: 'none',
  },
  wheelGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT,
    zIndex: 2,
    pointerEvents: 'none',
  },
  wheelSelector: {
    position: 'absolute',
    top: WHEEL_ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: WHEEL_ITEM_HEIGHT,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#4CAF50',
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelScrollView: {
    flex: 1,
  },
  wheelContent: {
    paddingVertical: 0,
  },
  wheelItem: {
    height: WHEEL_ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    textTransform: 'capitalize',
    opacity: 0.6,
  },
  wheelItemTextSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 17,
    opacity: 1,
    textShadowColor: 'rgba(76, 175, 80, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

