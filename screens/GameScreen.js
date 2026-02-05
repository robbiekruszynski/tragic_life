import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  TextInput,
  Modal,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  white: { name: 'White', color: '#D0D0D0', textColor: '#000' },
  blue: { name: 'Blue', color: '#2196F3', textColor: '#fff' },
  red: { name: 'Red', color: '#F44336', textColor: '#fff' },
  black: { name: 'Black', color: '#212121', textColor: '#fff' },
  green: { name: 'Green', color: '#4CAF50', textColor: '#fff' },
  grey: { name: 'Grey', color: '#9E9E9E', textColor: '#fff' },
};

export default function GameScreen({ route, navigation }) {
  const { playerCount, players: initialPlayers, gameMode = 'commander' } = route.params;
  const [players, setPlayers] = useState([]);
  const [duelMode, setDuelMode] = useState({});
  const [commanderOnlyMode, setCommanderOnlyMode] = useState({});
  const [lifeChangeFeedback, setLifeChangeFeedback] = useState({ playerId: null, amount: 0 });
  const longPressTimerRef = useRef({});
  const [gameStartTime, setGameStartTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [totalPausedDuration, setTotalPausedDuration] = useState(0);
  const [poisonEnabled, setPoisonEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceSides, setDiceSides] = useState(20);
  
  const gradientAnimations = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  
  const feedbackTimeoutRef = useRef(null);
  const currentFeedbackRef = useRef({ playerId: null, amount: 0 });

  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      activateKeepAwakeAsync();
      
      return () => {
        deactivateKeepAwake();
      };
    }, [])
  );

  useEffect(() => {
    const nonCommanderModes = ['standard', 'modern', 'pioneer', 'legacy', 'vintage'];
    const initialLife = nonCommanderModes.includes(gameMode) ? 20 : 40;
    const initialCommanderDamage = nonCommanderModes.includes(gameMode) ? 0 : 21;
    
    if (initialPlayers && initialPlayers.length > 0) {
      const playersWithGameData = initialPlayers.map(p => ({
        ...p,
        life: initialLife,
        commanderDamage: initialCommanderDamage,
        showCommander: false,
        initialLife: initialLife,
        initialCommanderDamage: initialCommanderDamage,
        poisonCounters: 0,
        showPoison: false,
      }));
      setPlayers(playersWithGameData);
      if (!gameStartTime) {
        setGameStartTime(Date.now());
      }
    } else {
      const defaultPlayers = Array.from({ length: playerCount || 4 }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        life: initialLife,
        commanderDamage: initialCommanderDamage,
        showCommander: false,
        colors: ['grey'],
        initialLife: initialLife,
        initialCommanderDamage: initialCommanderDamage,
        poisonCounters: 0,
        showPoison: false,
      }));
      setPlayers(defaultPlayers);
      if (!gameStartTime) {
        setGameStartTime(Date.now());
      }
    }
  }, [playerCount, initialPlayers, gameMode]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const adjustLife = (playerId, amount) => {
    if (amount < 0) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
      }
    }

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    const currentFeedback = currentFeedbackRef.current;
    let signChanged = false;
    let newAmount;
    
    if (currentFeedback.playerId === playerId) {
      const prevAmount = currentFeedback.amount;
      newAmount = prevAmount + amount;
      if ((prevAmount > 0 && newAmount <= 0) || (prevAmount < 0 && newAmount >= 0)) {
        signChanged = true;
      }
    } else {
      newAmount = amount;
    }

    currentFeedbackRef.current = { playerId, amount: newAmount };
    setLifeChangeFeedback({ playerId, amount: newAmount });
    const timeoutDuration = 5000;
    feedbackTimeoutRef.current = setTimeout(() => {
      setLifeChangeFeedback({ playerId: null, amount: 0 });
      currentFeedbackRef.current = { playerId: null, amount: 0 };
      feedbackTimeoutRef.current = null;
    }, timeoutDuration);

    setPlayers(players.map(p => {
      if (p.id === playerId) {
        let newLife = p.life;
        let newCommanderDamage = p.commanderDamage;
        let newPoisonCounters = p.poisonCounters;
        
        if (poisonEnabled && p.showPoison) {
          newPoisonCounters = Math.max(0, Math.min(10, p.poisonCounters + amount));
        } else if (commanderOnlyMode[p.id]) {
          if (amount < 0) {
            newCommanderDamage = Math.max(0, p.commanderDamage + amount);
          }
        } else if (duelMode[p.id]) {
          if (amount < 0) {
            newCommanderDamage = Math.max(0, p.commanderDamage + amount);
          }
          newLife = Math.max(0, p.life + amount);
        } else {
          newLife = Math.max(0, p.life + amount);
        }


        return {
          ...p,
          life: newLife,
          commanderDamage: newCommanderDamage,
          poisonCounters: newPoisonCounters,
        };
      }
      return p;
    }));
  };

  const toggleDuel = (playerId) => {
    if (commanderOnlyMode[playerId]) {
      setCommanderOnlyMode(prev => ({
        ...prev,
        [playerId]: false
      }));
      setDuelMode(prev => ({
        ...prev,
        [playerId]: false
      }));
    } else {
      setDuelMode(prev => ({
        ...prev,
        [playerId]: !prev[playerId]
      }));
      setCommanderOnlyMode(prev => ({
        ...prev,
        [playerId]: false
      }));
    }
  };

  const handleCommanderLongPress = (playerId) => {
    longPressTimerRef.current[playerId] = setTimeout(() => {
      setCommanderOnlyMode(prev => ({
        ...prev,
        [playerId]: !prev[playerId]
      }));
      if (!commanderOnlyMode[playerId]) {
        setDuelMode(prev => ({
          ...prev,
          [playerId]: false
        }));
      }
      longPressTimerRef.current[playerId] = null;
    }, 2000);
  };

  const handleCommanderPressOut = (playerId) => {
    if (longPressTimerRef.current[playerId]) {
      clearTimeout(longPressTimerRef.current[playerId]);
      longPressTimerRef.current[playerId] = null;
    }
  };


  const toggleCommander = (playerId) => {
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        return { ...p, showCommander: !p.showCommander };
      }
      return p;
    }));
  };

  const togglePoison = (playerId) => {
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        const newShowPoison = !p.showPoison;
        if (newShowPoison && p.poisonCounters === undefined) {
          return { ...p, showPoison: newShowPoison, poisonCounters: 0 };
        }
        return { ...p, showPoison: newShowPoison };
      }
      return p;
    }));
  };

  const flipCoin = () => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    Alert.alert(
      'Coin Flip',
      result,
      [{ text: 'OK', onPress: () => {} }]
    );
  };

  const rollDice = () => {
    const result = Math.floor(Math.random() * diceSides) + 1;
    Alert.alert(
      `D${diceSides} Roll`,
      `You rolled: ${result}`,
      [{ text: 'OK', onPress: () => setShowDiceModal(false) }]
    );
  };

  const handleEndGame = () => {
    const gameData = players.map(p => ({
      name: p.name,
      colors: p.colors,
      mainLifeDamage: p.initialLife - p.life,
      commanderDamage: p.initialCommanderDamage - p.commanderDamage,
      poisonCounters: p.poisonCounters || 0,
    }));
    const gameEndTime = Date.now();
    const adjustedGameStartTime = gameStartTime 
      ? gameStartTime + totalPausedDuration + (isPaused ? (Date.now() - pausedTime) : 0)
      : gameEndTime;
    navigation.navigate('EndGame', { 
      gameData,
      gameStartTime: adjustedGameStartTime,
      gameEndTime: gameEndTime,
      poisonEnabled,
      gameMode,
    });
  };

  const getPlayerGradientSets = (player) => {
    const selectedColors = Array.isArray(player.colors) ? player.colors : [player.colors || 'grey'];
    const colorValues = selectedColors.map(c => COLORS[c]?.color || COLORS.grey.color);
    if (selectedColors.length === 0 || (selectedColors.length === 1 && selectedColors[0] === 'grey')) {
      return [
        [COLORS.grey.color, COLORS.grey.color, COLORS.grey.color],
        [COLORS.grey.color, COLORS.grey.color, COLORS.grey.color],
        [COLORS.grey.color, COLORS.grey.color, COLORS.grey.color],
      ];
    }
    const lightenColor = (hex, percent) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent));
      const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent));
      const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent));
      return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('')}`;
    };
    const darkenColor = (hex, percent) => {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.max(0, (num >> 16) - Math.round((num >> 16) * percent));
      const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(((num >> 8) & 0x00FF) * percent));
      const b = Math.max(0, (num & 0x0000FF) - Math.round((num & 0x0000FF) * percent));
      return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('')}`;
    };
    const gradientSets = [];
    if (colorValues.length === 1) {
      const baseColor = colorValues[0];
      gradientSets.push([
        darkenColor(baseColor, 0.2),
        baseColor,
        lightenColor(baseColor, 0.2),
      ]);
      gradientSets.push([
        baseColor,
        lightenColor(baseColor, 0.15),
        baseColor,
      ]);
      gradientSets.push([
        lightenColor(baseColor, 0.1),
        baseColor,
        darkenColor(baseColor, 0.15),
      ]);
    } else if (colorValues.length === 2) {
      const [color1, color2] = colorValues;
      gradientSets.push([color1, color2, color1]);
      gradientSets.push([
        lightenColor(color1, 0.1),
        color2,
        darkenColor(color1, 0.1),
      ]);
      gradientSets.push([
        color1,
        lightenColor(color2, 0.1),
        color2,
      ]);
    } else {
      gradientSets.push(colorValues);
      const variation1 = colorValues.map((color, index) => 
        index % 2 === 0 ? lightenColor(color, 0.1) : color
      );
      gradientSets.push(variation1);
      
      const variation2 = colorValues.map((color, index) => 
        index % 2 === 1 ? darkenColor(color, 0.1) : color
      );
      gradientSets.push(variation2);
    }
    
    return gradientSets;
  };

  const getAnimatedGradient = (player, animValue) => {
    const gradientSets = getPlayerGradientSets(player);
    const setCount = gradientSets.length;
    const index = Math.floor(animValue * setCount) % setCount;
    const nextIndex = (index + 1) % setCount;
    const progress = (animValue * setCount) % 1;
    
    const currentSet = gradientSets[index];
    const nextSet = gradientSets[nextIndex];
    return currentSet.map((color, i) => {
      const currentColor = color;
      const nextColor = nextSet[i] || currentSet[i];
      return interpolateColor(currentColor, nextColor, progress);
    });
  };

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

  useEffect(() => {
    const animations = gradientAnimations.map((animValue, index) => {
      return Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 8000 + (index * 1000),
          useNativeDriver: false,
        })
      );
    });
    
    Animated.parallel(animations).start();
  }, []);

  const getPlayerStyle = (player) => {
    const playerColors = player.colors ? (Array.isArray(player.colors) ? player.colors : [player.colors]) : ['grey'];
    const firstColor = playerColors.length > 0 ? playerColors[0] : 'grey';
    const colorInfo = COLORS[firstColor] || COLORS.grey;
    return {
      borderColor: colorInfo.textColor,
    };
  };

  const getTextStyle = (player) => {
    return { color: '#ffffff' };
  };

  const toggleColor = (playerId, colorKey) => {
    if (playerId === null || playerId === undefined) return;
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const currentColors = Array.isArray(p.colors) ? p.colors : (p.colors ? [p.colors] : ['grey']);
        if (currentColors.includes(colorKey)) {
          const newColors = currentColors.filter(c => c !== colorKey);
          return { ...p, colors: newColors.length > 0 ? newColors : ['grey'] };
        } else {
          return { ...p, colors: [...currentColors, colorKey] };
        }
      }
      return p;
    }));
  };

  const getPlayerPosition = (index, total) => {
    if (total === 2) {
      return { row: index === 0 ? 0 : 1, col: 0, isTop: index === 0 };
    } else if (total === 3) {
      if (index < 2) return { row: 0, col: index, isTop: true };
      return { row: 1, col: 0, isTop: false };
    } else if (total === 4) {
      return { row: index < 2 ? 0 : 1, col: index % 2, isTop: index < 2 };
    } else if (total === 5) {
      if (index < 3) return { row: 0, col: index, isTop: true };
      return { row: 1, col: index - 3, isTop: false };
    } else {
      return { row: index < 3 ? 0 : 1, col: index % 3, isTop: index < 3 };
    }
  };

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

  const AnimatedGradientCard = ({ player, isTop, playerStyle, textStyle, showFeedback, lifeChangeFeedback, adjustLife, toggleCommander, toggleDuel, duelMode, commanderOnlyMode, handleCommanderLongPress, handleCommanderPressOut, gradientAnimation, styles, togglePoison, gameMode }) => {
    const gradientSets = getPlayerGradientSets(player);
    const [gradientColors, setGradientColors] = useState(gradientSets[0]);
    const [animationProgress, setAnimationProgress] = useState(0);

    useEffect(() => {
      const startTime = Date.now();
      const duration = 8000 + (player.id * 1000);
      
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) % duration;
        const progress = elapsed / duration;
        setAnimationProgress(progress);
        
        const newColors = getAnimatedGradient(player, progress);
        setGradientColors(newColors);
      }, 50);
      
      return () => clearInterval(interval);
    }, [player.id, player.colors]);

    return (
      <LinearGradient
        key={player.id}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.playerCard, playerStyle]}
      >
        <View style={isTop ? styles.rotatedVisualContent : styles.visualContent} pointerEvents="none">
          <View style={[styles.topSection, isTop && styles.topSectionRotated]} pointerEvents="none">
            <View style={styles.nameContainer} pointerEvents="none">
              <View style={styles.nameRow} pointerEvents="none">
                <Text style={[styles.playerName, textStyle]} pointerEvents="none">{player.name}</Text>
                {poisonEnabled && player.poisonCounters > 0 && (
                  <View style={styles.poisonBadge} pointerEvents="none">
                    <Text style={[styles.poisonBadgeText, textStyle]} pointerEvents="none">
                      ☠️ {player.poisonCounters}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {showFeedback && (
            <View style={[
              styles.feedbackPopup, 
              isTop && styles.feedbackPopupTop,
              lifeChangeFeedback.amount > 0 ? styles.feedbackPositive : styles.feedbackNegative
            ]} pointerEvents="none">
              <Text style={styles.feedbackText} pointerEvents="none">
                {lifeChangeFeedback.amount > 0 ? '+' : ''}{lifeChangeFeedback.amount}
              </Text>
            </View>
          )}
          <View style={[styles.lifeContainer, isTop && styles.lifeContainerTop]} pointerEvents="none">
            <View style={[styles.lifeValueContainer, isTop && styles.lifeValueContainerTop]} pointerEvents="none">
              <Text style={[styles.lifeValue, textStyle]} pointerEvents="none">
                {poisonEnabled && player.showPoison ? player.poisonCounters : player.life}
              </Text>
            </View>
          </View>
        </View>
        {gameMode === 'commander' && (
          <View style={[styles.commanderDamageWrapper, isTop && styles.commanderDamageWrapperTop]} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.commanderDamageContainer}
              onPress={() => toggleDuel(player.id)}
              onLongPress={() => handleCommanderLongPress(player.id)}
              onPressOut={() => handleCommanderPressOut(player.id)}
              activeOpacity={0.7}
              delayLongPress={2000}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={[
                styles.commanderDamageText, 
                textStyle, 
                isTop && styles.rotatedText, 
                duelMode[player.id] && styles.commanderDamageActive,
                commanderOnlyMode[player.id] && styles.commanderDamageRed
              ]}>
                {player.commanderDamage}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
              {poisonEnabled && (
                <TouchableOpacity
                  style={[styles.poisonToggle, player.showPoison && styles.poisonToggleActive]}
                  onPress={() => togglePoison(player.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  collapsable={false}
                >
                  <Text style={[styles.poisonToggleText, textStyle, isTop && styles.rotatedText]}>
                    Poison
                  </Text>
                </TouchableOpacity>
              )}
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
            commanderOnlyMode={commanderOnlyMode}
            handleCommanderLongPress={handleCommanderLongPress}
            handleCommanderPressOut={handleCommanderPressOut}
        duelMode={duelMode}
        gradientAnimation={animValue}
        styles={styles}
        togglePoison={togglePoison}
        gameMode={gameMode}
      />
    );
  };

  return (
      <View style={styles.container}>
      <View style={styles.gameGrid}>
        <View style={styles.row}>
          {topPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              {index > 0 && <View style={styles.verticalSpacer} />}
              {renderPlayerCard(player, true)}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.centerSpacer} />
        <View style={styles.row}>
          {bottomPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              {index > 0 && <View style={styles.verticalSpacer} />}
              {renderPlayerCard(player, false)}
            </React.Fragment>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.endGameButton} onPress={handleEndGame}>
        <Text style={styles.endGameButtonText}>END</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.settingsButtonText}>⚙</Text>
      </TouchableOpacity>
      {showSettings && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Settings</Text>
              
              <TouchableOpacity
                style={[styles.settingRow, poisonEnabled && styles.settingRowActive]}
                onPress={() => setPoisonEnabled(!poisonEnabled)}
              >
                <Text style={styles.settingText}>Enable Poison Counters</Text>
                <Text style={styles.settingValue}>{poisonEnabled ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>

              {!isPaused ? (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    setIsPaused(true);
                    setPausedTime(Date.now());
                  }}
                >
                  <Text style={styles.settingText}>Pause Timer</Text>
                  <Text style={styles.settingValue}>⏸️</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.settingRow, styles.settingRowActive]}
                  onPress={() => {
                    const pauseDuration = Date.now() - pausedTime;
                    setTotalPausedDuration(prev => prev + pauseDuration);
                    setIsPaused(false);
                    setPausedTime(0);
                    setShowSettings(false);
                  }}
                >
                  <Text style={styles.settingText}>Resume Timer</Text>
                  <Text style={styles.settingValue}>▶️</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.settingRow}
                onPress={flipCoin}
              >
                <Text style={styles.settingText}>Flip Coin</Text>
                <Text style={styles.settingValue}>🪙</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowDiceModal(true)}
              >
                <Text style={styles.settingText}>Roll Dice</Text>
                <Text style={styles.settingValue}>🎲</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
      {showDiceModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setShowDiceModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Select Dice</Text>
              
              <View style={styles.diceSelectorContainer}>
                <Text style={styles.diceLabel}>Number of sides: {diceSides}</Text>
                <View style={styles.dicePresetsRow}>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 4 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(4)}
                  >
                    <Text style={styles.dicePresetText}>D4</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 6 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(6)}
                  >
                    <Text style={styles.dicePresetText}>D6</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 8 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(8)}
                  >
                    <Text style={styles.dicePresetText}>D8</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 10 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(10)}
                  >
                    <Text style={styles.dicePresetText}>D10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 12 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(12)}
                  >
                    <Text style={styles.dicePresetText}>D12</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 20 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(20)}
                  >
                    <Text style={styles.dicePresetText}>D20</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dicePresetButton, diceSides === 100 && styles.dicePresetButtonActive]}
                    onPress={() => setDiceSides(100)}
                  >
                    <Text style={styles.dicePresetText}>D100</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.diceInputContainer}>
                  <Text style={styles.diceInputLabel}>Or enter custom:</Text>
                  <View style={styles.diceButtonsRow}>
                    <TouchableOpacity
                      style={styles.diceButton}
                      onPress={() => setDiceSides(Math.max(3, diceSides - 1))}
                    >
                      <Text style={styles.diceButtonText}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.diceInput}
                      value={diceSides.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 3;
                        setDiceSides(Math.min(100, Math.max(3, num)));
                      }}
                      keyboardType="numeric"
                      maxLength={3}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={styles.diceButton}
                      onPress={() => setDiceSides(Math.min(100, diceSides + 1))}
                    >
                      <Text style={styles.diceButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={rollDice}
              >
                <Text style={styles.modalCloseButtonText}>Roll D{diceSides}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalCloseButton, { marginTop: 10, backgroundColor: '#666' }]}
                onPress={() => setShowDiceModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
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
  verticalSpacer: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 0,
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
    paddingTop: 50,
    paddingBottom: 80,
    zIndex: 1,
    overflow: 'visible',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
    height: 60,
    backgroundColor: 'transparent',
    overflow: 'hidden',
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
    position: 'relative',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  commanderDamageWrapper: {
    position: 'absolute',
    top: 35,
    right: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100002,
    elevation: 100002,
    pointerEvents: 'box-none',
  },
  commanderDamageWrapperTop: {
    top: 'auto',
    bottom: 35,
    right: 10,
    left: 'auto',
  },
  commanderDamageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 50,
    minHeight: 50,
  },
  commanderDamageText: {
    fontSize: Math.min(width * 0.25, height * 0.3) * 0.5,
    fontWeight: 'bold',
    opacity: 0.5,
    textAlign: 'center',
  },
  commanderDamageActive: {
    opacity: 1,
    color: '#000',
  },
  commanderDamageRed: {
    color: '#F44336',
    opacity: 1,
  },
  poisonBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  poisonBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    flexDirection: 'column',
  },
  topSectionRotated: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    top: 5 - (height * 0.02),
    bottom: 'auto',
    left: 10,
    right: 'auto',
    marginTop: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 10,
    flexDirection: 'column',
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
    top: Math.max(0, 20 - (height * 0.03)),
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
    overflow: 'visible',
  },
  lifeContainerTop: {
    top: -(height * 0.03),
    paddingTop: 60,
    paddingBottom: 0,
  },
  lifeValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    pointerEvents: 'box-none',
    overflow: 'visible',
    paddingTop: 0,
    gap: 20,
  },
  lifeValueContainerTop: {
    marginTop: -30 - (height * 0.05),
  },
  lifeValue: {
    fontSize: Math.min(width * 0.25, height * 0.3),
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'top',
    lineHeight: Math.min(width * 0.25, height * 0.3) * 1.1,
    overflow: 'visible',
    paddingTop: 0,
    marginTop: 0,
  },
  lifeControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 8,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'hidden',
    paddingHorizontal: 5,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  lifeButtons: {
    flexDirection: 'row',
    gap: 15,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'hidden',
  },
  lifeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100001,
    elevation: 100001,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  lifeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  feedbackPopup: {
    position: 'absolute',
    top: 5,
    left: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
    borderWidth: 2,
    minWidth: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackPopupTop: {
    left: 'auto',
    right: 10,
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
    gap: 8,
    zIndex: 100002,
    elevation: 100002,
    overflow: 'hidden',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  poisonToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 55,
    minHeight: 35,
    zIndex: 100001,
    elevation: 100001,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  poisonToggleActive: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
  },
  poisonToggleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  endGameButton: {
    position: 'absolute',
    bottom: '47%',
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  endGameButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsButton: {
    position: 'absolute',
    bottom: '47%',
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalOverlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 30,
    width: 300,
    maxWidth: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  settingRowActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#1a3a1a',
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  diceSelectorContainer: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  diceLabel: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  dicePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  dicePresetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 2,
    borderColor: '#4CAF50',
    minWidth: 50,
  },
  dicePresetButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
  },
  dicePresetText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diceInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  diceInputLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  diceButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  diceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  diceInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minWidth: 80,
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

