import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { GradientBackdrop } from '@/components/GradientBackdrop';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import {
  DAY_OPTIONS,
  DELIVERY_OPTIONS,
  DIGEST_OPTIONS,
} from '@/components/notification-settings/constants';
import { DigestCard } from '@/components/notification-settings/DigestCard';
import { FriendsCard } from '@/components/notification-settings/FriendsCard';
import { GlobalControlsCard } from '@/components/notification-settings/GlobalControlsCard';
import { HourPickerModal } from '@/components/notification-settings/HourPickerModal';
import { MyGoalsCard } from '@/components/notification-settings/MyGoalsCard';
import { QuietHoursCard } from '@/components/notification-settings/QuietHoursCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { notificationApi } from '@/store/apis/notificationsApi';
import type {
  FriendsAndAccountabilityPrefsType,
  MyGoalsPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
  UpdateNotificationSettingsPayloadType,
} from '@/store/apis/types/notificationsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { syncNotificationSettingsFromApi } from '@/store/slices/settingsSlice';
import { showToastAction } from '@/store/slices/toastSlice';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import {
  apiResponseToLocalSettings,
  buildMuteUntil,
  isMuteActive,
  localSettingsToApiPayload,
  MUTE_DURATION_OPTIONS,
} from '@/utils/notificationSettings.utils';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

type DraftMute =
  | { type: 'set'; hours: number | null }
  | { type: 'clear' }
  | null;

