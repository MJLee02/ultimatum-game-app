import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../config/supabase';

const TOTAL_ROUNDS = 10;
const TOTAL_AMOUNT = 40;

export default function GameScreen({ route, navigation }) {
  const { playerId, gameId } = route.params;
  const [currentRound, setCurrentRound] = useState(1);
  const [myRole, setMyRole] = useState(null);
  const [matchedWith, setMatchedWith] = useState(null);
  const [proposal, setProposal] = useState('');
  const [currentProposal, setCurrentProposal] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoundInfo();
  }, [currentRound]);

  useEffect(() => {
    if (myRole && matchedWith && !hasSubmitted) {
      if (myRole === 'responder') {
        pollForProposal();
      }
    }
  }, [myRole, matchedWith, hasSubmitted]);

  const loadRoundInfo = async () => {
    setLoading(true);
    try {
      // Get my role and match for this round
      const { data: roleData, error: roleError } = await supabase
        .from('player_roles')
        .select('*')
        .eq('game_id', gameId)
        .eq('player_id', playerId)
        .eq('round_number', currentRound)
        .single();

      if (roleError) throw roleError;

      setMyRole(roleData.role);
      setMatchedWith(roleData.matched_with);

      // Check if there's already a round entry
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('*')
        .eq('game_id', gameId)
        .eq('round_number', currentRound)
        .eq('proposer_id', roleData.role === 'proposer' ? playerId : roleData.matched_with)
        .eq('responder_id', roleData.role === 'responder' ? playerId : roleData.matched_with)
        .maybeSingle();

      if (roundError && roundError.code !== 'PGRST116') throw roundError;

      if (roundData) {
        if (roleData.role === 'proposer') {
          if (roundData.responder_decision !== null) {
            // Round completed
            setHasSubmitted(true);
            setWaitingForOpponent(false);
            handleRoundComplete(roundData);
          } else if (roundData.proposal_amount !== null) {
            // Waiting for responder
            setHasSubmitted(true);
            setWaitingForOpponent(true);
            pollForResponse();
          }
        } else {
          // Responder
          if (roundData.proposal_amount !== null) {
            setCurrentProposal(roundData.proposal_amount);
            if (roundData.responder_decision !== null) {
              // Already submitted
              setHasSubmitted(true);
              setWaitingForOpponent(false);
              handleRoundComplete(roundData);
            }
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading round info:', error);
      Alert.alert('Error', 'Failed to load round information.');
      setLoading(false);
    }
  };

  const handleProposal = async () => {
    const amount = parseFloat(proposal);
    if (isNaN(amount) || amount < 0 || amount > TOTAL_AMOUNT) {
      Alert.alert('Invalid Proposal', `Please enter a number between 0 and ${TOTAL_AMOUNT}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('rounds')
        .insert([
          {
            game_id: gameId,
            round_number: currentRound,
            proposer_id: playerId,
            responder_id: matchedWith,
            proposal_amount: amount,
          },
        ]);

      if (error) throw error;

      setHasSubmitted(true);
      setWaitingForOpponent(true);
      pollForResponse();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      Alert.alert('Error', 'Failed to submit proposal. Please try again.');
    }
  };

  const handleResponse = async (accepted) => {
    try {
      const proposalAmount = currentProposal;
      const proposerAmount = TOTAL_AMOUNT - proposalAmount;
      const responderAmount = accepted ? proposalAmount : 0;
      const finalProposerAmount = accepted ? proposerAmount : 0;

      const { error } = await supabase
        .from('rounds')
        .update({
          responder_decision: accepted,
          proposer_payout: finalProposerAmount,
          responder_payout: responderAmount,
          completed_at: new Date().toISOString(),
        })
        .eq('game_id', gameId)
        .eq('round_number', currentRound)
        .eq('proposer_id', matchedWith)
        .eq('responder_id', playerId);

      if (error) throw error;

      setHasSubmitted(true);

      const roundResult = {
        round: currentRound,
        role: myRole,
        matchedWith,
        proposal: proposalAmount,
        accepted,
        myPayout: responderAmount,
      };

      const updatedResults = [...roundResults, roundResult];
      setRoundResults(updatedResults);

      // Wait a bit then move to next round
      setTimeout(() => {
        if (currentRound < TOTAL_ROUNDS) {
          resetForNextRound();
        } else {
          navigateToDemographics(updatedResults);
        }
      }, 2000);
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    }
  };

  const pollForProposal = () => {
    const interval = setInterval(async () => {
      try {
        const { data: roundData, error } = await supabase
          .from('rounds')
          .select('*')
          .eq('game_id', gameId)
          .eq('round_number', currentRound)
          .eq('proposer_id', matchedWith)
          .eq('responder_id', playerId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          clearInterval(interval);
          return;
        }

        if (roundData && roundData.proposal_amount !== null) {
          clearInterval(interval);
          setCurrentProposal(roundData.proposal_amount);
          setWaitingForOpponent(false);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling for proposal:', error);
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  const pollForResponse = () => {
    const interval = setInterval(async () => {
      try {
        const { data: roundData, error } = await supabase
          .from('rounds')
          .select('*')
          .eq('game_id', gameId)
          .eq('round_number', currentRound)
          .eq('proposer_id', playerId)
          .eq('responder_id', matchedWith)
          .single();

        if (error) {
          clearInterval(interval);
          return;
        }

        if (roundData.responder_decision !== null) {
          clearInterval(interval);
          setWaitingForOpponent(false);
          handleRoundComplete(roundData);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling for response:', error);
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  const handleRoundComplete = (roundData) => {
    const roundResult = {
      round: currentRound,
      role: myRole,
      matchedWith,
      proposal: roundData.proposal_amount,
      accepted: roundData.responder_decision,
      myPayout: myRole === 'proposer' ? roundData.proposer_payout : roundData.responder_payout,
    };

    const updatedResults = [...roundResults, roundResult];
    setRoundResults(updatedResults);

    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        resetForNextRound();
      } else {
        navigateToDemographics(updatedResults);
      }
    }, 2000);
  };

  const resetForNextRound = () => {
    setCurrentRound(currentRound + 1);
    setMyRole(null);
    setMatchedWith(null);
    setProposal('');
    setCurrentProposal(null);
    setHasSubmitted(false);
    setWaitingForOpponent(false);
  };

  const navigateToDemographics = (results = roundResults) => {
    const totalEarnings = results.reduce((sum, r) => sum + (r.myPayout || 0), 0);
    navigation.navigate('Demographic', {
      playerId,
      gameId,
      roundResults: results,
      totalEarnings,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading round...</Text>
      </View>
    );
  }

  if (waitingForOpponent) {
    return (
      <View style={styles.container}>
        <Text style={styles.roundText}>Round {currentRound} of {TOTAL_ROUNDS}</Text>
        <ActivityIndicator size="large" color="#6200ee" style={styles.spinner} />
        <Text style={styles.waitingText}>
          Waiting for {myRole === 'proposer' ? 'responder' : 'proposer'} to respond...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.roundText}>Round {currentRound} of {TOTAL_ROUNDS}</Text>
        <Text style={styles.roleText}>
          You are the {myRole === 'proposer' ? 'Proposer' : 'Responder'}
        </Text>

        {myRole === 'proposer' ? (
          <View style={styles.proposerContainer}>
            <Text style={styles.instructionText}>
              You have {TOTAL_AMOUNT} points to split. How many points do you want to offer to the responder?
            </Text>
            <TextInput
              style={styles.input}
              value={proposal}
              onChangeText={setProposal}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!hasSubmitted}
            />
            <Text style={styles.hintText}>
              You will receive {TOTAL_AMOUNT} - (your offer) points if accepted.
              {'\n'}If rejected, you both get 0 points.
            </Text>
            <TouchableOpacity
              style={[styles.button, hasSubmitted && styles.buttonDisabled]}
              onPress={handleProposal}
              disabled={hasSubmitted}
            >
              <Text style={styles.buttonText}>
                {hasSubmitted ? 'Submitted' : 'Submit Proposal'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.responderContainer}>
            {currentProposal !== null ? (
              <>
                <Text style={styles.instructionText}>
                  The proposer has offered you {currentProposal.toFixed(0)} points.
                </Text>
                <Text style={styles.hintText}>
                  If you accept: You get {currentProposal.toFixed(0)} points, they get {(TOTAL_AMOUNT - currentProposal).toFixed(0)} points.
                  {'\n'}If you reject: You both get 0 points.
                </Text>
                {!hasSubmitted ? (
                  <View style={styles.responseButtons}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => handleResponse(false)}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                      <Text style={styles.outcomeText}>You get 0 points</Text>
                      <Text style={styles.outcomeText}>They get 0 points</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={() => handleResponse(true)}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                      <Text style={styles.outcomeText}>You get {currentProposal.toFixed(0)} points</Text>
                      <Text style={styles.outcomeText}>They get {(TOTAL_AMOUNT - currentProposal).toFixed(0)} points</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.submittedText}>Response submitted!</Text>
                )}
              </>
            ) : (
              <>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.instructionText}>
                  Waiting for proposal from the proposer...
                </Text>
              </>
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  waitingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  spinner: {
    marginVertical: 20,
  },
  roundText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#6200ee',
    fontWeight: '600',
  },
  proposerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  responderContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  outcomeText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 3,
  },
  responseButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  submittedText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    color: '#4caf50',
  },
});
