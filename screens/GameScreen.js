import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  white: { name: 'White', color: '#F5F5F5', textColor: '#000' },
  blue: { name: 'Blue', color: '#2196F3', textColor: '#fff' },
  red: { name: 'Red', color: '#F44336', textColor: '#fff' },
  black: { name: 'Black', color: '#212121', textColor: '#fff' },
  green: { name: 'Green', color: '#4CAF50', textColor: '#fff' },
  grey: { name: 'Grey', color: '#9E9E9E', textColor: '#fff' },
};

export default function GameScreen({ route, navigation }) {
  const { playerCount } = route.params;
  const [players, setPlayers] = useState([]);
  const [duelMode, setDuelMode] = useState({});
  const [lifeChangeFeedback, setLifeChangeFeedback] = useState({ playerId: null, amount: 0 });
  
  // Animation values for gradient color shifts
  const gradientAnimations = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  // Lock to landscape orientation when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }, [])
  );

  useEffect(() => {
    const initialPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      life: 40,
      commanderDamage: 21,
      showCommander: false,
      colors: ['grey'], // Default to grey for all players
      initialLife: 40,
      initialCommanderDamage: 21,
    }));
    setPlayers(initialPlayers);
  }, [playerCount]);

  const adjustLife = (playerId, amount) => {
    // Show feedback popup
    setLifeChangeFeedback({ playerId, amount });
    setTimeout(() => setLifeChangeFeedback({ playerId: null, amount: 0 }), 800);

    setPlayers(players.map(p => {
      if (p.id === playerId) {
        if (duelMode[p.id]) {
          // Duel mode: adjust both life and commander damage
          const newLife = Math.max(0, p.life + amount);
          const newCommanderDamage = Math.max(0, p.commanderDamage + amount);
          return { ...p, life: newLife, commanderDamage: newCommanderDamage };
        } else if (p.showCommander) {
          // Commander mode: adjust commander damage only
          const newCommanderDamage = Math.max(0, p.commanderDamage + amount);
          return { ...p, commanderDamage: newCommanderDamage };
        } else {
          // Normal mode: adjust life only
          const newLife = Math.max(0, p.life + amount);
          return { ...p, life: newLife };
        }
      }
      return p;
    }));
  };

  const toggleDuel = (playerId) => {
    setDuelMode(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };


  const toggleCommander = (playerId) => {
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        return { ...p, showCommander: !p.showCommander };
      }
      return p;
    }));
  };


  const handleEndGame = () => {
    const gameData = players.map(p => ({
      name: p.name,
      colors: p.colors,
      mainLifeDamage: p.initialLife - p.life,
      commanderDamage: p.initialCommanderDamage - p.commanderDamage,
    }));
    navigation.navigate('EndGame', { gameData });
  };

  // Professional multi-color gradient definitions for each player
  const getPlayerGradientSets = (playerIndex) => {
    const gradientSets = [
      // Player 1: Ocean Blue gradient set
      [
        ['#667eea', '#764ba2', '#f093fb'],
        ['#4facfe', '#00f2fe', '#43e97b'],
        ['#fa709a', '#fee140', '#30cfd0'],
      ],
      // Player 2: Forest Green gradient set
      [
        ['#11998e', '#38ef7d', '#06beb6'],
        ['#56ab2f', '#a8e063', '#11998e'],
        ['#134e5e', '#71b280', '#56ab2f'],
      ],
      // Player 3: Sunset Orange gradient set
      [
        ['#f093fb', '#f5576c', '#4facfe'],
        ['#fa709a', '#fee140', '#f093fb'],
        ['#ff6e7f', '#bfe9ff', '#ffc371'],
      ],
      // Player 4: Royal Purple gradient set
      [
        ['#a8edea', '#fed6e3', '#667eea'],
        ['#fbc2eb', '#a6c1ee', '#fbc2eb'],
        ['#667eea', '#764ba2', '#f093fb'],
      ],
      // Player 5: Golden Yellow gradient set
      [
        ['#f6d365', '#fda085', '#ffecd2'],
        ['#ffecd2', '#fcb69f', '#ff9a9e'],
        ['#ffecd2', '#fbc2eb', '#a8edea'],
      ],
      // Player 6: Sky Blue gradient set
      [
        ['#89f7fe', '#66a6ff', '#4facfe'],
        ['#4facfe', '#00f2fe', '#43e97b'],
        ['#30cfd0', '#330867', '#89f7fe'],
      ],
    ];
    return gradientSets[playerIndex % gradientSets.length] || gradientSets[0];
  };

  // Get animated gradient colors based on animation value
  const getAnimatedGradient = (playerIndex, animValue) => {
    const gradientSets = getPlayerGradientSets(playerIndex);
    const setCount = gradientSets.length;
    const index = Math.floor(animValue * setCount) % setCount;
    const nextIndex = (index + 1) % setCount;
    const progress = (animValue * setCount) % 1;
    
    const currentSet = gradientSets[index];
    const nextSet = gradientSets[nextIndex];
    
    // Interpolate between current and next gradient set
    return currentSet.map((color, i) => {
      const currentColor = color;
      const nextColor = nextSet[i] || currentSet[i];
      return interpolateColor(currentColor, nextColor, progress);
    });
  };

  // Helper function to interpolate between two hex colors
  const interpolateColor = (color1, color2, factor) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);
    
    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  // Start gradient animations
  useEffect(() => {
    const animations = gradientAnimations.map((animValue, index) => {
      return Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 8000 + (index * 1000), // Stagger animations slightly
          useNativeDriver: false, // Colors can't use native driver
        })
      );
    });
    
    Animated.parallel(animations).start();
  }, []);

  const getPlayerStyle = (player) => {
    // Use first color for border, or grey if none selected
    const playerColors = player.colors ? (Array.isArray(player.colors) ? player.colors : [player.colors]) : ['grey'];
    const firstColor = playerColors.length > 0 ? playerColors[0] : 'grey';
    const colorInfo = COLORS[firstColor] || COLORS.grey;
    return {
      borderColor: colorInfo.textColor,
    };
  };

  const getTextStyle = (player) => {
    // Use white text for all players to contrast with gradients
    return { color: '#ffffff' };
  };

  const toggleColor = (playerId, colorKey) => {
    if (playerId === null || playerId === undefined) return;
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const currentColors = Array.isArray(p.colors) ? p.colors : (p.colors ? [p.colors] : ['grey']);
        if (currentColors.includes(colorKey)) {
          // Remove color if already selected, but keep at least one color
          const newColors = currentColors.filter(c => c !== colorKey);
          return { ...p, colors: newColors.length > 0 ? newColors : ['grey'] };
        } else {
          // Add color if not selected
          return { ...p, colors: [...currentColors, colorKey] };
        }
      }
      return p;
    }));
  };

  // Calculate grid layout based on player count
  const getPlayerPosition = (index, total) => {
    if (total === 2) {
      // 2 players: one top, one bottom
      return { row: index === 0 ? 0 : 1, col: 0, isTop: index === 0 };
    } else if (total === 3) {
      // 3 players: 2 top, 1 bottom
      if (index < 2) return { row: 0, col: index, isTop: true };
      return { row: 1, col: 0, isTop: false };
    } else if (total === 4) {
      // 4 players: 2x2 grid
      // Player 0 (top left), Player 1 (top right), Player 2 (bottom left), Player 3 (bottom right)
      return { row: index < 2 ? 0 : 1, col: index % 2, isTop: index < 2 };
    } else if (total === 5) {
      // 5 players: 3 top, 2 bottom
      if (index < 3) return { row: 0, col: index, isTop: true };
      return { row: 1, col: index - 3, isTop: false };
    } else {
      // 6 players: 3x2 grid
      return { row: index < 3 ? 0 : 1, col: index % 3, isTop: index < 3 };
    }
  };

  // Group players by row, sorted by column
  const topPlayers = players
    .map((player, i) => ({ player, pos: getPlayerPosition(i, players.length) }))
    .filter(({ pos }) => pos.isTop)
    .sort((a, b) => a.pos.col - b.pos.col)
    .map(({ player }) => player);
  
  const bottomPlayers = players
    .map((player, i) => ({ player, pos: getPlayerPosition(i, players.length) }))
    .filter(({ pos }) => !pos.isTop)
    .sort((a, b) => a.pos.col - b.pos.col)
    .map(({ player }) => player);

  // Animated Gradient Card Component (defined inside to access functions)
  const AnimatedGradientCard = ({ player, isTop, playerStyle, textStyle, showFeedback, lifeChangeFeedback, adjustLife, toggleCommander, toggleDuel, duelMode, gradientAnimation, styles }) => {
    const [gradientColors, setGradientColors] = useState(
      getPlayerGradientSets(player.id - 1)[0]
    );
    const [animationProgress, setAnimationProgress] = useState(0);

    useEffect(() => {
      // Update animation progress based on time
      const startTime = Date.now();
      const duration = 8000 + ((player.id - 1) * 1000);
      
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % duration;
        const progress = elapsed / duration;
        setAnimationProgress(progress);
        
        const newColors = getAnimatedGradient(player.id - 1, progress);
        setGradientColors(newColors);
      }, 50); // Update every 50ms for smooth animation
      
      return () => clearInterval(interval);
    }, [player.id]);

    return (
      <LinearGradient
        key={player.id}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.playerCard, playerStyle]}
      >
        {/* Rotate only visual content for top players - MUST have pointerEvents: 'none' */}
        <View style={isTop ? styles.rotatedVisualContent : styles.visualContent} pointerEvents="none">
          {/* Player Name - Top Right */}
          <View style={[styles.topSection, isTop && styles.topSectionRotated]} pointerEvents="none">
            <View style={styles.nameContainer} pointerEvents="none">
              <Text style={[styles.playerName, textStyle]} pointerEvents="none">{player.name}</Text>
            </View>
          </View>

          {/* Life/Commander Counter - Right below name */}
          <View style={[styles.lifeContainer, isTop && styles.lifeContainerTop]} pointerEvents="none">
            {showFeedback && (
              <View style={[styles.feedbackPopup, lifeChangeFeedback.amount > 0 ? styles.feedbackPositive : styles.feedbackNegative]} pointerEvents="none">
                <Text style={styles.feedbackText} pointerEvents="none">
                  {lifeChangeFeedback.amount > 0 ? '+' : ''}{lifeChangeFeedback.amount}
                </Text>
              </View>
            )}
            <View style={styles.lifeValueContainer} pointerEvents="none">
              <Text style={[styles.lifeValue, textStyle]} pointerEvents="none">
                {player.showCommander ? player.commanderDamage : player.life}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons - RENDERED LAST, completely separate layer, NEVER rotated */}
        <View style={[styles.buttonContainer, isTop && styles.buttonContainerTop]} pointerEvents="box-none">
          <View style={styles.lifeControlsRow} pointerEvents="box-none">
            <View style={styles.lifeButtons} pointerEvents="box-none">
              <TouchableOpacity
                style={[styles.lifeButton, textStyle]}
                onPress={() => adjustLife(player.id, 1)}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                collapsable={false}
              >
                <Text style={[styles.lifeButtonText, textStyle, isTop && styles.rotatedText]}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.lifeButton, textStyle]}
                onPress={() => adjustLife(player.id, -1)}
                activeOpacity={0.7}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                collapsable={false}
              >
                <Text style={[styles.lifeButtonText, textStyle, isTop && styles.rotatedText]}>-</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.toggleButtons} pointerEvents="box-none">
              <TouchableOpacity
                style={[styles.commanderToggle, player.showCommander && styles.commanderToggleActive]}
                onPress={() => toggleCommander(player.id)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                collapsable={false}
              >
                <Text style={[styles.commanderToggleText, textStyle, isTop && styles.rotatedText]}>
                  Commander
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.duelToggle, duelMode[player.id] && styles.duelToggleActive]}
                onPress={() => toggleDuel(player.id)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                collapsable={false}
              >
                <Text style={[styles.duelToggleText, textStyle, isTop && styles.rotatedText]}>
                  Duel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderPlayerCard = (player, isTop) => {
    const playerStyle = getPlayerStyle(player);
    const textStyle = getTextStyle(player);
    const showFeedback = lifeChangeFeedback.playerId === player.id;
    const animValue = gradientAnimations[player.id - 1];

    return (
      <AnimatedGradientCard
        player={player}
        isTop={isTop}
        playerStyle={playerStyle}
        textStyle={textStyle}
        showFeedback={showFeedback}
        lifeChangeFeedback={lifeChangeFeedback}
        adjustLife={adjustLife}
        toggleCommander={toggleCommander}
        toggleDuel={toggleDuel}
        duelMode={duelMode}
        gradientAnimation={animValue}
        styles={styles}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameGrid}>
        {/* Top Row - Players facing from top */}
        <View style={styles.row}>
          {topPlayers.map((player) => renderPlayerCard(player, true))}
        </View>

        {/* Center spacer (optional, for visual separation) */}
        <View style={styles.centerSpacer} />

        {/* Bottom Row - Players facing from bottom */}
        <View style={styles.row}>
          {bottomPlayers.map((player) => renderPlayerCard(player, false))}
        </View>
      </View>

      <TouchableOpacity style={styles.endGameButton} onPress={handleEndGame}>
        <Text style={styles.endGameButtonText}>End Game</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    width: '100%',
    height: '100%',
  },
  gameGrid: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: 0,
  },
  centerSpacer: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 0,
  },
  playerCard: {
    flex: 1,
    width: '50%',
    height: '100%',
    borderRadius: 0,
    padding: 10,
    borderWidth: 2,
    justifyContent: 'space-between',
    marginHorizontal: 0,
    position: 'relative',
    overflow: 'visible',
  },
  visualContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    paddingTop: 0,
    paddingBottom: 80,
    zIndex: 1,
  },
  rotatedVisualContent: {
    transform: [{ rotate: '180deg' }],
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    paddingTop: 0,
    paddingBottom: 80,
    zIndex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
    height: 60,
    backgroundColor: 'transparent',
  },
  buttonContainerTop: {
    top: 5,
    bottom: 'auto',
    zIndex: 99999,
    elevation: 99999,
  },
  rotatedText: {
    transform: [{ rotate: '180deg' }],
  },
  nameContainer: {
    alignItems: 'flex-end',
    marginBottom: 0,
    paddingVertical: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topSection: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginTop: 5,
    marginRight: 10,
    paddingTop: 0,
    pointerEvents: 'none',
    flex: 0,
    position: 'absolute',
    top: 5,
    right: 10,
    zIndex: 2,
  },
  topSectionRotated: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    top: 5,
    bottom: 'auto',
    left: 10,
    right: 'auto',
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  lifeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    width: '100%',
    pointerEvents: 'none',
    marginTop: 0,
    marginBottom: 0,
    flex: 0,
    minHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
  },
  lifeContainerTop: {
    top: 0,
  },
  lifeValueContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
    paddingTop: 0,
  },
  lifeValue: {
    fontSize: Math.min(width * 0.2, height * 0.25),
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'top',
    lineHeight: Math.min(width * 0.2, height * 0.25) * 1.1,
    overflow: 'visible',
    paddingTop: 0,
    marginTop: 0,
  },
  lifeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'visible',
    paddingHorizontal: 10,
  },
  lifeButtons: {
    flexDirection: 'row',
    gap: 20,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'visible',
  },
  lifeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100001,
    elevation: 100001,
    overflow: 'visible',
    marginHorizontal: 5,
  },
  lifeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedbackPopup: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
    borderWidth: 2,
  },
  feedbackPositive: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
  },
  feedbackNegative: {
    backgroundColor: '#F44336',
    borderColor: '#fff',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 15,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'visible',
  },
  commanderToggle: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 35,
    zIndex: 100001,
    elevation: 100001,
    overflow: 'visible',
    marginHorizontal: 5,
  },
  commanderToggleActive: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  commanderToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  duelToggle: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    minHeight: 35,
    zIndex: 100001,
    elevation: 100001,
    overflow: 'visible',
    marginHorizontal: 5,
  },
  duelToggleActive: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  duelToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  endGameButton: {
    position: 'absolute',
    bottom: '50%',
    left: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  endGameButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 30,
    width: width * 0.8,
    maxWidth: 400,
    zIndex: 1001,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    marginTop: 10,
  },
  nameInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  colorOption: {
    width: 100,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  colorOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorCheckmark: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#666',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

