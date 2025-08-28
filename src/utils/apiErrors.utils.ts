import i18nConfig from '@/lib/localization/i18nConfig';
import { api } from '@/store/apis/api';
import { ApiError } from '@/store/apis/types/api.types';
import { clearAuthAction } from '@/store/slices/authSlice';
import { showToastAction } from '@/store/slices/settingsSlice';
import { persistedStore, store } from '@/store/store';

export const handleSignoutOnAuthError = async () => {
  try {
    store.dispatch(clearAuthAction());
    store.dispatch(
      showToastAction({
        toastProps: {
          type: 'failure',
          message: i18nConfig.t('authentication.errors.session_expired'),
        },
      }),
    );
    store.dispatch(api.util.resetApiState());
    await persistedStore.purge();
  } catch {}
};

export const getApiErrorMessage = (error: unknown) => {
  return (
    (error as ApiError)?.message || i18nConfig.t('common.something_went_wrong')
  );
};
