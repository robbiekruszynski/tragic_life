import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, ClipPath, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });

  // Allow all orientations when screen is focused (so user can rotate to portrait for easier reading)
  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.unlockAsync();
    }, [])
  );

  // Update dimensions on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  // Calculate responsive pie chart size
  const getPieChartSize = () => {
    const isPortrait = dimensions.height > dimensions.width;
    const maxSize = Math.min(dimensions.width - 40, isPortrait ? dimensions.height * 0.4 : 400);
    return Math.max(250, maxSize); // Minimum 250, but responsive to screen
  };

  // Share game data
  const shareGameData = async () => {
    try {
      const dataString = JSON.stringify(gameData, null, 2);
      await Share.share({
        message: `Tragic Life Game Data:\n\n${dataString}`,
        title: 'Tragic Life Game Data',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
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
      return colorValues;
    }
  };

  // Custom Gradient Pie Chart Component
  const GradientPieChart = ({ data, size, innerRadius, padAngle = 5 }) => {
    const total = data.reduce((sum, item) => sum + item.y, 0);
    const center = size / 2;
    const outerRadius = size / 2;
    let currentAngle = -90; // Start at top
    
    const createPath = (startAngle, endAngle, innerR, outerR) => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const x1 = center + innerR * Math.cos(startAngleRad);
      const y1 = center + innerR * Math.sin(startAngleRad);
      const x2 = center + outerR * Math.cos(startAngleRad);
      const y2 = center + outerR * Math.sin(startAngleRad);
      const x3 = center + outerR * Math.cos(endAngleRad);
      const y3 = center + outerR * Math.sin(endAngleRad);
      const x4 = center + innerR * Math.cos(endAngleRad);
      const y4 = center + innerR * Math.sin(endAngleRad);
      
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      
      return `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1} ${y1} Z`;
    };
    
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Defs>
            {data.map((item, index) => {
              const gradientColors = getGradientColors(item.colors || []);
              const gradientId = `gradient-${index}`;
              return (
                <SvgLinearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  {gradientColors.map((color, colorIndex) => (
                    <Stop
                      key={colorIndex}
                      offset={`${gradientColors.length > 1 ? (colorIndex / (gradientColors.length - 1)) * 100 : 0}%`}
                      stopColor={color}
                      stopOpacity="1"
                    />
                  ))}
                </SvgLinearGradient>
              );
            })}
          </Defs>
          {data.map((item, index) => {
            const percentage = (item.y / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            const adjustedStartAngle = startAngle + padAngle / 2;
            const adjustedEndAngle = endAngle - padAngle / 2;
            
            const path = createPath(adjustedStartAngle, adjustedEndAngle, innerRadius, outerRadius);
            const gradientId = `gradient-${index}`;
            
            currentAngle = endAngle;
            
            return (
              <Path
                key={index}
                d={path}
                fill={`url(#${gradientId})`}
                stroke="#fff"
                strokeWidth={4}
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  // Prepare data for pie charts - filter out zero values and add labels with values
  const mainLifeData = gameData
    .filter(player => player.mainLifeDamage > 0)
    .map((player) => {
      return {
        x: player.name,
        y: player.mainLifeDamage,
        colors: player.colors,
        label: `${player.name}\n${player.mainLifeDamage}`,
      };
    });

  const commanderData = gameData
    .filter(player => player.commanderDamage > 0)
    .map((player) => {
      return {
        x: player.name,
        y: player.commanderDamage,
        colors: player.colors,
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
              <GradientPieChart 
                data={mainLifeData} 
                size={getPieChartSize()} 
                innerRadius={getPieChartSize() * 0.2} 
                padAngle={5} 
              />
              <View style={styles.legendContainer}>
                {mainLifeData.map((item, index) => {
                  const percentage = totalMainLifeDamage > 0 ? ((item.y / totalMainLifeDamage) * 100).toFixed(1) : 0;
                  const gradientColors = getGradientColors(item.colors);
                  return (
                    <View key={index} style={styles.legendItem}>
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.legendColor}
                      />
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
              <GradientPieChart 
                data={commanderData} 
                size={getPieChartSize()} 
                innerRadius={getPieChartSize() * 0.2} 
                padAngle={5} 
              />
              <View style={styles.legendContainer}>
                {commanderData.map((item, index) => {
                  const percentage = totalCommanderDamage > 0 ? ((item.y / totalCommanderDamage) * 100).toFixed(1) : 0;
                  const gradientColors = getGradientColors(item.colors);
                  return (
                    <View key={index} style={styles.legendItem}>
                      <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.legendColor}
                      />
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

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={shareGameData}
          >
            <Text style={styles.buttonText}>Share Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        </View>
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
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    maxHeight: 400,
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
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
  },
  buttonSecondary: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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

