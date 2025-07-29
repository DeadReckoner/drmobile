import { Loader } from '@/components/Loader';
import { RootNavigator } from '@/components/RootNavigation';
import { SplashScreenController } from '@/components/SplashScreenController';
import { Env } from '@/constants/Env';
import { persistedStore, store } from '@/store/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SplashScreen from 'expo-splash-screen';
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
  webClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CIENT_ID,
  iosClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID,
});

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistedStore}>
        <KeyboardProvider>
          <SplashScreenController>
            <RootNavigator />
          </SplashScreenController>
        </KeyboardProvider>
      </PersistGate>
    </Provider>
  );
}
