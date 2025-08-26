import { useLocalization } from '@/hooks/useLocalization';
import { useCreateUserMutation } from '@/hooks/user';
import { useToast } from '@/hooks/useToast';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { clearAuthAction, setAuthUserAction } from '@/store/slices/authSlice';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

const AUTH_EVENTS: AuthChangeEvent[] = [
  'SIGNED_IN',
  'SIGNED_OUT',
  'TOKEN_REFRESHED',
];

export const useSupabaseAutoRefresh = () => {
  const dispatch = useAppDispatch();
  const [createUser] = useCreateUserMutation();
  const { showToast } = useToast();
  const { t } = useLocalization();

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      supabaseClient.auth.startAutoRefresh();
    } else {
      supabaseClient.auth.stopAutoRefresh();
    }
  };

  const handleUserCreation = useCallback(
    async (user: User, access_token: string) => {
      if (!user) return;

      const metadata = user.user_metadata || {};
      const email = user.email ?? '';

      let first_name = metadata.firstName || '';
      let last_name = metadata.lastName || '';

      if (!first_name && metadata.full_name) {
        const parts = String(metadata.full_name).trim().split(/\s+/);
        first_name = parts[0] ?? '';
        last_name = parts.slice(1).join(' ') || '';
      }

      const payload = { first_name, last_name, email };

      try {
        const user = await createUser(payload).unwrap();
        dispatch(
          setAuthUserAction({
            access_token: access_token || '',
            email: user?.email || '',
            id: user?.user_id || '',
            name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
            avatar: '',
          }),
        );
      } catch {
        showToast({
          type: 'failure',
          message: t('common.something_went_wrong'),
        });
        dispatch(clearAuthAction());
        await supabaseClient.auth.signOut();
      }
    },
    [createUser, dispatch, showToast, t],
  );

  const onAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      if (AUTH_EVENTS.includes(event)) {
        if (session?.user && session?.access_token) {
          if (event === 'SIGNED_IN') {
            await handleUserCreation(session.user, session.access_token);
          } else {
            dispatch(
              setAuthUserAction({
                access_token: session.access_token || '',
                email: session?.user?.email || '',
                id: session?.user?.id || '',
                name: session?.user?.user_metadata?.full_name || '',
                avatar: session?.user?.user_metadata?.avatar_url || '',
              }),
            );
          }
        } else {
          dispatch(clearAuthAction());
        }
      }
    },
    [dispatch, handleUserCreation],
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
