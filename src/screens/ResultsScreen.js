import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function ResultsScreen({ route }) {
  const { roundResults, totalEarnings, demographics } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Complete!</Text>
        <Text style={styles.subtitle}>Thank you for participating</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Total Points</Text>
          <Text style={styles.points}>{totalEarnings.toFixed(2)} points</Text>
          <Text style={styles.divider}>÷ 10 =</Text>
          <Text style={styles.sectionTitle}>Your Final Winnings</Text>
          <Text style={styles.earnings}>${(totalEarnings / 10).toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Round Results</Text>
          {roundResults.map((result, index) => (
            <View key={index} style={styles.roundResult}>
              <Text style={styles.roundNumber}>Round {result.round}</Text>
              <Text style={styles.roundRole}>Role: {result.role}</Text>
              <Text style={styles.roundDetails}>
                Matched with: {result.matchedWith}
              </Text>
              <Text style={styles.roundDetails}>
                Proposal: ${result.proposal.toFixed(2)} - {result.accepted ? 'Accepted' : 'Rejected'}
              </Text>
              <Text style={styles.roundPayout}>
                Your payout: ${result.myPayout.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demographic Information</Text>
          {demographics.dateOfBirth && (
            <Text style={styles.infoText}>Date of Birth: {demographics.dateOfBirth}</Text>
          )}
          {demographics.birthCountry && (
            <Text style={styles.infoText}>Birth Country: {demographics.birthCountry}</Text>
          )}
          {demographics.currentCountry && (
            <Text style={styles.infoText}>Current Country: {demographics.currentCountry}</Text>
          )}
          {demographics.generationStatus !== undefined && demographics.generationStatus !== null && (
            <Text style={styles.infoText}>
              Generation Status: {demographics.generationStatus}
              {demographics.generationStatus === 0 && ' (You came to the US)'}
              {demographics.generationStatus === 1 && ' (Your parents came to the US)'}
              {demographics.generationStatus === 2 && ' (Your grandparents came to the US)'}
              {demographics.generationStatus >= 3 && ' (Your great-grandparents or earlier)'}
            </Text>
          )}
        </View>

        <Text style={styles.thankYouText}>
          Your responses have been recorded. Thank you for your participation!
        </Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6200ee',
    marginVertical: 10,
  },
  divider: {
    fontSize: 24,
    textAlign: 'center',
    color: '#666',
    marginVertical: 10,
  },
  earnings: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4caf50',
    marginVertical: 10,
  },
  roundResult: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  roundNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  roundRole: {
    fontSize: 14,
    color: '#6200ee',
    marginBottom: 5,
    fontWeight: '600',
  },
  roundDetails: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  roundPayout: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});

