import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSwitch } from '@/components/AppSwitch';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectNotificationSettings,
  setNotificationSettings,
} from '@/store/slices/settingsSlice';
import type { DigestFrequencyType } from '@/store/types/settingsSlice.types';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const DIGEST_OPTIONS: { label: string; value: DigestFrequencyType }[] = [
  { label: 'notifications.digest_daily', value: 'daily' },
  { label: 'notifications.digest_weekly', value: 'weekly' },
  { label: 'notifications.digest_never', value: 'never' },
];

const parseTimeString = (time: string | undefined): Date => {
  const safe = time ?? '00:00';
  const [hours, minutes] = safe.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTimeToString = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

const formatTimeDisplay = (time: string | undefined): string => {
  const safe = time ?? '00:00';
  const [hours, minutes] = safe.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const NotificationSettings = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const notificationSettings = useAppSelector(selectNotificationSettings);
  const [isDigestSheetVisible, setIsDigestSheetVisible] = useState(false);

  const SettingsItemDivider = () => <LineDivider marginV-0 />;

  const digestLabel = (() => {
    switch (notificationSettings.digestFrequency) {
      case 'daily':
        return t('notifications.digest_daily');
      case 'weekly':
        return t('notifications.digest_weekly');
      default:
        return t('notifications.digest_never');
    }
  })();

  return (
    <AppScreen safeArea paddingH-0 key={theme}>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12 marginB-8>
          <HeaderWithBack headerKey="notifications.settings_title" />
        </AppView>
        <Divider />

        {notificationSettings.globalMute && (
          <AppView
            paddingH-16
            paddingV-12
            style={[styles.muteBanner, { backgroundColor: Colors.warning }]}>
            <AppView row centerV gap-8>
              <AppIcon
                set="Ionicons"
                name="volume-mute-outline"
                size={16}
                color={Colors.white}
              />
              <TranslatedText
                body2
                color={Colors.white}
                translationKey="notifications.global_mute_description"
              />
            </AppView>
          </AppView>
        )}
        <SettingsItemDivider />

        <SettingsItem
          leftElement={
            <AppIcon set="Ionicons" name="notifications-outline" size={22} />
          }
          translationKey="notifications.push_notifications"
          rightElement={
            <AppSwitch
              value={notificationSettings.pushEnabled}
              onValueChange={(value) =>
                dispatch(setNotificationSettings({ pushEnabled: value }))
              }
            />
          }
        />
        <SettingsItemDivider />

        <SettingsItem
          leftElement={<AppIcon set="Ionicons" name="mail-outline" size={22} />}
          translationKey="notifications.email_notifications"
          rightElement={
            <AppSwitch
              value={notificationSettings.emailEnabled}
              onValueChange={(value) =>
                dispatch(setNotificationSettings({ emailEnabled: value }))
              }
            />
          }
        />
        <SettingsItemDivider />

        <AppButton onPress={() => setIsDigestSheetVisible(true)}>
          <SettingsItem
            leftElement={
              <AppIcon set="Ionicons" name="newspaper-outline" size={22} />
            }
            translationKey="notifications.digest_preferences"
            rightElement={
              <AppText body2 textColor semibold key={theme}>
                {digestLabel}
              </AppText>
            }
          />
        </AppButton>
        <SettingsItemDivider />

        <SettingsItem
          leftElement={
            <AppIcon set="Ionicons" name="volume-mute-outline" size={22} />
          }
          translationKey="notifications.global_mute"
          rightElement={
            <AppSwitch
              value={notificationSettings.globalMute}
              onValueChange={(value) =>
                dispatch(setNotificationSettings({ globalMute: value }))
              }
            />
          }
        />
        <SettingsItemDivider />

        <AppView
          style={{
            borderWidth: notificationSettings.quietHoursEnabled ? 1 : 0,
            borderColor: Colors.divider,
            backgroundColor: notificationSettings.quietHoursEnabled
              ? Colors.lightCardBG
              : 'transparent',
            borderRadius: 8,
          }}>
          <SettingsItem
            leftElement={
              <AppIcon set="Ionicons" name="moon-outline" size={22} />
            }
            translationKey="notifications.quiet_hours"
            rightElement={
              <AppSwitch
                value={notificationSettings.quietHoursEnabled}
                onValueChange={(value) =>
                  dispatch(
                    setNotificationSettings({ quietHoursEnabled: value }),
                  )
                }
              />
            }
          />
          {notificationSettings.quietHoursEnabled && (
            <>
              <SettingsItemDivider />
              <AppDateTimePicker
                renderInput={() => (
                  <AppButton>
                    <AppView
                      row
                      centerV
                      spread
                      paddingH-16
                      paddingV-16
                      gap-16
                      style={styles.timeRow}>
                      <AppIcon set="Ionicons" name="time-outline" size={22} />
                      <TranslatedText
                        flex
                        body2
                        translationKey="notifications.quiet_hours_start"
                      />
                      <AppText body2 textColor semibold>
                        {formatTimeDisplay(
                          notificationSettings.quietHoursStart,
                        )}
                      </AppText>
                    </AppView>
                  </AppButton>
                )}
                value={parseTimeString(notificationSettings.quietHoursStart)}
                mode="time"
                onChange={(date) => {
                  if (date) {
                    dispatch(
                      setNotificationSettings({
                        quietHoursStart: formatTimeToString(date),
                      }),
                    );
                  }
                }}
              />
              <SettingsItemDivider />
              <AppDateTimePicker
                renderInput={() => (
                  <AppButton>
                    <AppView
                      row
                      centerV
                      spread
                      paddingH-16
                      paddingV-16
                      gap-16
                      style={styles.timeRow}>
                      <AppIcon set="Ionicons" name="time-outline" size={22} />
                      <TranslatedText
                        flex
                        body2
                        translationKey="notifications.quiet_hours_end"
                      />
                      <AppText body2 textColor semibold>
                        {formatTimeDisplay(notificationSettings.quietHoursEnd)}
                      </AppText>
                    </AppView>
                  </AppButton>
                )}
                value={parseTimeString(notificationSettings.quietHoursEnd)}
                mode="time"
                onChange={(date) => {
                  if (date) {
                    dispatch(
                      setNotificationSettings({
                        quietHoursEnd: formatTimeToString(date),
                      }),
                    );
                  }
                }}
              />
            </>
          )}
        </AppView>
      </ScrollView>

      <AppActionSheetModal
        options={DIGEST_OPTIONS.map((option) => ({
          label: t(option.label as Parameters<typeof t>[0]),
          onPress: () => {
            dispatch(
              setNotificationSettings({ digestFrequency: option.value }),
            );
            setIsDigestSheetVisible(false);
          },
          icon: notificationSettings.digestFrequency === option.value && (
            <AppIcon name="check-circle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('notifications.digest_preferences')}
        visible={isDigestSheetVisible}
        onDismiss={() => setIsDigestSheetVisible(false)}
      />
    </AppScreen>
  );
};

export default NotificationSettings;

const styles = StyleSheet.create({
  sectionHeader: {
    letterSpacing: 0.8,
  },
  muteBanner: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  timeRow: {
    minHeight: 56,
  },
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
