import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
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

export default function PlayerSetupScreen({ route, navigation }) {
  const { playerCount } = route.params;
  const [players, setPlayers] = useState([]);
  const [editingPlayerId, setEditingPlayerId] = useState(null);

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
      colors: ['grey'],
    }));
    setPlayers(initialPlayers);
  }, [playerCount]);

  // Calculate grid layout based on player count (same logic as GameScreen)
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

  const updatePlayerName = (playerId, name) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === playerId ? { ...p, name } : p))
    );
  };

  const toggleColor = (playerId, colorKey) => {
    setPlayers(prevPlayers =>
      prevPlayers.map(p => {
        if (p.id === playerId) {
          const currentColors = Array.isArray(p.colors) ? p.colors : [p.colors];
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
      })
    );
  };

  const handleStartGame = () => {
    navigation.navigate('Game', { players });
  };

  // Generate gradient colors from selected colors (same logic as GameScreen)
  const getGradientColors = (selectedColors) => {
    if (!selectedColors || selectedColors.length === 0) {
      return [COLORS.grey.color, COLORS.grey.color, COLORS.grey.color];
    }
    
    const colorArray = Array.isArray(selectedColors) ? selectedColors : [selectedColors];
    const colorValues = colorArray.map(c => COLORS[c]?.color || COLORS.grey.color);
    
    // Helper to lighten a color
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
    
    // Helper to darken a color
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
    
    if (colorValues.length === 1) {
      const baseColor = colorValues[0];
      return [darkenColor(baseColor, 0.2), baseColor, lightenColor(baseColor, 0.2)];
    } else if (colorValues.length === 2) {
      return [colorValues[0], colorValues[1], colorValues[0]];
    } else {
      // Use all selected colors for the gradient
      // LinearGradient will create smooth transitions between all colors
      return colorValues;
    }
  };

  // Group players by row
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

  const renderPlayerCard = (player, isTop) => {
    const gradientColors = getGradientColors(player.colors);
    const isEditing = editingPlayerId === player.id;
    const playerColors = Array.isArray(player.colors) ? player.colors : [player.colors];

    return (
      <LinearGradient
        key={player.id}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.playerCard, isTop && styles.playerCardRotated]}
      >
        {/* Rotate only visual content for top players - just for display */}
        <View style={isTop ? styles.rotatedVisualContent : styles.visualContent} pointerEvents="none">
          {/* Empty visual content - name is handled separately */}
        </View>

        {/* Name Editing Section - Separate layer, always accessible */}
        <View style={[styles.nameContainerWrapper, isTop && styles.nameContainerWrapperTop]} pointerEvents="box-none">
          <View style={styles.nameContainerInner} pointerEvents="auto">
            {isEditing ? (
              <TextInput
                style={[styles.nameInput, isTop && styles.rotatedText]}
                value={player.name}
                onChangeText={(text) => updatePlayerName(player.id, text)}
                onBlur={() => setEditingPlayerId(null)}
                autoFocus
                placeholder="Enter name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            ) : (
              <TouchableOpacity
                onPress={() => setEditingPlayerId(player.id)}
                style={styles.nameButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.playerName, isTop && styles.rotatedText]}>{player.name}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Setup Controls - RENDERED LAST, completely separate layer, NEVER rotated */}
        <View style={[styles.buttonContainer, isTop && styles.buttonContainerTop]} pointerEvents="box-none">
          <View style={styles.setupControlsRow} pointerEvents="box-none">
            {/* Color Selection */}
            <View style={styles.colorSelectorContainer} pointerEvents="box-none">
              <Text style={[styles.colorLabel, isTop && styles.rotatedText]}>Colors:</Text>
              <View style={styles.colorGrid} pointerEvents="box-none">
                {Object.keys(COLORS).map((colorKey) => {
                  const isSelected = playerColors.includes(colorKey);
                  const colorInfo = COLORS[colorKey];
                  return (
                    <TouchableOpacity
                      key={colorKey}
                      style={[
                        styles.colorOption,
                        { backgroundColor: colorInfo.color },
                        isSelected && styles.colorOptionSelected,
                      ]}
                      onPress={() => toggleColor(player.id, colorKey)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameGrid}>
        {/* Top Row - Players facing from top */}
        <View style={styles.row}>
          {topPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              {index > 0 && <View style={styles.verticalSpacer} />}
              {renderPlayerCard(player, true)}
            </React.Fragment>
          ))}
        </View>

        {/* Center spacer */}
        <View style={styles.centerSpacer} />

        {/* Bottom Row - Players facing from bottom */}
        <View style={styles.row}>
          {bottomPlayers.map((player, index) => (
            <React.Fragment key={player.id}>
              {index > 0 && <View style={styles.verticalSpacer} />}
              {renderPlayerCard(player, false)}
            </React.Fragment>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startGameButton} onPress={handleStartGame}>
        <Text style={styles.startGameButtonText}>Start Game</Text>
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
  playerCardRotated: {
    // Rotation handled by visual content
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
  nameContainerWrapper: {
    position: 'absolute',
    top: 5,
    right: 10,
    zIndex: 99998,
    elevation: 99998,
    pointerEvents: 'box-none',
    alignItems: 'flex-end',
  },
  nameContainerWrapperTop: {
    top: 'auto',
    bottom: 5,
    right: 10,
    left: 'auto',
    alignItems: 'flex-end',
  },
  nameContainerInner: {
    pointerEvents: 'auto',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  nameButton: {
    padding: 8,
    minWidth: 100,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  setupControlsRow: {
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
  colorSelectorContainer: {
    alignItems: 'center',
    zIndex: 100002,
    elevation: 100002,
    overflow: 'visible',
  },
  colorLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 6,
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startGameButton: {
    position: 'absolute',
    bottom: '50%',
    left: 8,
    backgroundColor: '#4CAF50',
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
  startGameButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
