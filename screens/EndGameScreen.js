import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { VictoryPie } from 'victory-native';

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

  // Distinct colors for each player in pie charts
  const PLAYER_CHART_COLORS = [
    '#667eea', // Player 1 - Blue/Purple
    '#50C878', // Player 2 - Green
    '#FF8C42', // Player 3 - Orange
    '#9B59B6', // Player 4 - Purple
    '#FFD93D', // Player 5 - Yellow
    '#00CED1', // Player 6 - Cyan
  ];

  // Prepare data for pie charts - filter out zero values and add labels with values
  const mainLifeData = gameData
    .filter(player => player.mainLifeDamage > 0)
    .map((player, index) => {
      const colorValue = PLAYER_CHART_COLORS[index % PLAYER_CHART_COLORS.length];
      return {
        x: player.name,
        y: player.mainLifeDamage,
        color: colorValue,
        label: `${player.name}\n${player.mainLifeDamage}`,
      };
    });

  const commanderData = gameData
    .filter(player => player.commanderDamage > 0)
    .map((player, index) => {
      const colorValue = PLAYER_CHART_COLORS[index % PLAYER_CHART_COLORS.length];
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
            // Use the same colors as pie charts for consistency
            const playerColor = PLAYER_CHART_COLORS[index % PLAYER_CHART_COLORS.length];
            return (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: playerColor },
                ]}
              >
                <Text style={[styles.statName, { color: '#fff' }]}>
                  {player.name}
                </Text>
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
  },
  statName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
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

