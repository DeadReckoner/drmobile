import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { DeliveryBadge } from '@/components/notification-settings/DeliveryBadge';
import { SettingsItem } from '@/components/SettingsItem';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import type {
  FriendsAndAccountabilityPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import { F_AND_A_KEYS } from './constants';
import { cardStyle } from './shared';

type Props = {
  settings: NotificationSettingsType;
  apiData: NotificationSettingsResponseType | undefined;
  onSettingUpdate: (
    _key: string,
    _partial: Partial<NotificationSettingsType>,
  ) => void;
  onUpdate: (
    _key: keyof FriendsAndAccountabilityPrefsType,
    _pref: NotificationTypePrefType,
  ) => void;
  onSetDeliveryKey: (_key: keyof FriendsAndAccountabilityPrefsType) => void;
};

export const FriendsCard = ({
  settings,
  apiData,
  onSettingUpdate,
  onUpdate,
  onSetDeliveryKey,
}: Props) => {
  return (
    <AppView bg-lightCardBG style={cardStyle}>
      <SettingsItem
        leftElement={<AppIcon set="Ionicons" name="people-outline" size={22} />}
        translationKey="notifications.f_and_a_enabled"
        rightElement={
          <AppSwitch
            value={settings.fAndAEnabled}
            onValueChange={(value) =>
              onSettingUpdate('fAndAEnabled', { fAndAEnabled: value })
            }
          />
        }
      />

      {settings.fAndAEnabled && apiData?.f_and_a_prefs && (
        <AppView>
          <LineDivider marginV-0 height={3} />
          <SettingsItem
            translationKey="notifications.apply_to_all_friends"
            rightElement={
              <AppSwitch
                value={settings.applyToAllFriends}
                onValueChange={(value) =>
                  onSettingUpdate('applyToAllFriends', {
                    applyToAllFriends: value,
                  })
                }
              />
            }
          />
          {F_AND_A_KEYS.map((key) => {
            const pref = apiData.f_and_a_prefs?.[key];
            if (!pref) return null;
            return (
              <AppView key={key}>
                <LineDivider marginV-0 />
                <SettingsItem
                  translationKey={
                    `notifications.f_and_a.${key}` as TranslationKeysType
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
              </AppView>
            );
          })}
        </AppView>
      )}
    </AppView>
  );
};
