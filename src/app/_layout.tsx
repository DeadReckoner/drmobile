import { SplashScreenController } from '@/components/SplashScreenController';
import { RootNavigator } from '@/navigation/RootNavigation';
import { persistedStore, store } from '@/store/store';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
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
