import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const UNITS = ['Tola', 'Masha', 'Ratti', 'Grams'];
const API_URL = 'http://YOUR_IP:5000/api'; // replace with your backend URL

export default function CalculatorScreen({ navigation }) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('Tola');
  const [rate, setRate] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [wastage, setWastage] = useState('');
  const [result, setResult] = useState(null);

  const calculateLocally = () => {
    const w = parseFloat(weight);
    const r = parseFloat(rate);
    const m = parseFloat(makingCharge) || 0;
    const ws = parseFloat(wastage) || 0;

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      Alert.alert('Error', 'Please enter valid weight and rate');
      return;
    }

    let weightInTola;
    switch(unit) {
      case 'Tola': weightInTola = w; break;
      case 'Masha': weightInTola = w / 12; break;
      case 'Ratti': weightInTola = w / 96; break;
      case 'Grams': weightInTola = w / 11.664; break;
      default: weightInTola = 0;
    }

    const goldValue = weightInTola * r;
    const making = weightInTola * m;
    const wastageAmount = goldValue * (ws / 100);
    const total = goldValue + making + wastageAmount;

    setResult({
      weightInTola: weightInTola.toFixed(4),
      goldValue: goldValue.toFixed(2),
      making: making.toFixed(2),
      wastage: wastageAmount.toFixed(2),
      total: total.toFixed(2)
    });
  };

  const saveToHistory = async () => {
    if (!result) return;
    try {
      await axios.post(`${API_URL}/calc/price`, {
        weight: parseFloat(weight),
        unit,
        ratePerTola: parseFloat(rate),
        makingPerTola: parseFloat(makingCharge) || 0,
        wastagePercent: parseFloat(wastage) || 0
      });
      Alert.alert('Saved', 'Calculation saved to history');
    } catch (err) {
      Alert.alert('Error', 'Could not save');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Weight Input */}
      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
        placeholder="Enter weight"
      />

      {/* Unit Picker */}
      <Text style={styles.label}>Unit</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={unit} onValueChange={setUnit} style={styles.picker}>
          {UNITS.map(u => <Picker.Item key={u} label={u} value={u} />)}
        </Picker>
      </View>

      {/* Rate per Tola */}
      <Text style={styles.label}>Today's Gold Rate (per Tola) ₹</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={rate}
        onChangeText={setRate}
        placeholder="e.g. 500000"
      />

      {/* Making Charge per Tola */}
      <Text style={styles.label}>Making Charge (per Tola) ₹ (optional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={makingCharge}
        onChangeText={setMakingCharge}
        placeholder="0"
      />

      {/* Wastage % */}
      <Text style={styles.label}>Wastage % (optional)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={wastage}
        onChangeText={setWastage}
        placeholder="0"
      />

      {/* Calculate Button */}
      <TouchableOpacity style={styles.calcButton} onPress={calculateLocally}>
        <Text style={styles.buttonText}>CALCULATE</Text>
      </TouchableOpacity>

      {/* Result Display */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Weight in Tola</Text><Text style={styles.resultValue}>{result.weightInTola}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Gold Value</Text><Text style={styles.resultValue}>₹ {result.goldValue}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Making Charges</Text><Text style={styles.resultValue}>₹ {result.making}</Text></View>
          <View style={styles.resultRow}><Text style={styles.resultLabel}>Wastage</Text><Text style={styles.resultValue}>₹ {result.wastage}</Text></View>
          <View style={[styles.resultRow, { borderTopWidth: 1, borderColor: '#ccc', marginTop: 5 }]}>
            <Text style={[styles.resultLabel, { fontWeight: 'bold' }]}>TOTAL</Text>
            <Text style={[styles.resultValue, { fontWeight: 'bold', color: '#B8860B' }]}>₹ {result.total}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={saveToHistory}>
            <Text style={styles.saveButtonText}>Save to History</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF8DC' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, color: '#8B4513' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DAA520', borderRadius: 8, padding: 12, fontSize: 16, marginTop: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#DAA520', borderRadius: 8, marginTop: 5, overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  calcButton: { backgroundColor: '#DAA520', padding: 15, borderRadius: 8, marginTop: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  resultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginTop: 25, elevation: 3, borderColor: '#B8860B', borderWidth: 1 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  resultLabel: { fontSize: 16, color: '#555' },
  resultValue: { fontSize: 16, color: '#000' },
  saveButton: { marginTop: 15, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 20, backgroundColor: '#8B4513', borderRadius: 5 },
  saveButtonText: { color: '#fff', fontWeight: '600' }
});