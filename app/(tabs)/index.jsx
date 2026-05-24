import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getSavedRate, saveRate } from '../../utils/api';

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
      Alert.alert('Saved', `Rate Rs ${saved.ratePerTola} / Tola saved locally.`);
    } catch (err) {
      Alert.alert('Error', 'Could not save rate.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={40} color="#B8860B" />
        <Text style={styles.title}>Jewellery Calculator</Text>
        <Text style={styles.subtitle}>Professional Pakistani Gold Pricing</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Set Today's 24K Gold Rate</Text>
        <View style={styles.inputRow}>
          <Text style={styles.rupee}>Rs</Text>
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
          <Text style={styles.saveButtonText}>Save on Phone</Text>
        </TouchableOpacity>
        {lastSaved && (
          <Text style={styles.lastSaved}>
            Last saved: {new Date(lastSaved).toLocaleDateString()}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/calculator')}
      >
        <Ionicons name="calculator" size={24} color="#fff" />
        <Text style={styles.navButtonText}>Open Calculator</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5C4033',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rupee: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B8860B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FDF8E7',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: '#333',
  },
  perUnit: {
    fontSize: 16,
    color: '#888',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 12,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  lastSaved: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    marginTop: 8,
  },
  navButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 14,
    borderRadius: 30,
    width: '100%',
    elevation: 4,
    shadowColor: '#B8860B',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});