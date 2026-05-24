import AsyncStorage from '@react-native-async-storage/async-storage';

const RATE_KEY = 'goldRate';

// Save rate locally (no internet required)
export async function saveRate(ratePerTola) {
  const data = {
    ratePerTola,
    date: new Date().toISOString(),
  };
  await AsyncStorage.setItem(RATE_KEY, JSON.stringify(data));
  return data;
}

// Retrieve the last saved rate
export async function getSavedRate() {
  const stored = await AsyncStorage.getItem(RATE_KEY);
  return stored ? JSON.parse(stored) : null;
}