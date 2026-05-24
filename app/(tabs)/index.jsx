import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSavedRate, saveRate } from '../../utils/api';   // now local

export default function HomeScreen() {
  const [rate, setRate] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedRate();
  }, []);

  const loadSavedRate = async () => {
    setLoading(true);
    const data = await getSavedRate();
    if (data && data.ratePerTola) {
      setRate(String(data.ratePerTola));
      setLastSaved(data.date);
    }
    setLoading(false);
  };

  const handleSaveRate = async () => {
    const num = parseFloat(rate);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid', 'Please enter a valid rate');
      return;
    }
    try {
      const saved = await saveRate(num);
      setLastSaved(saved.date);
      Alert.alert('Saved', `Rate ₹${saved.ratePerTola} / Tola saved locally.`);
    } catch (err) {
      Alert.alert('Error', 'Could not save rate.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={40} color="#FFD700" />
        <Text style={styles.title}>Jewellery Calculator</Text>
        <Text style={styles.subtitle}>Professional Pakistani Gold Pricing</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Set Today's 24K Gold Rate</Text>
        <View style={styles.inputRow}>
          <Text style={styles.rupee}>₹</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
            placeholder="500000"
            placeholderTextColor="#999"
          />
          <Text style={styles.perUnit}>/ Tola</Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveRate}
          disabled={loading}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveButtonText}> Save on Phone</Text>
        </TouchableOpacity>
        {lastSaved && (
          <Text style={styles.lastSaved}>
            Last saved: {new Date(lastSaved).toLocaleDateString()}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push('/calculator')}>
        <Ionicons name="calculator" size={24} color="#fff" />
        <Text style={styles.navButtonText}>Open Calculator</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5C4033',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginBottom: 30,
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rupee: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B8860B',
    marginRight: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    color: '#333',
  },
  perUnit: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    paddingVertical: 12,
    borderRadius: 25,
  },
  saveButtonText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 16,
  },
  lastSaved: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
    color: '#888',
  },
  navButton: {
    flexDirection: 'row',
    backgroundColor: '#B8860B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});