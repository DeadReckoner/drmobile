import { SplashScreenController } from '@/components/SplashScreenController';
import { Env } from '@/constants/Env';
import { RootNavigator } from '@/navigation/RootNavigation';
import { persistedStore, store } from '@/store/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
});

GoogleSignin.configure({
  webClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CIENT_ID,
  iosClientId: Env.EXPO_PUBLIC_GOOGLE_AUTH_IOS_CLIENT_ID,
});

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistedStore}>
        <SplashScreenController>
          <RootNavigator />
        </SplashScreenController>
      </PersistGate>
    </Provider>
  );
}
