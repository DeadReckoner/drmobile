import { notificationApi } from '@/store/apis/notificationsApi';
import type {
  FriendsAndAccountabilityPrefsType,
  MyGoalsPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectNotificationSettings,
  showToastAction,
  syncNotificationSettingsFromApi,
} from '@/store/slices/settingsSlice';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import {
  apiResponseToLocalSettings,
  buildMuteUntil,
  localSettingsToApiPayload,
} from '@/utils/notificationSettings.utils';
import { useEffect } from 'react';

export const useNotificationSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectNotificationSettings);

  const { data: apiData, isLoading } =
    notificationApi.useGetNotificationSettingsQuery();

  const [updateNotificationSettings, { isLoading: isUpdating }] =
    notificationApi.useUpdateNotificationSettingsMutation();

  useEffect(() => {
    if (apiData) {
      dispatch(
        syncNotificationSettingsFromApi(apiResponseToLocalSettings(apiData)),
      );
    }
  }, [apiData, dispatch]);

  const updateSetting = async (partial: Partial<NotificationSettingsType>) => {
    dispatch(syncNotificationSettingsFromApi({ ...settings, ...partial }));
    try {
      await updateNotificationSettings(
        localSettingsToApiPayload(partial),
      ).unwrap();
    } catch {
      if (apiData) {
        dispatch(
          syncNotificationSettingsFromApi(apiResponseToLocalSettings(apiData)),
        );
      }
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    }
  };

  const updateMyGoalPref = async (
    key: keyof MyGoalsPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    if (!apiData) return;
    const updatedPrefs: MyGoalsPrefsType = {
      ...apiData.my_goals_prefs,
      [key]: pref,
    };
    try {
      await updateNotificationSettings({
        my_goals_prefs: updatedPrefs,
      }).unwrap();
    } catch {
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    }
  };

  const updateFAndAPref = async (
    key: keyof FriendsAndAccountabilityPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    if (!apiData) return;
    const updatedPrefs: FriendsAndAccountabilityPrefsType = {
      ...apiData.f_and_a_prefs,
      [key]: pref,
    };
    try {
      await updateNotificationSettings({
        f_and_a_prefs: updatedPrefs,
      }).unwrap();
    } catch {
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    }
  };

  const setGlobalMute = async (hours: number | null) => {
    const mute_until = buildMuteUntil(hours);
    const optimisticMuteUntil =
      mute_until ?? new Date(8640000000000000).toISOString();
    dispatch(
      syncNotificationSettingsFromApi({
        ...settings,
        globalMuteUntil: optimisticMuteUntil,
      }),
    );
    try {
      await updateNotificationSettings({
        global_mute_until: mute_until ?? null,
      }).unwrap();
    } catch {
      if (apiData) {
        dispatch(
          syncNotificationSettingsFromApi(apiResponseToLocalSettings(apiData)),
        );
      }
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    }
  };

  const clearGlobalMute = async () => {
    dispatch(
      syncNotificationSettingsFromApi({ ...settings, globalMuteUntil: null }),
    );
    try {
      await updateNotificationSettings({ clear_global_mute: true }).unwrap();
    } catch {
      if (apiData) {
        dispatch(
          syncNotificationSettingsFromApi(apiResponseToLocalSettings(apiData)),
        );
      }
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    }
  };

  return {
    settings,
    apiData: apiData as NotificationSettingsResponseType | undefined,
    isLoading,
    isUpdating,
    updateSetting,
    updateMyGoalPref,
    updateFAndAPref,
    setGlobalMute,
    clearGlobalMute,
  };
};
