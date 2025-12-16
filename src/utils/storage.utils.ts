import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  APPLE_USER_NAME: '@apple_user_name',
  EXPO_PUSH_TOKEN: '@expo_push_token',
  TOKEN_SUBMITTED: '@token_submitted',
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

/**
 * Save Expo push token to local storage
 */
export const saveExpoPushToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPO_PUSH_TOKEN, token);
  } catch {}
};

/**
 * Get saved Expo push token from local storage
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.EXPO_PUSH_TOKEN);
  } catch {
    return null;
  }
};

/**
 * Mark that token has been submitted to backend
 */
export const markTokenAsSubmitted = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_SUBMITTED, token);
  } catch {}
};

/**
 * Check if token has been submitted to backend
 */
export const isTokenSubmitted = async (token: string): Promise<boolean> => {
  try {
    const submittedToken = await AsyncStorage.getItem(
      STORAGE_KEYS.TOKEN_SUBMITTED,
    );
    return submittedToken === token;
  } catch {
    return false;
  }
};

/**
 * Clear notification token data (on logout)
 */
export const clearNotificationTokenData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.EXPO_PUSH_TOKEN,
      STORAGE_KEYS.TOKEN_SUBMITTED,
    ]);
  } catch {}
};
