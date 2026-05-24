import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = 'http://YOUR_IP:5000/api';

export default function HomeScreen({ navigation }) {
  const [latestRate, setLatestRate] = useState(null);

  useEffect(() => {
    fetchRate();
  }, []);

  const fetchRate = async () => {
    try {
      const res = await axios.get(`${API_URL}/rates/latest`);
      setLatestRate(res.data);
    } catch (err) { console.log(err); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🇵🇰 Jewellery Calculator</Text>
      {latestRate ? (
        <View style={styles.rateCard}>
          <Text style={styles.rateLabel}>Today's 24K Gold Rate</Text>
          <Text style={styles.rateValue}>₹ {latestRate.ratePerTola} / Tola</Text>
          {latestRate.makingChargePerTola > 0 && <Text>Making: ₹ {latestRate.makingChargePerTola}/Tola</Text>}
        </View>
      ) : (
        <Text>Loading rate...</Text>
      )}
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Calculator')}>
        <Text style={styles.buttonText}>Open Calculator</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8DC', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#B8860B', marginBottom: 30 },
  rateCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 3, marginBottom: 30, alignItems: 'center', borderColor: '#DAA520', borderWidth: 1 },
  rateLabel: { fontSize: 16, color: '#555' },
  rateValue: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 5 },
  navButton: { backgroundColor: '#DAA520', padding: 15, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});