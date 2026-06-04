import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSwitch } from '@/components/AppSwitch';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { SettingsItem } from '@/components/SettingsItem';
import { AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { notificationApi } from '@/store/apis/notificationsApi';
import type {
  FriendsAndAccountabilityPrefsType,
  NotificationDeliveryType,
  NotificationOverrideType,
  NotificationTypePrefType,
  UpsertNotificationOverridePayloadType,
} from '@/store/apis/types/notificationsApi.types';
import {
  buildMuteUntil,
  isMuteActive,
  MUTE_DURATION_OPTIONS,
} from '@/utils/notificationSettings.utils';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from 'react-native-ui-lib';

// Per spec section 5: per-person controls are for progress/milestone events only.
// friend_request / anchor_request / anchor_accepted_removed are global and not overridable per person.
const OVERRIDE_PREF_KEYS: (keyof FriendsAndAccountabilityPrefsType)[] = [
  'missed_progress',
  'falling_behind',
  'milestone_at_risk',
  'milestone_completed',
  'goal_completed',
  'timeline_updated',
];

const DELIVERY_OPTIONS: {
  labelKey: string;
  value: NotificationDeliveryType;
}[] = [
  { labelKey: 'notifications.delivery_immediate', value: 'immediate' },
  { labelKey: 'notifications.delivery_digest', value: 'digest' },
];

const FriendNotificationOverride = () => {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { showToast } = useToast();

  const [isMuteSheetVisible, setIsMuteSheetVisible] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [deliveryPickerKey, setDeliveryPickerKey] = useState<
    keyof FriendsAndAccountabilityPrefsType | null
  >(null);

  const { data: overridesData, isLoading } =
    notificationApi.useGetNotificationFriendOverridesQuery();

  const [upsertOverride] =
    notificationApi.useUpsertFriendNotificationOverrideMutation();

  const [deleteOverride, { isLoading: isDeleting }] =
    notificationApi.useDeleteFriendNotificationOverrideMutation();

  const override: NotificationOverrideType | undefined = overridesData?.find(
    (o) => o.friend_id === friendId,
  );

  const muteActive = isMuteActive(override?.mute_until ?? null);

  const doUpsert = async (
    trackingKey: string,
    payload: UpsertNotificationOverridePayloadType,
  ) => {
    if (!friendId) return;
    setUpdatingKey(trackingKey);
    try {
      await upsertOverride({ friendId, payload }).unwrap();
    } catch {
      showToast({
        type: 'failure',
        message: 'Failed to update settings',
      });
    } finally {
      setTimeout(() => setUpdatingKey(null), 1000);
    }
  };

  const handlePrefToggle = (
    key: keyof FriendsAndAccountabilityPrefsType,
    field: 'enabled' | 'delivery',
    value: boolean | NotificationDeliveryType,
  ) => {
    const currentPref: NotificationTypePrefType = override?.prefs?.[key] ?? {
      enabled: true,
      delivery: 'immediate',
    };
    doUpsert(key, {
      prefs: {
        ...(override?.prefs ?? {}),
        [key]: { ...currentPref, [field]: value },
      },
    });
  };

  const handleSetMute = (hours: number | null) => {
    const mute_until = buildMuteUntil(hours);
    doUpsert('mute', {
      prefs: override?.prefs ?? {},
      mute_until: mute_until ?? undefined,
    });
  };

  const handleClearMute = () => {
    doUpsert('mute', {
      prefs: override?.prefs ?? {},
      clear_mute_until: true,
    });
  };

  const handleReset = () => {
    if (!friendId) return;
    Alert.alert(
      t('notifications.override_reset'),
      t('notifications.override_reset_confirm'),
      [
        { text: t('notifications.cancel'), style: 'cancel' },
        {
          text: t('notifications.override_reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOverride(friendId).unwrap();
            } catch {
              showToast({
                type: 'failure',
                message: 'Failed to reset settings',
              });
            }
          },
        },
      ],
    );
  };

  const currentDelivery = deliveryPickerKey
    ? (override?.prefs?.[deliveryPickerKey]?.delivery ?? 'immediate')
    : 'immediate';

  const SettingsItemDivider = () => <LineDivider marginV-0 />;

  return (
    <AppScreen safeArea paddingH-0 key={theme}>
      {isLoading && <Loader transparent />}
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}>
        <AppView paddingH-12>
          <HeaderWithBack headerKey="notifications.title" />
        </AppView>

        <AppView style={styles.content}>
          <AppView bg-lightCardBG style={styles.card}>
            <SettingsItem
              leftElement={
                <AppIcon set="Ionicons" name="volume-mute-outline" size={22} />
              }
              translationKey="notifications.mute"
              rightElement={
                updatingKey === 'mute' && !muteActive ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <AppSwitch
                    value={muteActive}
                    onValueChange={(value) => {
                      if (value) {
                        setIsMuteSheetVisible(true);
                      } else {
                        handleClearMute();
                      }
                    }}
                  />
                )
              }
            />
          </AppView>

          <AppView bg-lightCardBG style={styles.card}>
            {OVERRIDE_PREF_KEYS.map((key, index) => {
              const pref: NotificationTypePrefType = override?.prefs?.[key] ?? {
                enabled: true,
                delivery: 'immediate',
              };
              const isThisUpdating = updatingKey === key;
              return (
                <AppView key={key}>
                  {index > 0 && <SettingsItemDivider />}
                  <SettingsItem
                    translationKey={
                      `notifications.f_and_a.${key}` as Parameters<typeof t>[0]
                    }
                    rightElement={
                      isThisUpdating ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.primary}
                        />
                      ) : (
                        <AppView row centerV gap-8>
                          <TouchableOpacity
                            onPress={() => setDeliveryPickerKey(key)}
                            style={[
                              styles.deliveryBadge,
                              { backgroundColor: Colors.accent },
                            ]}>
                            <AppText sm textColor semibold>
                              {pref.delivery === 'immediate'
                                ? t('notifications.delivery_immediate')
                                : t('notifications.delivery_digest')}
                            </AppText>
                          </TouchableOpacity>
                          <AppSwitch
                            value={pref.enabled}
                            onValueChange={(enabled) =>
                              handlePrefToggle(key, 'enabled', enabled)
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

          {override && (
            <AppView bg-lightCardBG style={styles.card}>
              <AppButton onPress={handleReset} disabled={isDeleting}>
                <AppView paddingV-14 paddingH-16 centerH>
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <AppText body2 color={Colors.error} semibold>
                      {t('notifications.override_reset')}
                    </AppText>
                  )}
                </AppView>
              </AppButton>
            </AppView>
          )}
        </AppView>
      </ScrollView>

      <AppActionSheetModal
        options={MUTE_DURATION_OPTIONS.map((option) => ({
          label: t(option.labelKey as Parameters<typeof t>[0]),
          onPress: () => {
            handleSetMute(option.hours);
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
            if (deliveryPickerKey) {
              handlePrefToggle(deliveryPickerKey, 'delivery', option.value);
            }
            setDeliveryPickerKey(null);
          },
          icon: currentDelivery === option.value && (
            <AppIcon name="check-circle" size={20} color={Colors.success} />
          ),
        }))}
        title={t('notifications.toggle_delivery')}
        visible={!!deliveryPickerKey}
        onDismiss={() => setDeliveryPickerKey(null)}
      />
    </AppScreen>
  );
};

export default FriendNotificationOverride;

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    letterSpacing: 0.8,
  },
  deliveryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});
