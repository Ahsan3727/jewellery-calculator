import React, { useState, useMemo ,useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
  Platform, KeyboardAvoidingView, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSavedRate } from '../../utils/api';

const UNITS = ['Tola', 'Masha', 'Ratti', 'Grams'];

// Full list for the modal
const KARAT_LIST = [
  { label: '24K (Pure)', value: 24 },
  { label: '23.5K', value: 23.5 },
  { label: '23K', value: 23 },
  { label: '22.5K', value: 22.5 },
  { label: '22K', value: 22 },
  { label: '21.5K', value: 21.5 },
  { label: '21K', value: 21 },
  { label: '20.5K', value: 20.5 },
  { label: '20K', value: 20 },
  { label: '19.5K', value: 19.5 },
  { label: '19K', value: 19 },
  { label: '18.5K', value: 18.5 },
  { label: '18K', value: 18 },
  { label: '17.5K', value: 17.5 },
  { label: '17K', value: 17 },
  { label: '16.5K', value: 16.5 },
  { label: '16K', value: 16 },
  { label: '15K', value: 15 },
  { label: '14K', value: 14 },
];

function toTolaMashaRatti(decimalTola) {
  const totalRatti = Math.round(decimalTola * 96);
  const tola = Math.floor(totalRatti / 96);
  const remainder = totalRatti % 96;
  const masha = Math.floor(remainder / 8);
  const ratti = remainder % 8;
  return { tola, masha, ratti };
}

function formatKaat(ratti) {
  const masha = Math.floor(ratti / 8);
  const remRatti = ratti % 8;
  if (masha === 0 && remRatti === 0) return '0 (Pure)';
  let parts = [];
  if (masha > 0) parts.push(`${masha} Masha`);
  if (remRatti > 0) parts.push(`${remRatti} Ratti`);
  return parts.join(' ') + ` (${ratti} Ratti)`;
}

// Convert kaat multiplier to approximate karat
function multiplierToKarat(multiplier) {
  const m = parseFloat(multiplier);
  if (isNaN(m)) return '';
  const karat = 24 - 3 * m;
  if (karat < 0) return '< 0K';
  return karat.toFixed(1) + 'K';
}

