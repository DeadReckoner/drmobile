import { TLocalStorageKeys } from '@/constants/types/localStorage.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = () => {
  const setValue = async (key: TLocalStorageKeys, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  };

  const getValue = async (key: TLocalStorageKeys): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch {
      return null;
    }
  };

  const removeValue = async (key: TLocalStorageKeys) => {
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
