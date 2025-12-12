import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../config/supabase';

export default function WelcomeScreen({ navigation }) {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!playerId.trim()) {
      Alert.alert('Error', 'Please enter a player ID');
      return;
    }

    setLoading(true);
    try {
      // Create a new session in the database
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            player_id: playerId.trim(),
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        // If player already exists, that's okay - we'll use existing session
        if (error.code !== '23505') {
          throw error;
        }
      }

      // Navigate to waiting screen
      navigation.navigate('Waiting');
    } catch (error) {
      Alert.alert('Error', 'Failed to start session. Please try again.');
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Ultimatum Game</Text>
        <Text style={styles.description}>
          Welcome! You will play 10 rounds of the ultimatum game with another player.
          {'\n\n'}
          In each round, one player will propose how to split $10, and the other player
          will decide whether to accept or reject the proposal.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Enter your Player ID:</Text>
          <TextInput
            style={styles.input}
            value={playerId}
            onChangeText={setPlayerId}
            placeholder="e.g., Player1"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Starting...' : 'Start Game'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

