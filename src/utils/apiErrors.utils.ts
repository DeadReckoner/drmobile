import i18nConfig from '@/lib/localization/i18nConfig';
import { api } from '@/store/apis/api';
import { ApiError } from '@/store/apis/types/api.types';
import { resetCreationStateAction } from '@/store/slices/aiRoadmapCreationSlice';
import { clearAuthAction } from '@/store/slices/authSlice';
import { resetGoalDiscoveryAction } from '@/store/slices/goalDiscoverySlice';
import { resetOnboardingAction } from '@/store/slices/onboardingSlice';
import { resetDraftAction } from '@/store/slices/roadmapDraftSlice';
import { resetSettingsSlice } from '@/store/slices/settingsSlice';
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
    dispatch(resetCreationStateAction());
    // The goal discovery draft holds the user's own written answers, so it must
    // be cleared on sign-out and never resurface for the next account.
    dispatch(resetGoalDiscoveryAction());
    dispatch(resetDraftAction());
    dispatch(resetSettingsSlice());
    dispatch(resetOnboardingAction());
    dispatch(api.util.resetApiState());

    const appleUserName = await AsyncStorage.getItem('@apple_user_name');
    await AsyncStorage.clear();
    if (appleUserName) {
      await AsyncStorage.setItem('@apple_user_name', appleUserName);
    }
    await persistedStore.purge();
  } catch {}
};

export const getApiErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  return (
    apiError?.message ||
    apiError?.data?.message ||
    apiError?.data?.error ||
    i18nConfig.t('common.something_went_wrong') ||
    'Something went wrong.'
  );
};
