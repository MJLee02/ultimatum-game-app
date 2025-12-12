import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../config/supabase';

export default function DemographicScreen({ route, navigation }) {
  const { playerId, gameId, roundResults, totalEarnings } = route.params;
  const [demographics, setDemographics] = useState({
    dateOfBirth: '',
    birthCountry: '',
    currentCountry: 'United States',
    generationStatus: '',
  });
  const [countries, setCountries] = useState([
    { country: '', startDate: '', endDate: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addCountryRow = () => {
    setCountries([...countries, { country: '', startDate: '', endDate: '' }]);
  };

  const removeCountryRow = (index) => {
    if (countries.length > 1) {
      const newCountries = countries.filter((_, i) => i !== index);
      setCountries(newCountries);
    }
  };

  const updateCountry = (index, field, value) => {
    const newCountries = [...countries];
    newCountries[index][field] = value;
    setCountries(newCountries);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!demographics.dateOfBirth || !demographics.birthCountry) {
      Alert.alert('Error', 'Please fill in Date of Birth and Birth Country fields');
      return;
    }

    // Validate generation status
    if (!demographics.generationStatus || demographics.generationStatus.trim() === '') {
      Alert.alert('Error', 'Please enter your generation status (0, 1, 2, 3, etc.)');
      return;
    }
    
    const genStatus = parseInt(demographics.generationStatus);
    if (isNaN(genStatus) || genStatus < 0) {
      Alert.alert('Error', 'Generation status must be a number 0 or greater');
      return;
    }

    // Validate at least one country is filled
    const filledCountries = countries.filter(c => c.country.trim() !== '');
    if (filledCountries.length === 0) {
      Alert.alert('Error', 'Please add at least one country where you have lived');
      return;
    }

    setSubmitting(true);
    try {
      // Save demographic data
      const { error: demoError } = await supabase
        .from('demographics')
        .insert([
          {
            player_id: playerId,
            game_id: gameId,
            date_of_birth: demographics.dateOfBirth,
            birth_country: demographics.birthCountry,
            current_country: demographics.currentCountry,
            generation_status: parseInt(demographics.generationStatus),
            countries_lived: JSON.stringify(countries.filter(c => c.country)), // Only save filled countries
            created_at: new Date().toISOString(),
          },
        ]);

      if (demoError) throw demoError;

      // Navigate to results screen
      navigation.navigate('Results', {
        playerId,
        gameId,
        roundResults,
        totalEarnings,
        demographics,
      });
    } catch (error) {
      console.error('Error submitting demographics:', error);
      Alert.alert('Error', 'Failed to save demographic data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Demographic Questions</Text>
        <Text style={styles.subtitle}>
          Please answer the following questions. This information will be kept confidential.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={demographics.dateOfBirth}
              onChangeText={(text) => setDemographics({ ...demographics, dateOfBirth: text })}
              placeholder="MM/DD/YYYY"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country of Birth *</Text>
            <TextInput
              style={styles.input}
              value={demographics.birthCountry}
              onChangeText={(text) => setDemographics({ ...demographics, birthCountry: text })}
              placeholder="Enter your birth country"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Country of Residence</Text>
            <TextInput
              style={styles.input}
              value={demographics.currentCountry}
              onChangeText={(text) => setDemographics({ ...demographics, currentCountry: text })}
              placeholder="United States"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Generation Status *</Text>
            <Text style={styles.sublabel}>
              Enter a number where:{'\n'}
              • 0 = You came to the US (First generation){'\n'}
              • 1 = Your parents came to the US (Second generation){'\n'}
              • 2 = Your grandparents came to the US (Third generation){'\n'}
              • 3+ = Your great-grandparents or earlier (Fourth+ generation)
            </Text>
            <TextInput
              style={styles.input}
              value={demographics.generationStatus}
              onChangeText={(text) => setDemographics({ ...demographics, generationStatus: text })}
              placeholder="Enter 0, 1, 2, 3, etc."
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Countries You've Lived In *</Text>
            <Text style={styles.sublabel}>List all countries where you have lived with dates (at least one required)</Text>
            
            <View style={styles.countriesContainer}>
              {countries.map((country, index) => (
                <View key={index} style={styles.countryCard}>
                  <View style={styles.countryCardHeader}>
                    <Text style={styles.countryCardTitle}>Country {index + 1}</Text>
                    <TouchableOpacity
                      style={[styles.removeButton, countries.length === 1 && styles.removeButtonDisabled]}
                      onPress={() => removeCountryRow(index)}
                      disabled={countries.length === 1}
                    >
                      <Text style={[styles.removeButtonText, countries.length === 1 && styles.disabledText]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.fieldLabel}>Country Name</Text>
                  <TextInput
                    style={styles.countryInput}
                    value={country.country}
                    onChangeText={(text) => updateCountry(index, 'country', text)}
                    placeholder="e.g., United States"
                  />
                  
                  <View style={styles.dateRow}>
                    <View style={styles.dateField}>
                      <Text style={styles.fieldLabel}>Start Date</Text>
                      <TextInput
                        style={styles.countryInput}
                        value={country.startDate}
                        onChangeText={(text) => updateCountry(index, 'startDate', text)}
                        placeholder="MM/YYYY"
                      />
                    </View>
                    
                    <View style={styles.dateField}>
                      <Text style={styles.fieldLabel}>End Date</Text>
                      <TextInput
                        style={styles.countryInput}
                        value={country.endDate}
                        onChangeText={(text) => updateCountry(index, 'endDate', text)}
                        placeholder="Present"
                      />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addCountryRow}>
                <Text style={styles.addButtonText}>+ Add Another Country</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  countriesContainer: {
    marginTop: 10,
  },
  countryCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countryCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
    marginTop: 8,
  },
  countryInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateField: {
    flex: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 18,
  },
  removeButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#f44336',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  addButton: {
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#2196f3',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

