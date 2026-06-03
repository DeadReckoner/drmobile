import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { AppSwitch } from '@/components/AppSwitch';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { SettingsItem } from '@/components/SettingsItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { notificationApi } from '@/store/apis/notificationsApi';
import type {
  FriendsAndAccountabilityPrefsType,
  NotificationDeliveryType,
  NotificationOverrideType,
  NotificationTypePrefType,
  UpsertNotificationOverridePayloadType,
} from '@/store/apis/types/notificationsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { showToastAction } from '@/store/slices/settingsSlice';
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

// Per spec section 5: per-goal controls are for progress/milestone events only.
// friend_request / anchor_request / anchor_accepted_removed are global and not overridable per goal.
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

const AnchoredGoalNotificationOverride = () => {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { roadmapId } = useLocalSearchParams<{ roadmapId: string }>();

  const [isMuteSheetVisible, setIsMuteSheetVisible] = useState(false);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [deliveryPickerKey, setDeliveryPickerKey] = useState<
    keyof FriendsAndAccountabilityPrefsType | null
  >(null);

  const { data: overridesData, isLoading } =
    notificationApi.useGetNotificationAnchoredGoalOverridesQuery();

  const [upsertOverride] =
    notificationApi.useUpsertAnchoredGoalNotificationOverrideMutation();

  const [deleteOverride] =
    notificationApi.useDeleteAnchoredGoalNotificationOverrideMutation();

  const override: NotificationOverrideType | undefined =
    overridesData?.data?.find((o) => o.anchored_roadmap_id === roadmapId);

  const muteActive = isMuteActive(override?.mute_until ?? null);

  const muteExpiryLabel = (): string => {
    if (!override?.mute_until) return '';
    const muteDate = new Date(override.mute_until);
    if (muteDate.getFullYear() > 9000)
      return t('notifications.muted_indefinitely');
    return t('notifications.muted_until', {
      time: muteDate.toLocaleString(),
    });
  };

  const doUpsert = async (
    trackingKey: string,
    payload: UpsertNotificationOverridePayloadType,
  ) => {
    if (!roadmapId) return;
    setUpdatingKey(trackingKey);
    try {
      await upsertOverride({ roadmapId, payload }).unwrap();
    } catch {
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    } finally {
      setUpdatingKey(null);
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
    if (!roadmapId) return;
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
              await deleteOverride(roadmapId).unwrap();
            } catch {
              dispatch(
                showToastAction({
                  toastProps: {
                    type: 'failure',
                    message: 'Failed to reset settings',
                  },
                }),
              );
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
        <AppView paddingH-12 marginB-8>
          <HeaderWithBack headerKey="notifications.f_and_a_section" />
        </AppView>
        <Divider />

        <AppView style={styles.content}>
          {/* Override status card */}
          <AppView bg-lightCardBG style={styles.card}>
            <AppView paddingH-16 paddingV-14>
              {!override ? (
                <TranslatedText
                  body2
                  translationKey="notifications.override_none"
                />
              ) : (
                <TranslatedText
                  body2
                  semibold
                  translationKey="notifications.override_custom"
                />
              )}
            </AppView>
          </AppView>

          {/* Mute card */}
          <AppView bg-lightCardBG style={styles.card}>
            {muteActive && (
              <>
                <AppView
                  paddingH-16
                  paddingV-12
                  style={{ backgroundColor: Colors.warning }}>
                  <AppView row centerV spread>
                    <AppView row centerV gap-8 flex>
                      <AppIcon
                        set="Ionicons"
                        name="volume-mute-outline"
                        size={16}
                        color={Colors.white}
                      />
                      <AppText body2 color={Colors.white} numberOfLines={1}>
                        {muteExpiryLabel()}
                      </AppText>
                    </AppView>
                    <AppButton onPress={handleClearMute}>
                      {updatingKey === 'mute' ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <AppText caption color={Colors.white} semibold>
                          {t('notifications.unmute')}
                        </AppText>
                      )}
                    </AppButton>
                  </AppView>
                </AppView>
                <SettingsItemDivider />
              </>
            )}
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

          {/* Notification preferences card */}
          <AppView bg-lightCardBG style={styles.card}>
            <AppView paddingH-16 paddingV-10>
              <TranslatedText
                caption
                semibold
                translationKey="notifications.f_and_a_section"
                style={styles.sectionHeader}
              />
            </AppView>
            {OVERRIDE_PREF_KEYS.map((key) => {
              const pref: NotificationTypePrefType = override?.prefs?.[key] ?? {
                enabled: true,
                delivery: 'immediate',
              };
              const isThisUpdating = updatingKey === key;
              return (
                <AppView key={key}>
                  <SettingsItemDivider />
                  <SettingsItem
                    leftElement={
                      <AppIcon set="Ionicons" name="people-outline" size={22} />
                    }
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
                              {
                                backgroundColor:
                                  pref.delivery === 'immediate'
                                    ? Colors.primary
                                    : Colors.divider,
                              },
                            ]}>
                            <AppText caption color={Colors.white} semibold>
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

          {/* Reset card */}
          {override && (
            <AppView bg-lightCardBG style={styles.card}>
              <AppButton onPress={handleReset}>
                <AppView paddingV-14 paddingH-16 centerH>
                  <AppText body2 color={Colors.error} semibold>
                    {t('notifications.override_reset')}
                  </AppText>
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

export default AnchoredGoalNotificationOverride;

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
    borderRadius: 4,
  },
});
