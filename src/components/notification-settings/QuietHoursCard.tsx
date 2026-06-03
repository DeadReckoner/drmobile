import { AppButton } from '@/components/AppButton';
import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { cardStyle } from './shared';
import {
  formatTimeDisplay,
  formatTimeToString,
  parseTimeString,
} from './utils';

type Props = {
  settings: NotificationSettingsType;
  updatingKey: string | null;
  onSettingUpdate: (
    _key: string,
    _partial: Partial<NotificationSettingsType>,
  ) => void;
  updateSetting: (_partial: Partial<NotificationSettingsType>) => void;
};

export const QuietHoursCard = ({
  settings,
  updatingKey,
  onSettingUpdate,
  updateSetting,
}: Props) => (
  <AppView bg-lightCardBG style={cardStyle}>
    <SettingsItem
      leftElement={<AppIcon set="Ionicons" name="moon-outline" size={22} />}
      translationKey="notifications.quiet_hours"
      rightElement={
        updatingKey === 'quietHoursEnabled' ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <AppSwitch
            value={settings.quietHoursEnabled}
            onValueChange={(value) =>
              onSettingUpdate('quietHoursEnabled', { quietHoursEnabled: value })
            }
          />
        )
      }
    />
    {settings.quietHoursEnabled && (
      <>
        <LineDivider marginV-0 />
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
                  {formatTimeDisplay(settings.quietHoursStart)}
                </AppText>
              </AppView>
            </AppButton>
          )}
          value={parseTimeString(settings.quietHoursStart)}
          mode="time"
          onChange={(date) => {
            if (date) {
              updateSetting({
                quietHoursStart: formatTimeToString(date),
                quietHoursEnd: formatTimeToString(date),
              });
            }
          }}
        />
        <LineDivider marginV-0 />
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
                  {formatTimeDisplay(settings.quietHoursEnd)}
                </AppText>
              </AppView>
            </AppButton>
          )}
          value={parseTimeString(settings.quietHoursEnd)}
          mode="time"
          minimumDate={parseTimeString(settings.quietHoursStart)}
          onChange={(date) => {
            if (date)
              updateSetting({ quietHoursEnd: formatTimeToString(date) });
          }}
        />
      </>
    )}
  </AppView>
);

const styles = StyleSheet.create({
  timeRow: {
    minHeight: 56,
  },
});
