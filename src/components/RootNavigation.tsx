import { AppToast } from '@/components/AppToast';
import { useSupabaseAutoRefresh } from '@/hooks/auth/useSupabaseAuthListener';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useNotificationListener } from '@/hooks/useNotificationListener';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { resetStackScreenOptions } from '@/utils/navigation.utils';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export const RootNavigator = () => {
  useNotificationListener();
  useSupabaseAutoRefresh();
  const user = useAppSelector(selectUser);
  const { theme } = useAppTheme();

  return (
    <>
      <Stack screenOptions={resetStackScreenOptions}>
        {/* `/` is served by (protected)/(tabs)/index, so a signed-out launch
            needs an explicit destination: expo-router 58 no longer falls
            back to the (auth) stack's initial route on its own. */}
        <Stack.Protected guard={!!user?.id} redirectTo="/login">
          <Stack.Screen name="(protected)" />
        </Stack.Protected>

        <Stack.Protected guard={!user?.id}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>

      <AppToast />
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
    </>
  );
};