export default function CalculatorScreen() {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('Tola');
  const [rate, setRate] = useState('');
  const [kaatMultiplier, setKaatMultiplier] = useState('1');   // default 1 (21K)
  const [makingCharge, setMakingCharge] = useState('');
  const [wastage, setWastage] = useState('');
  const [showCharges, setShowCharges] = useState(false);
  const [result, setResult] = useState(null);
  const [showKaratModal, setShowKaratModal] = useState(false);

  const kaatKaratLabel = useMemo(() => multiplierToKarat(kaatMultiplier), [kaatMultiplier]);
// Auto-load saved rate when screen opens
useEffect(() => {
  loadSavedRate();
}, []);

const loadSavedRate = async () => {
  const data = await getSavedRate();
  if (data && data.ratePerTola) {
    setRate(String(data.ratePerTola));
  }
};
  const calculateLocally = () => {
    const w = parseFloat(weight);
    const r = parseFloat(rate);
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      Alert.alert('Required', 'Please enter valid weight and 24K rate.');
      return;
    }

    const m = parseFloat(kaatMultiplier);
    if (isNaN(m) || m < 0) {
      Alert.alert('Invalid', 'Please enter a valid kaat multiplier.');
      return;
    }
    const kaatRatti = m * 12;
    const purity = (96 - kaatRatti) / 96;

    // effective rate per tola
    const effectiveRate = r * purity;
    const deductionPerTola = r - effectiveRate;

    let weightInTola;
    switch (unit) {
      case 'Tola': weightInTola = w; break;
      case 'Masha': weightInTola = w / 12; break;
      case 'Ratti': weightInTola = w / 96; break;
      case 'Grams': weightInTola = w / 11.664; break;
      default: weightInTola = 0;
    }

    const goldValue = weightInTola * effectiveRate;
    const making = weightInTola * (parseFloat(makingCharge) || 0);
    const wastageAmount = goldValue * ((parseFloat(wastage) || 0) / 100);
    const total = goldValue + making + wastageAmount;
    const breakdown = toTolaMashaRatti(weightInTola);

    setResult({
      weightInTola: weightInTola.toFixed(4),
      tola: breakdown.tola,
      masha: breakdown.masha,
      ratti: breakdown.ratti,
      purity: purity,
      kaatRatti: kaatRatti,
      deductionPerTola: deductionPerTola.toFixed(2),
      effectiveRate: effectiveRate.toFixed(2),
      goldValue: goldValue.toFixed(2),
      making: making.toFixed(2),
      wastage: wastageAmount.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const clearResult = () => setResult(null);

  // When a karat is selected from the modal
  const selectKarat = (karatValue) => {
    const multiplier = ((24 - karatValue) / 3).toFixed(1);  // e.g., 24-21=3/3=1.0
    setKaatMultiplier(multiplier);
    setShowKaratModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F0E1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Weight & Unit */}
        <View style={styles.rowGroup}>
          <View style={{ flex: 2, marginRight: 10 }}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              placeholder="Ex: 1.5"
              placeholderTextColor="#999"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.unitRow}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, unit === u && styles.unitChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Rate */}
        <Text style={styles.label}>24K Gold Rate (per Tola) ₹</Text>
        <View style={styles.inputRow}>
          <Text style={styles.rupeeSign}>₹</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
            placeholder="500000"
            placeholderTextColor="#999"
          />
        </View>

        {/* Purity / Kaat Section – always visible multiplier */}
        <Text style={styles.label}>Purity (Kaat)</Text>
        <View style={styles.kaatRow}>
          <View style={{ flex: 2 }}>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={kaatMultiplier}
              onChangeText={setKaatMultiplier}
              placeholder="1"
              placeholderTextColor="#999"
            />
            <Text style={styles.kaatHint}>
              Kaat multiplier (×12). Equivalent: {kaatKaratLabel || '?'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.karatListBtn}
            onPress={() => setShowKaratModal(true)}
          >
            <Ionicons name="list-outline" size={18} color="#fff" />
            <Text style={styles.karatListBtnText}> Karat</Text>
          </TouchableOpacity>
        </View>

        {/* Expandable Additional Charges */}
        <TouchableOpacity
          style={styles.expandToggle}
          onPress={() => setShowCharges(!showCharges)}
        >
          <Ionicons name="construct-outline" size={18} color="#5C4033" />
          <Text style={styles.expandText}>Additional Charges</Text>
          <Ionicons
            name={showCharges ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#5C4033"
          />
        </TouchableOpacity>

        {showCharges && (
          <View style={styles.chargesBox}>
            <View style={styles.chargeRow}>
              <Text style={styles.smallLabel}>Making/Tola ₹</Text>
              <TextInput
                style={[styles.input, { width: 100 }]}
                keyboardType="decimal-pad"
                value={makingCharge}
                onChangeText={setMakingCharge}
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.chargeRow}>
              <Text style={styles.smallLabel}>Wastage %</Text>
              <TextInput
                style={[styles.input, { width: 100 }]}
                keyboardType="decimal-pad"
                value={wastage}
                onChangeText={setWastage}
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        )}

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calcBtn} onPress={calculateLocally}>
          <Ionicons name="calculator" size={22} color="#fff" />
          <Text style={styles.calcBtnText}>CALCULATE</Text>
        </TouchableOpacity>

        {/* Result inline */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.weightRow}>
              <Text style={styles.bigWeight}>
                {result.tola} <Text style={styles.weightUnit}>Tola</Text>
              </Text>
              <Text style={styles.sep}>/</Text>
              <Text style={styles.bigWeight}>
                {result.masha} <Text style={styles.weightUnit}>Masha</Text>
              </Text>
              <Text style={styles.sep}>/</Text>
              <Text style={styles.bigWeight}>
                {result.ratti} <Text style={styles.weightUnit}>Ratti</Text>
              </Text>
            </View>
            <Text style={styles.decimal}>({result.weightInTola} Tola)</Text>

            <View style={styles.purityNote}>
              <Text style={styles.purityText}>
                Kaat: {formatKaat(result.kaatRatti)}   -₹ {result.deductionPerTola}/Tola
              </Text>
              <Text style={styles.purityText}>
                Eff. Rate: ₹ {result.effectiveRate} ({(result.purity*100).toFixed(1)}% pure)
              </Text>
            </View>

            <View style={styles.line}>
              <Text style={styles.lineLabel}>Gold Value</Text>
              <Text style={styles.lineValue}>₹ {result.goldValue}</Text>
            </View>
            {parseFloat(result.making) > 0 && (
              <View style={styles.line}>
                <Text style={styles.lineLabel}>Making</Text>
                <Text style={styles.lineValue}>₹ {result.making}</Text>
              </View>
            )}
            {parseFloat(result.wastage) > 0 && (
              <View style={styles.line}>
                <Text style={styles.lineLabel}>Wastage</Text>
                <Text style={styles.lineValue}>₹ {result.wastage}</Text>
              </View>
            )}
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>₹ {result.total}</Text>
            </View>

            <TouchableOpacity style={styles.clearBtn} onPress={clearResult}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Karat Selection Modal */}
      <Modal
        visible={showKaratModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKaratModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Karat</Text>
            <FlatList
              data={KARAT_LIST}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectKarat(item.value)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              style={{ maxHeight: 400 }}
            />
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowKaratModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 6,
    marginTop: 10,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4033',
  },
  rowGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  unitChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  unitChipActive: {
    backgroundColor: '#B8860B',
    borderColor: '#B8860B',
  },
  unitText: {
    fontSize: 13,
    color: '#5C4033',
    fontWeight: '500',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rupeeSign: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B8860B',
    marginRight: 6,
  },
  kaatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  kaatHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    paddingLeft: 2,
  },
  karatListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
    marginBottom: 4,
  },
  karatListBtnText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  expandText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 8,
  },
  chargesBox: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calcBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  calcBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  bigWeight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5C4033',
  },
  weightUnit: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  sep: {
    fontSize: 22,
    color: '#D4AF37',
    marginHorizontal: 6,
  },
  decimal: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 10,
  },
  purityNote: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  purityText: {
    fontSize: 13,
    color: '#333',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  lineLabel: {
    fontSize: 15,
    color: '#666',
  },
  lineValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D4AF37',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#5C4033',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B8860B',
  },
  clearBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  clearText: {
    color: '#B8860B',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5C4033',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 17,
    color: '#333',
    textAlign: 'center',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#EEDC82',
  },
  modalCloseBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#D4AF37',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});