import { ErrorFallback } from '@/components/ErrorBoundary';
import { Loader } from '@/components/Loader';
import { RootNavigator } from '@/components/RootNavigation';
import { SplashScreenController } from '@/components/SplashScreenController';
import { Env } from '@/constants/Env';
import { useBillingPaywall } from '@/hooks/useBillingPaywall';
import { useBillingStatusSync } from '@/hooks/useBillingStatusSync';
import { useEntitlementCheck } from '@/hooks/useEntitlementCheck';
import { initializeMetaSdk } from '@/lib/metaSdk';
import { initializeRevenueCat } from '@/lib/revenueCat';
import { persistedStore, store } from '@/store/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

if (Env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: Env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    enableLogs: true,
    integrations: [Sentry.mobileReplayIntegration()],
    environment: __DEV__ ? 'development' : 'production',
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    spotlight: __DEV__,
  });
}

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

  // Shows the ATT prompt on iOS, then starts the Meta SDK for ad attribution.
  useEffect(() => {
    initializeMetaSdk();
  }, []);

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
    <Sentry.GlobalErrorBoundary
      fallback={({ resetError, eventId }) => (
        <ErrorFallback onReset={resetError} eventId={eventId} />
      )}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={<Loader />} persistor={persistedStore}>
            <AppWithEntitlementCheck />
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </Sentry.GlobalErrorBoundary>
  );
}
