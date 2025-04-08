import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores a value in AsyncStorage
 * @param {string} key - The storage key
 * @param {any} value - The value to store
 * @returns {Promise<void>}
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
};

/**
 * Retrieves a value from AsyncStorage
 * @param {string} key - The storage key
 * @returns {Promise<any>} - The retrieved value
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

/**
 * Removes a value from AsyncStorage
 * @param {string} key - The storage key
 * @returns {Promise<void>}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw error;
  }
};

/**
 * Clears all values from AsyncStorage
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};