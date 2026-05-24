import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView, Modal,
  Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { getSavedRate } from '../../utils/api';

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

const PURITY_PRESETS = [
  { label: '24K', multiplier: '0' },
  { label: '22K', multiplier: '0.66' },
  { label: '21K', multiplier: '1' },
  { label: '20K', multiplier: '1.33' },
  { label: '18K', multiplier: '2' },
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

function multiplierToKarat(multiplier) {
  const m = parseFloat(multiplier);
  if (isNaN(m)) return '';
  const karat = 24 - 3 * m;
  if (karat < 0) return '< 0K';
  return karat.toFixed(1) + 'K';
}

export default function CalculatorScreen() {
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [kaatMultiplier, setKaatMultiplier] = useState('1');
  const [makingCharge, setMakingCharge] = useState('');
  const [wastage, setWastage] = useState('');
  const [showCharges, setShowCharges] = useState(false);
  const [result, setResult] = useState(null);
  const [showKaratModal, setShowKaratModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const resultAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const chargesHeight = useRef(new Animated.Value(0)).current;

  const kaatKaratLabel = useMemo(() => multiplierToKarat(kaatMultiplier), [kaatMultiplier]);

  useEffect(() => {
    loadSavedRate();
  }, []);

  const loadSavedRate = async () => {
    const data = await getSavedRate();
    if (data && data.ratePerTola) {
      setRate(String(data.ratePerTola));
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const animateCharges = (expand) => {
    Animated.timing(chargesHeight, {
      toValue: expand ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleCharges = () => {
    setShowCharges(!showCharges);
    animateCharges(!showCharges);
  };

  const calculateLocally = () => {
    const w = parseFloat(weight);
    const r = parseFloat(rate);
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      Alert.alert('Required', 'Please enter valid weight (grams) and 24K rate.');
      return;
    }
    const m = parseFloat(kaatMultiplier);
    if (isNaN(m) || m < 0) {
      Alert.alert('Invalid', 'Please enter a valid kaat multiplier.');
      return;
    }

    animateButton();
    setCalculating(true);

    setTimeout(() => {
      const kaatRatti = m * 12;
      const purity = (96 - kaatRatti) / 96;
      const effectiveRate = r * purity;
      const deductionPerTola = r - effectiveRate;
      const weightInTola = w / 11.664;
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
        purity,
        kaatRatti,
        deductionPerTola: deductionPerTola.toFixed(2),
        effectiveRate: effectiveRate.toFixed(2),
        goldValue: goldValue.toFixed(2),
        making: making.toFixed(2),
        wastage: wastageAmount.toFixed(2),
        total: total.toFixed(2),
      });
      setCalculating(false);
      setShowResultModal(true);
      animateResultIn();
    }, 300);
  };

  const animateResultIn = () => {
    resultAnim.setValue(0);
    Animated.spring(resultAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const closeResult = () => {
    Animated.timing(resultAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowResultModal(false);
      setResult(null);
    });
  };

  const selectKarat = (karatValue) => {
    const multiplier = ((24 - karatValue) / 3).toFixed(1);
    setKaatMultiplier(multiplier);
    setShowKaratModal(false);
  };

  const chargesMaxHeight = chargesHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 90],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="diamond" size={26} color="#B8860B" />
          <Text style={styles.headerText}>Gold Calculator</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Weight (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              placeholder="10.5"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Rate/Tola (Rs)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={rate}
              onChangeText={setRate}
              placeholder="500000"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <Text style={styles.label}>Purity (Kaat)</Text>
        <View style={styles.purityRow}>
          {PURITY_PRESETS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.purityBtn,
                kaatMultiplier === item.multiplier && styles.purityBtnActive,
              ]}
              onPress={() => setKaatMultiplier(item.multiplier)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.purityBtnText,
                  kaatMultiplier === item.multiplier && styles.purityBtnTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.kaatInputRow}>
          <TextInput
            style={[styles.input, styles.kaatInput]}
            keyboardType="decimal-pad"
            value={kaatMultiplier}
            onChangeText={setKaatMultiplier}
            placeholder="1.0"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.karatListBtn}
            onPress={() => setShowKaratModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={16} color="#fff" />
            <Text style={styles.karatListBtnText}>More</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.kaatHint}>
          Kaat ×12 | ≈ {kaatKaratLabel || '?'}
        </Text>

        <TouchableOpacity style={styles.chargesToggle} onPress={toggleCharges} activeOpacity={0.7}>
          <Ionicons name="construct-outline" size={16} color="#B8860B" />
          <Text style={styles.chargesToggleText}>
            Making & Wastage {showCharges ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        <Animated.View style={[styles.chargesWrapper, { maxHeight: chargesMaxHeight, opacity: chargesHeight }]}>
          <View style={styles.chargesContainer}>
            <View style={styles.chargeItem}>
              <Text style={styles.chargeLabel}>Making/Tola (Rs)</Text>
              <TextInput
                style={styles.chargeInput}
                keyboardType="decimal-pad"
                value={makingCharge}
                onChangeText={setMakingCharge}
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.chargeItem}>
              <Text style={styles.chargeLabel}>Wastage (%)</Text>
              <TextInput
                style={styles.chargeInput}
                keyboardType="decimal-pad"
                value={wastage}
                onChangeText={setWastage}
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.calcBtn}
            onPress={calculateLocally}
            activeOpacity={0.8}
            disabled={calculating}
          >
            {calculating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="calculator" size={22} color="#fff" />
                <Text style={styles.calcBtnText}>CALCULATE</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Modal visible={showResultModal} transparent animationType="none" onRequestClose={closeResult}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.resultPopup,
              {
                transform: [
                  { scale: resultAnim },
                  { translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                ],
                opacity: resultAnim,
              },
            ]}
          >
            {result && (
              <>
                <Ionicons name="checkmark-circle" size={48} color="#B8860B" style={styles.resultIcon} />
                <View style={styles.resultWeightRow}>
                  <View style={styles.weightBox}>
                    <Text style={styles.weightNumber}>{result.tola}</Text>
                    <Text style={styles.weightUnit}>Tola</Text>
                  </View>
                  <Text style={styles.weightSeparator}>:</Text>
                  <View style={styles.weightBox}>
                    <Text style={styles.weightNumber}>{result.masha}</Text>
                    <Text style={styles.weightUnit}>Masha</Text>
                  </View>
                  <Text style={styles.weightSeparator}>:</Text>
                  <View style={styles.weightBox}>
                    <Text style={styles.weightNumber}>{result.ratti}</Text>
                    <Text style={styles.weightUnit}>Ratti</Text>
                  </View>
                </View>
                <Text style={styles.decimalTola}>({result.weightInTola} Tola)</Text>
                <View style={styles.purityTag}>
                  <Text style={styles.purityTagText}>
                    {formatKaat(result.kaatRatti)} · Eff. Rate Rs {result.effectiveRate}
                  </Text>
                </View>
                <View style={styles.financeLine}>
                  <Text style={styles.financeLabel}>Gold Value</Text>
                  <Text style={styles.financeValue}>Rs {result.goldValue}</Text>
                </View>
                {parseFloat(result.making) > 0 && (
                  <View style={styles.financeLine}>
                    <Text style={styles.financeLabel}>Making</Text>
                    <Text style={styles.financeValue}>Rs {result.making}</Text>
                  </View>
                )}
                {parseFloat(result.wastage) > 0 && (
                  <View style={styles.financeLine}>
                    <Text style={styles.financeLabel}>Wastage</Text>
                    <Text style={styles.financeValue}>Rs {result.wastage}</Text>
                  </View>
                )}
                <View style={styles.totalSeparator} />
                <View style={styles.financeLine}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalAmount}>Rs {result.total}</Text>
                </View>
                <TouchableOpacity style={styles.closePopupBtn} onPress={closeResult} activeOpacity={0.7}>
                  <Text style={styles.closePopupText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showKaratModal} transparent animationType="fade" onRequestClose={() => setShowKaratModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.karatModalContainer}>
            <Text style={styles.karatModalTitle}>Select Karat</Text>
            <FlatList
              data={KARAT_LIST}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.karatModalItem}
                  onPress={() => selectKarat(item.value)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.karatModalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.karatModalSeparator} />}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity
              style={styles.karatModalCloseBtn}
              onPress={() => setShowKaratModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.karatModalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'space-evenly',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5C4033',
    marginLeft: 10,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldHalf: {
    width: '48%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4033',
    marginBottom: 4,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 10,
    fontSize: 15,
    color: '#333',
  },
  purityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 2,
  },
  purityBtn: {
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  purityBtnActive: {
    backgroundColor: '#B8860B',
    borderColor: '#B8860B',
  },
  purityBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8860B',
  },
  purityBtnTextActive: {
    color: '#FFFFFF',
  },
  kaatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  kaatInput: {
    flex: 1,
    marginRight: 10,
  },
  kaatHint: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  karatListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C4033',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  karatListBtnText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  chargesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignSelf: 'flex-start',
  },
  chargesToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C4033',
    marginLeft: 6,
  },
  chargesWrapper: {
    overflow: 'hidden',
  },
  chargesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  chargeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chargeLabel: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  chargeInput: {
    backgroundColor: '#FDF8E7',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
    padding: 6,
    width: 110,
    textAlign: 'right',
    fontSize: 13,
    color: '#000',
  },
  calcBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#B8860B',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  calcBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  // Result Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultPopup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '92%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  resultIcon: { marginBottom: 8 },
  resultWeightRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  weightBox: { alignItems: 'center', marginHorizontal: 4 },
  weightNumber: { fontSize: 24, fontWeight: '800', color: '#5C4033' },
  weightUnit: { fontSize: 12, color: '#888' },
  weightSeparator: { fontSize: 22, color: '#D4AF37', marginHorizontal: 4 },
  decimalTola: { fontSize: 11, color: '#999', marginBottom: 10 },
  purityTag: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  purityTagText: { fontSize: 13, color: '#5C4033', fontWeight: '500' },
  financeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  financeLabel: { fontSize: 14, color: '#666' },
  financeValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalSeparator: { height: 1, backgroundColor: '#D4AF37', width: '100%', marginVertical: 8 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#5C4033' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#B8860B' },
  closePopupBtn: {
    marginTop: 20,
    backgroundColor: '#B8860B',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  closePopupText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  // Karat Modal
  karatModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  karatModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5C4033',
    marginBottom: 15,
    textAlign: 'center',
  },
  karatModalItem: { paddingVertical: 14, paddingHorizontal: 10 },
  karatModalItemText: { fontSize: 17, color: '#333', textAlign: 'center' },
  karatModalSeparator: { height: 1, backgroundColor: '#D4AF37', opacity: 0.4 },
  karatModalCloseBtn: {
    marginTop: 15,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#B8860B',
  },
  karatModalCloseText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});