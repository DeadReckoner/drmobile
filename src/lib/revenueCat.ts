import {
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
} from '@/constants/iap';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

/**
 * Initialize the RevenueCat SDK.
 * Call once at app startup before any purchase or entitlement checks.
 */
export const initializeRevenueCat = (): void => {
  const apiKey =
    Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
  }

  Purchases.configure({ apiKey });
};

/**
 * Associate the authenticated user's ID with RevenueCat.
 * Must be called after a successful sign-in so that purchases are linked
 * to the correct account and can be restored across devices.
 */
export const loginRevenueCat = async (userId: string): Promise<void> => {
  try {
    if (!userId) return;
    await Purchases.logIn(userId);
  } catch {}
};

export const syncRevenueCatAttributes = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<void> => {
  try {
    const attributes: { $displayName: string; $email: string } = {
      $displayName: name,
      $email: email,
    };
    const removeEmptyAttributes = Object.fromEntries(
      Object.entries(attributes).filter(([_, value]) => value !== ''),
    );
    await Purchases.setAttributes(removeEmptyAttributes);
  } catch {}
};

/**
 * Unlink the current user from RevenueCat and switch to an anonymous identity.
 * Call on sign-out to prevent purchases from leaking between accounts.
 */
export const logoutRevenueCat = async (): Promise<void> => {
  try {
    await Purchases.invalidateCustomerInfoCache();
    await Purchases.logOut();
  } catch {
    // Non-fatal — logged-out users already have limited purchase access
  }
};
