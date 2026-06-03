import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import { StyleSheet } from 'react-native';
import { cardStyle } from './shared';
import { formatHourDisplay } from './utils';

type Props = {
  settings: NotificationSettingsType;
  digestLabel: string;
  onOpenDigestSheet: () => void;
  onOpenHourPicker: () => void;
  onOpenDaySheet: () => void;
};

export const DigestCard = ({
  settings,
  digestLabel,
  onOpenDigestSheet,
  onOpenHourPicker,
  onOpenDaySheet,
}: Props) => {
  const { theme } = useAppTheme();
  const { t } = useLocalization();

  return (
    <AppView bg-lightCardBG style={cardStyle}>
      <AppButton onPress={onOpenDigestSheet}>
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

      {settings.digestFrequency !== 'never' && (
        <>
          <LineDivider marginV-0 />
          <AppButton onPress={onOpenHourPicker}>
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
                translationKey="notifications.digest_delivery_hour"
              />
              <AppText body2 textColor semibold>
                {formatHourDisplay(settings.digestDeliveryHour)}
              </AppText>
            </AppView>
          </AppButton>

          {settings.digestFrequency === 'weekly' && (
            <>
              <LineDivider marginV-0 />
              <AppButton onPress={onOpenDaySheet}>
                <SettingsItem
                  leftElement={
                    <AppIcon set="Ionicons" name="calendar-outline" size={22} />
                  }
                  translationKey="notifications.digest_delivery_day"
                  rightElement={
                    <AppText body2 textColor semibold>
                      {t(
                        `notifications.days_of_week.${settings.digestDeliveryDayOfWeek}` as Parameters<
                          typeof t
                        >[0],
                      )}
                    </AppText>
                  }
                />
              </AppButton>
            </>
          )}
        </>
      )}
    </AppView>
  );
};

const styles = StyleSheet.create({
  timeRow: {
    minHeight: 56,
  },
});
