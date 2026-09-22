import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { DeliveryBadge } from '@/components/notification-settings/DeliveryBadge';
import { SettingsItem } from '@/components/SettingsItem';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import type {
  MyGoalsPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import { MY_GOALS_KEYS } from './constants';
import { cardStyle } from './shared';

type Props = {
  apiData: NotificationSettingsResponseType | undefined;
  onUpdate: (
    _key: keyof MyGoalsPrefsType,
    _pref: NotificationTypePrefType,
  ) => void;
  onSetDeliveryKey: (_key: keyof MyGoalsPrefsType) => void;
};

export const MyGoalsCard = ({ apiData, onUpdate, onSetDeliveryKey }: Props) => {
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
                `notifications.my_goals.${key}` as TranslationKeysType
              }
              rightElement={
                <AppView row centerV gap-8>
                  <DeliveryBadge
                    delivery={pref.delivery}
                    onPress={() => onSetDeliveryKey(key)}
                  />
                  <AppSwitch
                    value={pref.enabled}
                    onValueChange={(enabled) =>
                      onUpdate(key, { ...pref, enabled })
                    }
                  />
                </AppView>
              }
            />
            <LineDivider marginV-0 />
          </AppView>
        );
      })}
    </AppView>
  );
};
