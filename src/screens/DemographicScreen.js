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
import { Picker } from '@react-native-picker/picker';
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
    if (!demographics.generationStatus) {
      Alert.alert('Error', 'Please select your generation status');
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
            generation_status: demographics.generationStatus || null,
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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={demographics.generationStatus}
                onValueChange={(value) => setDemographics({ ...demographics, generationStatus: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select generation status" value="" />
                <Picker.Item label="First generation (I immigrated)" value="first" />
                <Picker.Item label="Second generation (My parents immigrated)" value="second" />
                <Picker.Item label="Third+ generation (My grandparents or earlier)" value="third-plus" />
                <Picker.Item label="Born in the United States" value="us-born" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Countries You've Lived In *</Text>
            <Text style={styles.sublabel}>List all countries where you have lived with dates (at least one required)</Text>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.countryColumn]}>Country</Text>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>Start Date</Text>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>End Date</Text>
                <Text style={[styles.tableHeaderText, styles.actionColumn]}></Text>
              </View>

              {countries.map((country, index) => (
                <View key={index} style={styles.tableRow}>
                  <TextInput
                    style={[styles.tableInput, styles.countryColumn]}
                    value={country.country}
                    onChangeText={(text) => updateCountry(index, 'country', text)}
                    placeholder="Country"
                  />
                  <TextInput
                    style={[styles.tableInput, styles.dateColumn]}
                    value={country.startDate}
                    onChangeText={(text) => updateCountry(index, 'startDate', text)}
                    placeholder="MM/YYYY"
                  />
                  <TextInput
                    style={[styles.tableInput, styles.dateColumn]}
                    value={country.endDate}
                    onChangeText={(text) => updateCountry(index, 'endDate', text)}
                    placeholder="MM/YYYY or Present"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeCountryRow(index)}
                    disabled={countries.length === 1}
                  >
                    <Text style={[styles.removeButtonText, countries.length === 1 && styles.disabledText]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addButton} onPress={addCountryRow}>
                <Text style={styles.addButtonText}>+ Add Country</Text>
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
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 4,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  tableInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginRight: 5,
  },
  countryColumn: {
    flex: 3,
  },
  dateColumn: {
    flex: 2,
  },
  actionColumn: {
    width: 40,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#f44336',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  addButton: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#2196f3',
    fontSize: 14,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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

