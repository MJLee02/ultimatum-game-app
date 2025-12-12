import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';

export default function LobbyScreen({ route, navigation }) {
  const { playerId, gameId } = route.params;
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlayers();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      loadPlayers();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadPlayers = async () => {
    try {
      // Get game status
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('status, started_by')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;

      setGameStatus(game.status);

      // If game started, navigate to game screen
      if (game.status === 'active') {
        navigation.replace('Game', { playerId, gameId });
        return;
      }

      // Get all players in the game
      const { data: gamePlayers, error: playersError } = await supabase
        .from('game_players')
        .select('player_id, joined_at')
        .eq('game_id', gameId)
        .order('joined_at', { ascending: true });

      if (playersError) throw playersError;

      setPlayers(gamePlayers || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleStartGame = async () => {
    const playerCount = players.length;

    // Check if even number of players
    if (playerCount < 2) {
      Alert.alert('Not Enough Players', 'You need at least 2 players to start the game.');
      return;
    }

    if (playerCount % 2 !== 0) {
      Alert.alert('Odd Number of Players', 'You need an even number of players to start the game.');
      return;
    }

    setLoading(true);

    try {
      // Generate role assignments for all 10 rounds
      await generateRoleAssignments();

      // Update game status to active
      const { error: updateError } = await supabase
        .from('games')
        .update({
          status: 'active',
          started_by: playerId,
          current_round: 1,
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Navigate to game screen
      navigation.replace('Game', { playerId, gameId });
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateRoleAssignments = async () => {
    const playerIds = players.map(p => p.player_id);
    const playerCount = playerIds.length;
    const halfCount = playerCount / 2;

    // For each player, randomly assign 5 rounds as proposer and 5 as responder
    const allRoleAssignments = [];

    for (let roundNum = 1; roundNum <= 10; roundNum++) {
      // Shuffle players
      const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);
      
      // First half are proposers, second half are responders
      const proposers = shuffledPlayers.slice(0, halfCount);
      const responders = shuffledPlayers.slice(halfCount);

      // Match proposers with responders
      for (let i = 0; i < proposers.length; i++) {
        allRoleAssignments.push({
          game_id: gameId,
          player_id: proposers[i],
          round_number: roundNum,
          role: 'proposer',
          matched_with: responders[i],
        });

        allRoleAssignments.push({
          game_id: gameId,
          player_id: responders[i],
          round_number: roundNum,
          role: 'responder',
          matched_with: proposers[i],
        });
      }
    }

    // Now ensure each player has exactly 5 proposer and 5 responder rounds
    // Count roles per player
    const playerRoleCounts = {};
    playerIds.forEach(pid => {
      playerRoleCounts[pid] = { proposer: 0, responder: 0 };
    });

    // Better algorithm: assign roles round by round ensuring balance
    const finalAssignments = [];
    const playerProposerCount = {};
    const playerResponderCount = {};
    
    playerIds.forEach(pid => {
      playerProposerCount[pid] = 0;
      playerResponderCount[pid] = 0;
    });

    for (let roundNum = 1; roundNum <= 10; roundNum++) {
      // Get players who still need proposer roles and can be proposers
      const availableProposers = playerIds.filter(pid => playerProposerCount[pid] < 5);
      const availableResponders = playerIds.filter(pid => playerResponderCount[pid] < 5);

      // Shuffle to randomize
      const shuffledProposers = [...availableProposers].sort(() => Math.random() - 0.5);
      const shuffledResponders = [...availableResponders].sort(() => Math.random() - 0.5);

      // Take half as proposers
      const proposers = [];
      const responders = [];

      for (const pid of shuffledProposers) {
        if (proposers.length < halfCount && !responders.includes(pid)) {
          proposers.push(pid);
        }
      }

      for (const pid of shuffledResponders) {
        if (responders.length < halfCount && !proposers.includes(pid)) {
          responders.push(pid);
        }
      }

      // Match them
      for (let i = 0; i < proposers.length; i++) {
        finalAssignments.push({
          game_id: gameId,
          player_id: proposers[i],
          round_number: roundNum,
          role: 'proposer',
          matched_with: responders[i],
        });

        finalAssignments.push({
          game_id: gameId,
          player_id: responders[i],
          round_number: roundNum,
          role: 'responder',
          matched_with: proposers[i],
        });

        playerProposerCount[proposers[i]]++;
        playerResponderCount[responders[i]]++;
      }
    }

    // Insert all role assignments
    const { error } = await supabase
      .from('player_roles')
      .insert(finalAssignments);

    if (error) throw error;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Lobby</Text>
        <Text style={styles.subtitle}>
          Waiting for players to join...
        </Text>
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>Game Rules:</Text>
        <Text style={styles.infoText}>
          • You'll play 10 rounds total
          {'\n'}• You'll be a proposer in 5 rounds and a responder in 5 rounds
          {'\n'}• Each round, you'll be matched with a different player
          {'\n'}• Proposers offer to split 40 points with responders
          {'\n'}• If accepted: both get their share. If rejected: both get 0
          {'\n'}• Your total points ÷ 10 = your dollar earnings
        </Text>
      </View>

      <View style={styles.playerCountContainer}>
        <Text style={styles.playerCount}>{players.length} Player{players.length !== 1 ? 's' : ''}</Text>
        {players.length % 2 !== 0 && players.length > 0 && (
          <Text style={styles.warningText}>
            ⚠️ Need an even number of players
          </Text>
        )}
      </View>

      <ScrollView style={styles.playerList}>
        {players.map((player, index) => (
          <View key={player.player_id} style={styles.playerItem}>
            <View style={styles.playerNumber}>
              <Text style={styles.playerNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.playerText}>
              {player.player_id === playerId ? 'You' : player.player_id}
            </Text>
            {player.player_id === playerId && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (players.length < 2 || players.length % 2 !== 0 || loading) && styles.startButtonDisabled,
          ]}
          onPress={handleStartGame}
          disabled={players.length < 2 || players.length % 2 !== 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>Start Game</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Once the game starts, no new players can join.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  rulesContainer: {
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  playerCountContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  playerCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  warningText: {
    fontSize: 14,
    color: '#ff9800',
    marginTop: 5,
  },
  playerList: {
    flex: 1,
    padding: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playerNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  playerNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  youBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  youBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  startButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
    lineHeight: 22,
  },
  footerNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
});

