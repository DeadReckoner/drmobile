import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import type {
  MyGoalsPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { MY_GOALS_KEYS } from './constants';
import { cardStyle } from './shared';

type Props = {
  apiData: NotificationSettingsResponseType | undefined;
  updatingKey: string | null;
  onUpdate: (
    _key: keyof MyGoalsPrefsType,
    _pref: NotificationTypePrefType,
  ) => void;
  onSetDeliveryKey: (_key: keyof MyGoalsPrefsType) => void;
};

export const MyGoalsCard = ({
  apiData,
  updatingKey,
  onUpdate,
  onSetDeliveryKey,
}: Props) => {
  const { t } = useLocalization();

  if (!apiData?.my_goals_prefs) return null;

  return (
    <AppView bg-lightCardBG style={cardStyle}>
      <SettingsItem
        leftElement={<AppIcon set="Ionicons" name="map-outline" size={22} />}
        translationKey="notifications.my_goals_section"
      />
      <LineDivider marginV-0 height={3} />

      {MY_GOALS_KEYS.map((key) => {
        const pref = apiData.my_goals_prefs?.[key];
        if (!pref) return null;
        return (
          <AppView key={key}>
            <SettingsItem
              translationKey={
                `notifications.my_goals.${key}` as Parameters<typeof t>[0]
              }
              centerElement={
                <AppView left>
                  <TouchableOpacity
                    onPress={() => onSetDeliveryKey(key)}
                    style={[
                      styles.deliveryBadge,
                      { backgroundColor: Colors.accent },
                    ]}>
                    <AppText sm textColor={false} color={Colors.white} semibold>
                      {pref.delivery === 'immediate'
                        ? t('notifications.delivery_immediate')
                        : t('notifications.delivery_digest')}
                    </AppText>
                  </TouchableOpacity>
                </AppView>
              }
              rightElement={
                updatingKey === key ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <AppSwitch
                    value={pref.enabled}
                    onValueChange={(enabled) =>
                      onUpdate(key, { ...pref, enabled })
                    }
                  />
                )
              }
            />
            <LineDivider marginV-0 />
          </AppView>
        );
      })}
    </AppView>
  );
};

const styles = StyleSheet.create({
  deliveryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
