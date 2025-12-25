import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { VictoryPie } from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  white: { name: 'White', color: '#F5F5F5', textColor: '#000' },
  blue: { name: 'Blue', color: '#2196F3', textColor: '#fff' },
  red: { name: 'Red', color: '#F44336', textColor: '#fff' },
  black: { name: 'Black', color: '#212121', textColor: '#fff' },
  green: { name: 'Green', color: '#4CAF50', textColor: '#fff' },
  grey: { name: 'Grey', color: '#9E9E9E', textColor: '#fff' },
};

export default function EndGameScreen({ route, navigation }) {
  const { gameData } = route.params;

  // Allow all orientations when screen is focused (so user can rotate to portrait for easier reading)
  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.unlockAsync();
    }, [])
  );

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
      return colorValues;
    }
  };

  // Get a representative color for pie charts (use first color or average)
  const getChartColor = (selectedColors) => {
    if (!selectedColors || selectedColors.length === 0) {
      return COLORS.grey.color;
    }
    const colorArray = Array.isArray(selectedColors) ? selectedColors : [selectedColors];
    return COLORS[colorArray[0]]?.color || COLORS.grey.color;
  };

  // Prepare data for pie charts - filter out zero values and add labels with values
  const mainLifeData = gameData
    .filter(player => player.mainLifeDamage > 0)
    .map((player) => {
      const colorValue = getChartColor(player.colors);
      return {
        x: player.name,
        y: player.mainLifeDamage,
        color: colorValue,
        label: `${player.name}\n${player.mainLifeDamage}`,
      };
    });

  const commanderData = gameData
    .filter(player => player.commanderDamage > 0)
    .map((player) => {
      const colorValue = getChartColor(player.colors);
      return {
        x: player.name,
        y: player.commanderDamage,
        color: colorValue,
        label: `${player.name}\n${player.commanderDamage}`,
      };
    });

  const totalMainLifeDamage = mainLifeData.reduce((sum, item) => sum + item.y, 0);
  const totalCommanderDamage = commanderData.reduce((sum, item) => sum + item.y, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Game Summary</Text>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Main Life Damage</Text>
          {totalMainLifeDamage > 0 && mainLifeData.length > 0 ? (
            <>
              <VictoryPie
                data={mainLifeData}
                colorScale={mainLifeData.map(item => item.color)}
                width={400}
                height={400}
                innerRadius={80}
                padAngle={5}
                cornerRadius={5}
                style={{
                  labels: {
                    fill: 'transparent',
                  },
                  data: {
                    stroke: '#fff',
                    strokeWidth: 4,
                    strokeOpacity: 1,
                  },
                }}
              />
              <View style={styles.legendContainer}>
                {mainLifeData.map((item, index) => {
                  const percentage = totalMainLifeDamage > 0 ? ((item.y / totalMainLifeDamage) * 100).toFixed(1) : 0;
                  return (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.x}: {item.y} ({percentage}%)</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No main life damage taken</Text>
            </View>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Commander Damage</Text>
          {totalCommanderDamage > 0 && commanderData.length > 0 ? (
            <>
              <VictoryPie
                data={commanderData}
                colorScale={commanderData.map(item => item.color)}
                width={400}
                height={400}
                innerRadius={80}
                padAngle={5}
                cornerRadius={5}
                style={{
                  labels: {
                    fill: 'transparent',
                  },
                  data: {
                    stroke: '#fff',
                    strokeWidth: 4,
                    strokeOpacity: 1,
                  },
                }}
              />
              <View style={styles.legendContainer}>
                {commanderData.map((item, index) => {
                  const percentage = totalCommanderDamage > 0 ? ((item.y / totalCommanderDamage) * 100).toFixed(1) : 0;
                  return (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.x}: {item.y} ({percentage}%)</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No commander damage taken</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          {gameData.map((player, index) => {
            // Use the same gradient colors as the game screen
            const gradientColors = getGradientColors(player.colors);
            return (
              <LinearGradient
                key={index}
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statCardContent}>
                  <Text style={[styles.statName, { color: '#fff' }]}>
                    {player.name}
                  </Text>
                  <View style={styles.statDetails}>
                    <Text style={[styles.statText, { color: '#fff' }]}>
                      Main Life Damage: {player.mainLifeDamage}
                    </Text>
                    <Text style={[styles.statText, { color: '#fff' }]}>
                      Commander Damage: {player.commanderDamage}
                    </Text>
                    <Text style={[styles.statText, { color: '#fff' }]}>
                      Total Damage: {player.mainLifeDamage + player.commanderDamage}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  noDataContainer: {
    width: 400,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 200,
  },
  noDataText: {
    color: '#aaa',
    fontSize: 16,
  },
  statsContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
    overflow: 'visible',
  },
  statCardContent: {
    position: 'relative',
    width: '100%',
    minHeight: 100,
  },
  statName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    textAlign: 'left',
  },
  statDetails: {
    marginTop: 35,
  },
  statText: {
    fontSize: 17,
    marginBottom: 8,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

