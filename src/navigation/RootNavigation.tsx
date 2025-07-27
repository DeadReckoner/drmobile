import { AppToast } from '@/components/AppToast';
import { useSupabaseAutoRefresh } from '@/hooks/auth/useSupabaseAuthListener';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectAuth } from '@/store/slices/authSlice';
import { selectTheme } from '@/store/slices/settingsSlice';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

type StackProps = React.ComponentProps<typeof Stack>['screenOptions'];
const screenOptions: StackProps = {
  headerShown: false,
  animation: 'fade_from_bottom',
};

export const RootNavigator = () => {
  useSupabaseAutoRefresh();
  const { user } = useAppSelector(selectAuth);
  const theme = useAppSelector(selectTheme);

  return (
    <>
      <Stack screenOptions={screenOptions}>
        <Stack.Protected guard={!!user?.id}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>

        <Stack.Protected guard={!user?.id}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      <AppToast />
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        translucent
      />
    </>
  );
};
