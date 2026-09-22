import {
  REVENUECAT_API_KEY_ANDROID,
  REVENUECAT_API_KEY_IOS,
} from '@/constants/iap';
import * as Sentry from '@sentry/react-native';
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

  // Purchases.configure throws synchronously on a missing or malformed key,
  // and this function is called at module scope in app/_layout.tsx — above any
  // error boundary. An uncaught throw there doesn't disable purchases, it stops
  // the app mounting at all, with an undismissable red screen. Degraded
  // purchases are bad; an app that won't start is worse.
  try {
    Purchases.configure({ apiKey });
  } catch (error) {
    // Deliberately NOT silent, unlike the other helpers in this file. They
    // swallow because a single failed call is recoverable; this one failing
    // means every purchase, entitlement and restore call is dead for the whole
    // session, and the user sees no error — they just can't buy anything.
    // That's revenue-affecting and needs to reach us.
    Sentry.captureException(error, {
      tags: { area: 'revenuecat', phase: 'configure' },
      extra: {
        platform: Platform.OS,
        // Never log the key itself. Presence alone separates "misconfigured
        // environment" from "key rejected by RevenueCat", which are different
        // problems with different fixes.
        hasApiKey: Boolean(apiKey),
      },
    });

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        '[revenueCat] configure() failed — purchases are disabled for this session. ' +
          (apiKey
            ? 'The key was rejected; check it matches the platform (iOS keys start with "appl_").'
            : 'No API key found. Set EXPO_PUBLIC_REVENUECAT_API_KEY_IOS / _ANDROID in .env — ' +
              'note the EXPO_PUBLIC_ prefix, without it Expo will not expose the value to the app.'),
      );
    }
  }
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
