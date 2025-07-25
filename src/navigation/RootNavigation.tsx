import { AppToast } from '@/components/AppToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { clearAuthAction, selectAuth } from '@/store/slices/authSlice';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

type StackProps = React.ComponentProps<typeof Stack>['screenOptions'];
const screenOptions: StackProps = {
  headerShown: false,
  animation: 'fade_from_bottom',
};

export const RootNavigator = () => {
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearAuthAction());
  }, [dispatch]);
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
    </>
  );
};
