import { AppIcon } from '@/components/AppIcon';
import { AppSwitch } from '@/components/AppSwitch';
import { LineDivider } from '@/components/LineDivider';
import { SettingsItem } from '@/components/SettingsItem';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import type {
  FriendsAndAccountabilityPrefsType,
  NotificationSettingsResponseType,
  NotificationTypePrefType,
} from '@/store/apis/types/notificationsApi.types';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import { F_AND_A_KEYS } from './constants';
import { cardStyle } from './shared';

type Props = {
  settings: NotificationSettingsType;
  apiData: NotificationSettingsResponseType | undefined;
  updatingKey: string | null;
  updatingFAndAKey: string | null;
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
  updatingKey,
  updatingFAndAKey,
  onSettingUpdate,
  onUpdate,
  onSetDeliveryKey,
}: Props) => {
  const { t } = useLocalization();

  return (
    <AppView bg-lightCardBG style={cardStyle}>
      <SettingsItem
        leftElement={<AppIcon set="Ionicons" name="people-outline" size={22} />}
        translationKey="notifications.f_and_a_enabled"
        rightElement={
          updatingKey === 'fAndAEnabled' ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <AppSwitch
              value={settings.fAndAEnabled}
              onValueChange={(value) =>
                onSettingUpdate('fAndAEnabled', { fAndAEnabled: value })
              }
            />
          )
        }
      />

      {settings.fAndAEnabled && apiData?.f_and_a_prefs && (
        <AppView>
          <LineDivider marginV-0 height={3} />
          <SettingsItem
            translationKey="notifications.apply_to_all_friends"
            rightElement={
              updatingKey === 'applyToAllFriends' ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <AppSwitch
                  value={settings.applyToAllFriends}
                  onValueChange={(value) =>
                    onSettingUpdate('applyToAllFriends', {
                      applyToAllFriends: value,
                    })
                  }
                />
              )
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
                    `notifications.f_and_a.${key}` as Parameters<typeof t>[0]
                  }
                  centerElement={
                    <AppView left>
                      <TouchableOpacity
                        onPress={() => onSetDeliveryKey(key)}
                        style={[
                          styles.deliveryBadge,
                          { backgroundColor: Colors.accent },
                        ]}>
                        <AppText
                          sm
                          textColor={false}
                          color={Colors.white}
                          semibold>
                          {pref.delivery === 'immediate'
                            ? t('notifications.delivery_immediate')
                            : t('notifications.delivery_digest')}
                        </AppText>
                      </TouchableOpacity>
                    </AppView>
                  }
                  rightElement={
                    updatingFAndAKey === key ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <AppView row centerV gap-8>
                        <AppSwitch
                          value={pref.enabled}
                          onValueChange={(enabled) =>
                            onUpdate(key, { ...pref, enabled })
                          }
                        />
                      </AppView>
                    )
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

const styles = StyleSheet.create({
  deliveryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
