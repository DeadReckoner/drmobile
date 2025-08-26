import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { api } from '@/store/apis/api';
import { clearAuthAction } from '@/store/slices/authSlice';
import { showToastAction } from '@/store/slices/settingsSlice';
import { Store } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

export const handleAuthError = async (
  store: Store,
  persistor: ReturnType<typeof persistStore>,
) => {
  try {
    await persistor.purge();
    store.dispatch(clearAuthAction());
    store.dispatch(
      showToastAction({
        toastProps: {
          type: 'failure',
          message: 'Session expired. Please log in again.',
        },
      }),
    );
    await supabaseClient.auth.signOut();
    store.dispatch(api.util.resetApiState());
  } catch {}
};
