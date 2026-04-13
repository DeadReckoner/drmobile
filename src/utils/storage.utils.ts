import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  APPLE_USER_NAME: '@apple_user_name',
  EXPO_PUSH_TOKEN: '@expo_push_token',
} as const;

/**
 * Save Apple user's full name to local storage
 * Apple only provides the name on first login
 */
export const saveAppleUserName = async (
  firstName?: string | null,
  lastName?: string | null,
): Promise<void> => {
  try {
    if (firstName || lastName) {
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
      if (fullName) {
        await AsyncStorage.setItem(STORAGE_KEYS.APPLE_USER_NAME, fullName);
      }
    }
  } catch {}
};

/**
 * Retrieve Apple user's full name from local storage
 * Returns the stored name or null if not found
 */
export const getAppleUserName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.APPLE_USER_NAME);
  } catch {
    return null;
  }
};

/**
 * Clear Apple user's name from local storage
 * Useful when user logs out or wants to reset
 */
export const clearAppleUserName = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.APPLE_USER_NAME);
  } catch {
    // Silently fail - storage errors shouldn't block operations
  }
};

export const saveExpoPushTokenStorage = async (
  token: string,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPO_PUSH_TOKEN, token);
  } catch {}
};

export const getExpoPushTokenStorage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
  } catch {
    return null;
  }
};

export const clearExpoPushTokenStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
  } catch {}
};
