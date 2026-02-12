import { useCreateUserMutation } from '@/hooks/user';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setAuthUserAction } from '@/store/slices/authSlice';
import { persistedStore } from '@/store/store';
import { handleSignout } from '@/utils/apiErrors.utils';
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
  const [createUser] = useCreateUserMutation();

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      supabaseClient.auth.startAutoRefresh();
    } else {
      supabaseClient.auth.stopAutoRefresh();
    }
  };

  const handleUserCreation = useCallback(
    async (sessionUser: User, access_token: string) => {
      if (!sessionUser) return;

      const metadata = sessionUser.user_metadata || {};
      const email = sessionUser.email ?? '';

      let first_name = metadata.firstName || '';
      let last_name = metadata.lastName || '';

      if (!first_name && metadata.full_name) {
        const parts = String(metadata.full_name).trim().split(/\s+/);
        first_name = parts[0] ?? '';
        last_name = parts.slice(1).join(' ') || '';
      }

      const payload = {
        first_name,
        last_name,
        email,
      };
      try {
        const createdUser = await createUser(payload).unwrap();
        dispatch(
          setAuthUserAction({
            access_token: access_token,
            email: createdUser.email,
            id: createdUser.user_id,
            name:
              `${createdUser.first_name || ''} ${createdUser.last_name || ''}`.trim() ||
              `${first_name || ''} ${last_name || ''}`,
            avatar: '',
          }),
        );
      } catch {}
    },
    [createUser, dispatch],
  );

  const getUserName = useCallback((session: Session | null) => {
    if (!session) return 'N/A';
    const userMetadata = session.user.user_metadata;
    return (
      userMetadata?.name ||
      userMetadata?.full_name ||
      `${userMetadata.firstName || ''} ${userMetadata.lastName || ''}`.trim()
    );
  }, []);

  const onAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (AUTH_EVENTS.includes(event)) {
        if (event === 'SIGNED_OUT') {
          await handleSignout(dispatch, persistedStore);
          return;
        }
        if (session?.user && session?.access_token) {
          if (event === 'SIGNED_IN') {
            await handleUserCreation(session.user, session.access_token);
          } else {
            dispatch(
              setAuthUserAction({
                access_token: session.access_token,
                email: session.user.email || '',
                id: session.user.id,
                name: getUserName(session),
                avatar: session.user.user_metadata?.avatar_url || '',
              }),
            );
          }
        }
      }
    },
    [dispatch, getUserName, handleUserCreation],
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
