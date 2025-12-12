import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WaitingScreen({ navigation }) {
  const [playerId, setPlayerId] = useState(null);
  const [status, setStatus] = useState('Creating account...');
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    initializePlayer();
  }, []);

  useEffect(() => {
    if (playerId) {
      startMatching();
    }
  }, [playerId]);

  // Animate the loading dots
  useEffect(() => {
    const fadeInOut = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    fadeInOut.start();
    return () => fadeInOut.stop();
  }, [fadeAnim]);

  const generatePlayerId = () => {
    // Generate a unique player ID using timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `player_${timestamp}_${random}`;
  };

  const initializePlayer = async () => {
    try {
      // Check if we already have a player ID stored
      let storedPlayerId = await AsyncStorage.getItem('playerId');
      
      if (!storedPlayerId) {
        // Generate new player ID
        storedPlayerId = generatePlayerId();
        await AsyncStorage.setItem('playerId', storedPlayerId);
      }

      setPlayerId(storedPlayerId);
      setStatus('Account created! Looking for another player...');

      // Create or update session in database
      const { error } = await supabase
        .from('sessions')
        .upsert(
          {
            player_id: storedPlayerId,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'player_id',
          }
        );

      if (error) {
        console.error('Error creating session:', error);
        // Continue anyway - session might already exist
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      setStatus('Error creating account. Please try again.');
    }
  };

  const startMatching = async () => {
    if (!playerId) return;

    try {
      console.log('Starting matching for player:', playerId);
      
      // Look for a waiting game lobby
      const { data: waitingGames, error: fetchError } = await supabase
        .from('games')
        .select('id')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching games:', fetchError);
        throw fetchError;
      }

      console.log('Waiting games found:', waitingGames);

      let gameId;

      if (waitingGames && waitingGames.length > 0) {
        // Join existing lobby
        gameId = waitingGames[0].id;
        console.log('Joining existing game:', gameId);
        
        // Check if player already in this game
        const { data: existingPlayer, error: checkError } = await supabase
          .from('game_players')
          .select('id')
          .eq('game_id', gameId)
          .eq('player_id', playerId)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing player:', checkError);
          throw checkError;
        }

        if (!existingPlayer) {
          // Add player to game
          const { error: joinError } = await supabase
            .from('game_players')
            .insert([
              {
                game_id: gameId,
                player_id: playerId,
              },
            ]);

          if (joinError) {
            console.error('Error joining game:', joinError);
            throw joinError;
          }
          console.log('Successfully joined game');
        } else {
          console.log('Player already in game');
        }
      } else {
        // Create a new game lobby
        console.log('Creating new game lobby');
        const { data: newGame, error: createError } = await supabase
          .from('games')
          .insert([
            {
              status: 'waiting',
              current_round: 1,
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating game:', createError);
          throw createError;
        }

        gameId = newGame.id;
        console.log('Created new game:', gameId);

        // Add current player to the game
        const { error: joinError } = await supabase
          .from('game_players')
          .insert([
            {
              game_id: gameId,
              player_id: playerId,
            },
          ]);

        if (joinError) {
          console.error('Error adding player to new game:', joinError);
          throw joinError;
        }
        console.log('Successfully added player to new game');
      }

      // Navigate to lobby
      setStatus('Joined lobby!');
      console.log('Navigating to lobby');
      setTimeout(() => {
        navigation.replace('Lobby', {
          playerId,
          gameId,
        });
      }, 500);
    } catch (error) {
      console.error('Error in matching:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setStatus(`Error: ${error.message || 'Unknown error'}. Retrying...`);
      // Retry after a delay
      setTimeout(() => startMatching(), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Thank You for Participating!</Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            You will play 10 rounds of an economic decision-making game.
          </Text>
          <Text style={styles.subMessage}>
            In each round, you'll either propose how to split points with another player,
            or decide whether to accept their proposal.
          </Text>
          <Text style={styles.subMessage}>
            Your earnings will be converted to dollars at the end.
          </Text>
          <Text style={styles.subMessage}>
            Please wait while we match you with other players...
          </Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Animated.Text
            style={[
              styles.statusText,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            {status}
          </Animated.Text>
        </View>

        {playerId && (
          <View style={styles.playerIdContainer}>
            <Text style={styles.playerIdLabel}>Your Player ID:</Text>
            <Text style={styles.playerId}>{playerId}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  messageContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
    lineHeight: 26,
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
  playerIdContainer: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  playerIdLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  playerId: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
});

