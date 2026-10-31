import * as Sentry from '@sentry/react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { AppState, Platform } from 'react-native';
import { Settings } from 'react-native-fbsdk-next';

let hasInitialized = false;

// iOS silently skips the ATT prompt (and reports "denied") when it is
// requested while the app is not in the foreground, so wait for 'active'.
const waitForActiveAppState = (): Promise<void> =>
  new Promise((resolve) => {
    if (AppState.currentState === 'active') {
      resolve();
      return;
    }
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        subscription.remove();
        resolve();
      }
    });
  });

/**
 * Ask for App Tracking Transparency permission (iOS), then start the Meta SDK.
 * Auto-init is disabled in app.json so the SDK never starts before the user
 * has answered the ATT prompt. Automatic app-event logging (installs, app
 * opens) is left on and begins once the SDK is initialized.
 */
export const initializeMetaSdk = async (): Promise<void> => {
  if (hasInitialized) return;
  hasInitialized = true;

  try {
    if (Platform.OS === 'ios') {
      await waitForActiveAppState();
      const { status } = await requestTrackingPermissionsAsync();
      await Settings.setAdvertiserTrackingEnabled(status === 'granted');
    }
    Settings.initializeSDK();
  } catch (error) {
    // Attribution loss is not user-facing, but it silently breaks ad
    // measurement, so make sure it reaches us.
    Sentry.captureException(error, {
      tags: { area: 'meta-sdk', phase: 'initialize' },
      extra: { platform: Platform.OS },
    });
  }
};
