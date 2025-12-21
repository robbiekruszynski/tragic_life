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

  // Prepare data for pie charts - filter out zero values
  const mainLifeData = gameData
    .filter(player => player.mainLifeDamage > 0)
    .map((player) => {
      const firstColor = player.colors && player.colors.length > 0 ? player.colors[0] : 'grey';
      return {
        x: player.name,
        y: player.mainLifeDamage,
        color: COLORS[firstColor]?.color || COLORS.grey.color,
      };
    });

  const commanderData = gameData
    .filter(player => player.commanderDamage > 0)
    .map((player) => {
      const firstColor = player.colors && player.colors.length > 0 ? player.colors[0] : 'grey';
      return {
        x: player.name,
        y: player.commanderDamage,
        color: COLORS[firstColor]?.color || COLORS.grey.color,
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
            <VictoryPie
              data={mainLifeData}
              colorScale={mainLifeData.map(item => item.color)}
              width={350}
              height={350}
              labelRadius={({ innerRadius }) => innerRadius + 50}
              innerRadius={50}
              style={{
                labels: {
                  fill: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                },
                data: {
                  stroke: '#fff',
                  strokeWidth: 2,
                },
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No main life damage taken</Text>
            </View>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Commander Damage</Text>
          {totalCommanderDamage > 0 && commanderData.length > 0 ? (
            <VictoryPie
              data={commanderData}
              colorScale={commanderData.map(item => item.color)}
              width={350}
              height={350}
              labelRadius={({ innerRadius }) => innerRadius + 50}
              innerRadius={50}
              style={{
                labels: {
                  fill: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                },
                data: {
                  stroke: '#fff',
                  strokeWidth: 2,
                },
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No commander damage taken</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          {gameData.map((player, index) => {
            const playerColors = player.colors ? (Array.isArray(player.colors) ? player.colors : [player.colors]) : ['grey'];
            const firstColor = playerColors.length > 0 ? playerColors[0] : 'grey';
            const colorInfo = COLORS[firstColor] || COLORS.grey;
            return (
              <View
                key={index}
                style={[
                  styles.statCard,
                  { backgroundColor: colorInfo.color },
                ]}
              >
                <Text style={[styles.statName, { color: colorInfo.textColor }]}>
                  {player.name}
                </Text>
                {playerColors.length > 0 && (
                  <Text style={[styles.statText, { color: colorInfo.textColor, fontSize: 12 }]}>
                    Colors: {playerColors.map(c => COLORS[c]?.name || c).join(', ')}
                  </Text>
                )}
                <Text style={[styles.statText, { color: colorInfo.textColor }]}>
                  Main Life Damage: {player.mainLifeDamage}
                </Text>
                <Text style={[styles.statText, { color: colorInfo.textColor }]}>
                  Commander Damage: {player.commanderDamage}
                </Text>
                <Text style={[styles.statText, { color: colorInfo.textColor }]}>
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
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 175,
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
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statText: {
    fontSize: 16,
    marginBottom: 5,
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
});

