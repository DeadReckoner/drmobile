import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader } from '@/components/Loader';
import { RootNavigator } from '@/components/RootNavigation';
import { SplashScreenController } from '@/components/SplashScreenController';
import { Env } from '@/constants/Env';
import { useBillingPaywall } from '@/hooks/useBillingPaywall';
import { useBillingStatusSync } from '@/hooks/useBillingStatusSync';
import { useEntitlementCheck } from '@/hooks/useEntitlementCheck';
import { initializeRevenueCat } from '@/lib/revenueCat';
import { persistedStore, store } from '@/store/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 300,
});

GoogleSignin.configure({
  webClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID,
  iosClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID,
});

initializeRevenueCat();

function AppWithEntitlementCheck() {
  const { checkEntitlementStatus } = useEntitlementCheck();
  // Keep the backend's authoritative plan state in sync (mount + foreground)
  // and open the paywall when a 402 sets the trigger.
  useBillingStatusSync({ register: true });
  useBillingPaywall();

  useEffect(() => {
    checkEntitlementStatus();
  }, [checkEntitlementStatus]);

  // Re-check entitlement whenever the app comes back to the foreground.
  // Registered here (once) instead of inside useEntitlementCheck to avoid
  // duplicate listeners when the hook is composed into multiple sub-hooks.
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        checkEntitlementStatus();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [checkEntitlementStatus]);

  return (
    <KeyboardProvider>
      <SplashScreenController>
        <RootNavigator />
      </SplashScreenController>
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <PersistGate loading={<Loader />} persistor={persistedStore}>
          <AppWithEntitlementCheck />
        </PersistGate>
      </ErrorBoundary>
    </Provider>
  );
}
