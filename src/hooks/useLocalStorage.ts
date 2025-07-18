import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = () => {
  const setValue = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  const getValue = async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch {
      return null;
    }
  };

  const removeValue = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch {
      return false;
    }
  };

  return {
    setValue,
    getValue,
    removeValue,
    clearStorage,
  };
};