const NotificationSettings = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { from } = useLocalSearchParams<{
    from?: 'friends_accountability_sheet';
  }>();
  const showOnlyAccountibilitySettings =
    from === 'friends_accountability_sheet';
  const { settings, apiData, isLoading } = useNotificationSettings();

  const [updateNotificationSettings] =
    notificationApi.useUpdateNotificationSettingsMutation();

  const [isDigestSheetVisible, setIsDigestSheetVisible] = useState(false);
  const [isDaySheetVisible, setIsDaySheetVisible] = useState(false);
  const [isMuteSheetVisible, setIsMuteSheetVisible] = useState(false);
  const [isHourPickerVisible, setIsHourPickerVisible] = useState(false);
  const [myGoalDeliveryKey, setMyGoalDeliveryKey] = useState<
    keyof MyGoalsPrefsType | null
  >(null);
  const [fAndADeliveryKey, setFAndADeliveryKey] = useState<
    keyof FriendsAndAccountabilityPrefsType | null
  >(null);

  const [draftSettings, setDraftSettings] = useState<
    Partial<NotificationSettingsType>
  >({});
  const [draftMyGoalPrefs, setDraftMyGoalPrefs] = useState<
    Partial<Record<keyof MyGoalsPrefsType, NotificationTypePrefType>>
  >({});
  const [draftFAndAPrefs, setDraftFAndAPrefs] = useState<
    Partial<
      Record<keyof FriendsAndAccountabilityPrefsType, NotificationTypePrefType>
    >
  >({});
  const [draftMute, setDraftMute] = useState<DraftMute>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsReady(true);
    }, []),
  );

  const displaySettings: NotificationSettingsType = {
    ...settings,
    ...draftSettings,
  };
  const displayMuteActive = draftMute
    ? draftMute.type === 'set'
    : isMuteActive(settings.globalMuteUntil);
  const displayApiData: NotificationSettingsResponseType | undefined = apiData
    ? {
        ...apiData,
        my_goals_prefs: { ...apiData.my_goals_prefs, ...draftMyGoalPrefs },
        f_and_a_prefs: { ...apiData.f_and_a_prefs, ...draftFAndAPrefs },
      }
    : undefined;

  const hasChanges =
    Object.keys(draftSettings).length > 0 ||
    Object.keys(draftMyGoalPrefs).length > 0 ||
    Object.keys(draftFAndAPrefs).length > 0 ||
    draftMute !== null;

  const digestLabel = (() => {
    switch (displaySettings.digestFrequency) {
      case 'daily':
        return t('notifications.digest_daily');
      case 'weekly':
        return t('notifications.digest_weekly');
      default:
        return t('notifications.digest_never');
    }
  })();

  const handleSettingUpdate = (
    _key: string,
    partial: Partial<NotificationSettingsType>,
  ) => {
    setDraftSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleDraftSettingChange = (
    partial: Partial<NotificationSettingsType>,
  ) => {
    setDraftSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleMyGoalPrefUpdate = (
    key: keyof MyGoalsPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    setDraftMyGoalPrefs((prev) => ({ ...prev, [key]: pref }));
  };

  const handleFAndAPrefUpdate = (
    key: keyof FriendsAndAccountabilityPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    setDraftFAndAPrefs((prev) => ({ ...prev, [key]: pref }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateNotificationSettingsPayloadType = {
        ...localSettingsToApiPayload(draftSettings),
      };
      if (Object.keys(draftMyGoalPrefs).length > 0) {
        payload.my_goals_prefs = {
          ...apiData?.my_goals_prefs,
          ...draftMyGoalPrefs,
        } as MyGoalsPrefsType;
      }
      if (Object.keys(draftFAndAPrefs).length > 0) {
        payload.f_and_a_prefs = {
          ...apiData?.f_and_a_prefs,
          ...draftFAndAPrefs,
        } as FriendsAndAccountabilityPrefsType;
      }
      if (draftMute?.type === 'set') {
        payload.global_mute_until = buildMuteUntil(draftMute.hours);
      }
      if (draftMute?.type === 'clear') {
        payload.clear_global_mute = true;
      }

      const optimisticMuteUntil =
        draftMute?.type === 'set'
          ? buildMuteUntil(draftMute.hours)
          : draftMute?.type === 'clear'
            ? null
            : settings.globalMuteUntil;
      dispatch(
        syncNotificationSettingsFromApi({
          ...settings,
          ...draftSettings,
          globalMuteUntil: optimisticMuteUntil,
        }),
      );

      await updateNotificationSettings(payload).unwrap();
      setDraftSettings({});
      setDraftMyGoalPrefs({});
      setDraftFAndAPrefs({});
      setDraftMute(null);
      dispatch(
        showToastAction({
          toastProps: { type: 'success', message: 'Settings saved' },
        }),
      );
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
    } finally {
      setIsSaving(false);
    }
  };

  const currentMyGoalDelivery = myGoalDeliveryKey
    ? (draftMyGoalPrefs[myGoalDeliveryKey]?.delivery ??
      apiData?.my_goals_prefs?.[myGoalDeliveryKey]?.delivery ??
      'immediate')
    : 'immediate';

  const currentFAndADelivery = fAndADeliveryKey
    ? (draftFAndAPrefs[fAndADeliveryKey]?.delivery ??
      apiData?.f_and_a_prefs?.[fAndADeliveryKey]?.delivery ??
      'immediate')
    : 'immediate';

  return (
    <AppScreen safeArea paddingH-0>
      {isLoading && <Loader />}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12>
          <HeaderWithBack headerKey="notifications.settings_title" />
        </AppView>

        <AppView style={styles.content}>
          {isReady && (
            <>
              {showOnlyAccountibilitySettings ? null : (
                <>
                  <GlobalControlsCard
                    settings={displaySettings}
                    muteActive={displayMuteActive}
                    onSettingUpdate={handleSettingUpdate}
                    onMuteToggle={(value) =>
                      value
                        ? setIsMuteSheetVisible(true)
                        : setDraftMute({ type: 'clear' })
                    }
                  />

                  <DigestCard
                    settings={displaySettings}
                    digestLabel={digestLabel}
                    onOpenDigestSheet={() => setIsDigestSheetVisible(true)}
                    onOpenHourPicker={() => setIsHourPickerVisible(true)}
                    onOpenDaySheet={() => setIsDaySheetVisible(true)}
                  />

                  <QuietHoursCard
                    settings={displaySettings}
                    onSettingUpdate={handleSettingUpdate}
                    updateSetting={handleDraftSettingChange}
                  />

                  <MyGoalsCard
                    apiData={displayApiData}
                    onUpdate={handleMyGoalPrefUpdate}
                    onSetDeliveryKey={setMyGoalDeliveryKey}
                  />
                </>
              )}

              <FriendsCard
                settings={displaySettings}
                apiData={displayApiData}
                onSettingUpdate={handleSettingUpdate}
                onUpdate={handleFAndAPrefUpdate}
                onSetDeliveryKey={setFAndADeliveryKey}
              />
            </>
          )}
        </AppView>
      </ScrollView>

      {isReady && hasChanges && (
        <AppView paddingB-48 paddingH-16>
          <GradientBackdrop height={200} />
          <PrimaryButton
            label="notifications.save_changes"
            onPress={handleSave}
            shouldShowLoader
            disabled={isSaving}
            isLoading={isSaving}
          />
        </AppView>
      )}

      {isDigestSheetVisible && (
        <AppActionSheetModal
          options={DIGEST_OPTIONS.map((option) => ({
            label: t(option.label as Parameters<typeof t>[0]),
            onPress: () => {
              setDraftSettings((prev) => ({
                ...prev,
                digestFrequency: option.value,
              }));
              setIsDigestSheetVisible(false);
            },
            icon: displaySettings.digestFrequency === option.value && (
              <AppIcon name="check-circle" size={20} color={Colors.success} />
            ),
          }))}
          title={t('notifications.digest_preferences')}
          visible={isDigestSheetVisible}
          onDismiss={() => setIsDigestSheetVisible(false)}
        />
      )}

      {isDaySheetVisible && (
        <AppActionSheetModal
          options={DAY_OPTIONS.map((option) => ({
            label: t(option.label as Parameters<typeof t>[0]),
            onPress: () => {
              setDraftSettings((prev) => ({
                ...prev,
                digestDeliveryDayOfWeek: option.value,
              }));
              setIsDaySheetVisible(false);
            },
            icon: displaySettings.digestDeliveryDayOfWeek === option.value && (
              <AppIcon name="check-circle" size={20} color={Colors.success} />
            ),
          }))}
          title={t('notifications.digest_delivery_day')}
          visible={isDaySheetVisible}
          onDismiss={() => setIsDaySheetVisible(false)}
        />
      )}

      {isMuteSheetVisible && (
        <AppActionSheetModal
          options={MUTE_DURATION_OPTIONS.map((option) => ({
            label: t(option.labelKey as Parameters<typeof t>[0]),
            onPress: () => {
              setDraftMute({ type: 'set', hours: option.hours });
              setIsMuteSheetVisible(false);
            },
          }))}
          title={t('notifications.mute')}
          visible={isMuteSheetVisible}
          onDismiss={() => setIsMuteSheetVisible(false)}
        />
      )}

      {!!myGoalDeliveryKey && (
        <AppActionSheetModal
          options={DELIVERY_OPTIONS.map((option) => ({
            label: t(option.labelKey as Parameters<typeof t>[0]),
            onPress: () => {
              if (myGoalDeliveryKey) {
                const currentPref =
                  draftMyGoalPrefs[myGoalDeliveryKey] ??
                  apiData?.my_goals_prefs?.[myGoalDeliveryKey];
                if (currentPref) {
                  handleMyGoalPrefUpdate(myGoalDeliveryKey, {
                    ...currentPref,
                    delivery: option.value,
                  });
                }
              }
              setMyGoalDeliveryKey(null);
            },
            icon: currentMyGoalDelivery === option.value && (
              <AppIcon name="check-circle" size={20} color={Colors.success} />
            ),
          }))}
          title={t('notifications.toggle_delivery')}
          visible={!!myGoalDeliveryKey}
          onDismiss={() => setMyGoalDeliveryKey(null)}
        />
      )}

      {!!fAndADeliveryKey && (
        <AppActionSheetModal
          options={DELIVERY_OPTIONS.map((option) => ({
            label: t(option.labelKey as Parameters<typeof t>[0]),
            onPress: () => {
              if (fAndADeliveryKey) {
                const currentPref =
                  draftFAndAPrefs[fAndADeliveryKey] ??
                  apiData?.f_and_a_prefs?.[fAndADeliveryKey];
                if (currentPref) {
                  handleFAndAPrefUpdate(fAndADeliveryKey, {
                    ...currentPref,
                    delivery: option.value,
                  });
                }
              }
              setFAndADeliveryKey(null);
            },
            icon: currentFAndADelivery === option.value && (
              <AppIcon name="check-circle" size={20} color={Colors.success} />
            ),
          }))}
          title={t('notifications.toggle_delivery')}
          visible={!!fAndADeliveryKey}
          onDismiss={() => setFAndADeliveryKey(null)}
        />
      )}

      {isHourPickerVisible && (
        <HourPickerModal
          visible={isHourPickerVisible}
          currentHour24={displaySettings.digestDeliveryHour}
          onClose={() => setIsHourPickerVisible(false)}
          onConfirm={(hour24) => {
            setDraftSettings((prev) => ({
              ...prev,
              digestDeliveryHour: hour24,
            }));
            setIsHourPickerVisible(false);
          }}
        />
      )}
    </AppScreen>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
  },
});
