import i18nConfig from '@/lib/localization/i18nConfig';
import { api } from '@/store/apis/api';
import { ApiError } from '@/store/apis/types/api.types';
import { clearAuthAction } from '@/store/slices/authSlice';
import { AppDispatchType, RootStateType } from '@/store/types/store.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Action, ThunkDispatch } from '@reduxjs/toolkit';
import { Persistor } from 'redux-persist';

export const handleSignout = async (
  dispatch: ThunkDispatch<RootStateType, AppDispatchType, Action>,
  persistedStore: Persistor,
) => {
  try {
    dispatch(clearAuthAction());
    await persistedStore.purge();

    const appleUserName = await AsyncStorage.getItem('@apple_user_name');
    await AsyncStorage.clear();
    if (appleUserName) {
      await AsyncStorage.setItem('@apple_user_name', appleUserName);
    }
    api.util.resetApiState();
  } catch {}
};

export const getApiErrorMessage = (error: unknown) => {
  return (
    (error as ApiError)?.message ||
    (error as ApiError)?.data?.error ||
    i18nConfig.t('common.something_went_wrong')
  );
};
