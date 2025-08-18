import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { clearAuthAction, setAuthUserAction } from '@/store/slices/authSlice';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

const AUTH_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'SIGNED_OUT',
  'TOKEN_REFRESHED',
];

export const useSupabaseAutoRefresh = () => {
  const dispatch = useAppDispatch();

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      supabaseClient.auth.startAutoRefresh();
    } else {
      supabaseClient.auth.stopAutoRefresh();
    }
  };

  const onAuthStateChange = useCallback(
    (event: AuthChangeEvent, session: Session | null) => {
      if (AUTH_EVENTS.includes(event)) {
        if (session?.user && session?.access_token) {
          dispatch(
            setAuthUserAction({
              access_token: session.access_token || '',
              email: session?.user?.email || '',
              id: session?.user?.id || '',
              name: session?.user?.user_metadata?.full_name || '',
              avatar: session?.user?.user_metadata?.avatar_url || '',
            }),
          );
        } else {
          dispatch(clearAuthAction());
        }
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const appStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    if (AppState.currentState === 'active') {
      supabaseClient.auth.startAutoRefresh();
    }

    const authChangeSubscription =
      supabaseClient.auth.onAuthStateChange(onAuthStateChange);

    return () => {
      appStateChangeSubscription.remove();
      authChangeSubscription.data.subscription.unsubscribe();
    };
  }, [dispatch, onAuthStateChange]);
};
