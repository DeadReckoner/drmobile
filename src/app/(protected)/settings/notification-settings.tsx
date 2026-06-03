import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
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
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import type {
  FriendsAndAccountabilityPrefsType,
  MyGoalsPrefsType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import {
  isMuteActive,
  MUTE_DURATION_OPTIONS,
} from '@/utils/notificationSettings.utils';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const NotificationSettings = () => {
  const { t } = useLocalization();
  const {
    settings,
    apiData,
    isLoading,
    updateSetting,
    updateMyGoalPref,
    updateFAndAPref,
    setGlobalMute,
    clearGlobalMute,
  } = useNotificationSettings();

  const [isDigestSheetVisible, setIsDigestSheetVisible] = useState(false);
  const [isDaySheetVisible, setIsDaySheetVisible] = useState(false);
  const [isMuteSheetVisible, setIsMuteSheetVisible] = useState(false);
  const [isHourPickerVisible, setIsHourPickerVisible] = useState(false);
  const [updatingSettingKey, setUpdatingSettingKey] = useState<string | null>(
    null,
  );
  const [updatingGoalKey, setUpdatingGoalKey] = useState<string | null>(null);
  const [updatingFAndAKey, setUpdatingFAndAKey] = useState<string | null>(null);
  const [myGoalDeliveryKey, setMyGoalDeliveryKey] = useState<
    keyof MyGoalsPrefsType | null
  >(null);
  const [fAndADeliveryKey, setFAndADeliveryKey] = useState<
    keyof FriendsAndAccountabilityPrefsType | null
  >(null);

  const muteActive = isMuteActive(settings.globalMuteUntil);

  const digestLabel = (() => {
    switch (settings.digestFrequency) {
      case 'daily':
        return t('notifications.digest_daily');
      case 'weekly':
        return t('notifications.digest_weekly');
      default:
        return t('notifications.digest_never');
    }
  })();

  const handleSettingUpdate = async (
    key: string,
    partial: Partial<NotificationSettingsType>,
  ) => {
    setUpdatingSettingKey(key);
    try {
      await updateSetting(partial);
    } finally {
      setUpdatingSettingKey(null);
    }
  };

  const handleMuteClear = async () => {
    setUpdatingSettingKey('globalMute');
    try {
      await clearGlobalMute();
    } finally {
      setUpdatingSettingKey(null);
    }
  };

  const handleMyGoalPrefUpdate = async (
    key: keyof MyGoalsPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    setUpdatingGoalKey(key);
    try {
      await updateMyGoalPref(key, pref);
    } finally {
      setUpdatingGoalKey(null);
    }
  };

  const handleFAndAPrefUpdate = async (
    key: keyof FriendsAndAccountabilityPrefsType,
    pref: NotificationTypePrefType,
  ) => {
    setUpdatingFAndAKey(key);
    try {
      await updateFAndAPref(key, pref);
    } finally {
      setUpdatingFAndAKey(null);
    }
  };

  const currentMyGoalDelivery = myGoalDeliveryKey
    ? (apiData?.my_goals_prefs?.[myGoalDeliveryKey]?.delivery ?? 'immediate')
    : 'immediate';

  const currentFAndADelivery = fAndADeliveryKey
    ? (apiData?.f_and_a_prefs?.[fAndADeliveryKey]?.delivery ?? 'immediate')
    : 'immediate';

  return (
    <AppScreen safeArea paddingH-0>
      {isLoading && <Loader transparent />}
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12 marginB-8>
          <HeaderWithBack headerKey="notifications.settings_title" />
        </AppView>
        <Divider />

        <AppView style={styles.content}>
          <GlobalControlsCard
            settings={settings}
            updatingKey={updatingSettingKey}
            muteActive={muteActive}
            onSettingUpdate={handleSettingUpdate}
            onMuteToggle={(value) =>
              value ? setIsMuteSheetVisible(true) : handleMuteClear()
            }
          />

          <DigestCard
            settings={settings}
            digestLabel={digestLabel}
            onOpenDigestSheet={() => setIsDigestSheetVisible(true)}
            onOpenHourPicker={() => setIsHourPickerVisible(true)}
            onOpenDaySheet={() => setIsDaySheetVisible(true)}
          />

          <QuietHoursCard
            settings={settings}
            updatingKey={updatingSettingKey}
            onSettingUpdate={handleSettingUpdate}
            updateSetting={updateSetting}
          />

          <MyGoalsCard
            apiData={apiData}
            updatingKey={updatingGoalKey}
            onUpdate={handleMyGoalPrefUpdate}
            onSetDeliveryKey={setMyGoalDeliveryKey}
          />

          <FriendsCard
            settings={settings}
            apiData={apiData}
            updatingKey={updatingSettingKey}
            updatingFAndAKey={updatingFAndAKey}
            onSettingUpdate={handleSettingUpdate}
            onUpdate={handleFAndAPrefUpdate}
            onSetDeliveryKey={setFAndADeliveryKey}
          />
        </AppView>
      </ScrollView>

      <AppActionSheetModal
        options={DIGEST_OPTIONS.map((option) => ({
          label: t(option.label as Parameters<typeof t>[0]),
          onPress: () => {
            updateSetting({ digestFrequency: option.value });
            setIsDigestSheetVisible(false);
          },
          icon: settings.digestFrequency === option.value && (
            <AppIcon name="check-circle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('notifications.digest_preferences')}
        visible={isDigestSheetVisible}
        onDismiss={() => setIsDigestSheetVisible(false)}
      />

      <AppActionSheetModal
        options={DAY_OPTIONS.map((option) => ({
          label: t(option.label as Parameters<typeof t>[0]),
          onPress: () => {
            updateSetting({ digestDeliveryDayOfWeek: option.value });
            setIsDaySheetVisible(false);
          },
          icon: settings.digestDeliveryDayOfWeek === option.value && (
            <AppIcon name="check-circle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('notifications.digest_delivery_day')}
        visible={isDaySheetVisible}
        onDismiss={() => setIsDaySheetVisible(false)}
      />

      <AppActionSheetModal
        options={MUTE_DURATION_OPTIONS.map((option) => ({
          label: t(option.labelKey as Parameters<typeof t>[0]),
          onPress: () => {
            setGlobalMute(option.hours);
            setIsMuteSheetVisible(false);
          },
        }))}
        title={t('notifications.mute')}
        visible={isMuteSheetVisible}
        onDismiss={() => setIsMuteSheetVisible(false)}
      />

      <AppActionSheetModal
        options={DELIVERY_OPTIONS.map((option) => ({
          label: t(option.labelKey as Parameters<typeof t>[0]),
          onPress: () => {
            if (
              myGoalDeliveryKey &&
              apiData?.my_goals_prefs?.[myGoalDeliveryKey]
            ) {
              handleMyGoalPrefUpdate(myGoalDeliveryKey, {
                ...apiData.my_goals_prefs[myGoalDeliveryKey],
                delivery: option.value,
              });
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

      <AppActionSheetModal
        options={DELIVERY_OPTIONS.map((option) => ({
          label: t(option.labelKey as Parameters<typeof t>[0]),
          onPress: () => {
            if (
              fAndADeliveryKey &&
              apiData?.f_and_a_prefs?.[fAndADeliveryKey]
            ) {
              handleFAndAPrefUpdate(fAndADeliveryKey, {
                ...apiData.f_and_a_prefs[fAndADeliveryKey],
                delivery: option.value,
              });
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

      <HourPickerModal
        visible={isHourPickerVisible}
        currentHour24={settings.digestDeliveryHour}
        onClose={() => setIsHourPickerVisible(false)}
        onConfirm={(hour24) => {
          updateSetting({ digestDeliveryHour: hour24 });
          setIsHourPickerVisible(false);
        }}
      />
    </AppScreen>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
});
