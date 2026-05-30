import { useUpdateUserMutation } from '@/hooks/user';
import { useToast } from '@/hooks/useToast';
import { loginRevenueCat } from '@/lib/revenueCat';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { userApi } from '@/store/apis/userApi';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setAuthUserAction } from '@/store/slices/authSlice';
import { persistedStore } from '@/store/store';
import { getApiErrorMessage, handleSignout } from '@/utils/apiErrors.utils';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

const AUTH_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'SIGNED_OUT',
  'TOKEN_REFRESHED',
  'INITIAL_SESSION',
  'USER_UPDATED',
];

export const useSupabaseAutoRefresh = () => {
  const dispatch = useAppDispatch();
  const [updateUser] = useUpdateUserMutation();
  const { showToast } = useToast();

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      supabaseClient.auth.startAutoRefresh();
    } else {
      supabaseClient.auth.stopAutoRefresh();
    }
  };

  const getFirstAndLastName = (sessionUser: User) => {
    const metadata = sessionUser.user_metadata || {};

    let first_name = metadata.first_name || '';
    let last_name = metadata.last_name || '';

    if (!first_name) {
      const fullName = metadata.full_name || metadata.name || '';
      if (fullName) {
        const parts = String(fullName).trim().split(/\s+/);
        first_name = parts[0] ?? '';
        last_name = parts.slice(1).join(' ') || '';
      }
    }
    return { first_name, last_name };
  };

  const handleUserInformation = useCallback(
    (sessionUser: User, access_token: string) => {
      if (!sessionUser) return;
      dispatch(
        setAuthUserAction({
          access_token: access_token,
          email: sessionUser.user_metadata?.email || sessionUser.email || '',
          id: sessionUser.id,
          name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.user_metadata?.name ||
            '',
          avatar: sessionUser.user_metadata?.avatar_url || '',
        }),
      );
    },
    [dispatch],
  );

  const onAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (AUTH_EVENTS.includes(event)) {
        if (event === 'SIGNED_OUT') {
          await handleSignout(dispatch, persistedStore);
          return;
        }
        if (session?.user && session?.access_token) {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            await loginRevenueCat(session.user.id);
            dispatch(
              userApi.endpoints.getMyProfile.initiate(undefined, {
                forceRefetch: true,
              }),
            );
          }
          if (event === 'USER_UPDATED') {
            const { first_name, last_name } = getFirstAndLastName(session.user);
            try {
              const payload: {
                first_name: string;
                last_name: string;
                email?: string;
              } = {
                first_name,
                last_name,
              };
              if (session.user.user_metadata?.email) {
                payload['email'] =
                  session.user.user_metadata?.email || session.user.email || '';
              }
              await updateUser(payload).unwrap();
            } catch (error) {
              showToast({
                type: 'failure',
                message: getApiErrorMessage(error),
              });
            }
          }
          handleUserInformation(session.user, session.access_token);
        }
      }
    },
    [dispatch, handleUserInformation, updateUser, showToast],
  );

  useEffect(() => {
    const appStateChangeSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    if (AppState.currentState === 'active') {
      supabaseClient.auth.startAutoRefresh();
    }

    const restoreSession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
          await onAuthStateChange('INITIAL_SESSION', data.session);
        }
      } catch {}
    };

    restoreSession();

    const authChangeSubscription =
      supabaseClient.auth.onAuthStateChange(onAuthStateChange);

    return () => {
      appStateChangeSubscription.remove();
      authChangeSubscription.data.subscription.unsubscribe();
    };
  }, [dispatch, onAuthStateChange]);
};
