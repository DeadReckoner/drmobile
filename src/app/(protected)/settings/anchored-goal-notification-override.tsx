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
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
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

type DraftMute =
  | { type: 'set'; hours: number | null }
  | { type: 'clear' }
  | null;

const AnchoredGoalNotificationOverride = () => {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { roadmapId } = useLocalSearchParams<{ roadmapId: string }>();

  const [isMuteSheetVisible, setIsMuteSheetVisible] = useState(false);
  const [deliveryPickerKey, setDeliveryPickerKey] = useState<
    keyof FriendsAndAccountabilityPrefsType | null
  >(null);
  const [draftPrefs, setDraftPrefs] = useState<
    Partial<
      Record<keyof FriendsAndAccountabilityPrefsType, NotificationTypePrefType>
    >
  >({});
  const [draftMute, setDraftMute] = useState<DraftMute>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: overridesData, isLoading } =
    notificationApi.useGetNotificationAnchoredGoalOverridesQuery();

  const [upsertOverride] =
    notificationApi.useUpsertAnchoredGoalNotificationOverrideMutation();

  const [deleteOverride, { isLoading: isDeleting }] =
    notificationApi.useDeleteAnchoredGoalNotificationOverrideMutation();

  const override: NotificationOverrideType | undefined =
    overridesData?.data?.find((o) => o.anchored_roadmap_id === roadmapId);

  const serverMuteActive = isMuteActive(override?.mute_until ?? null);
  const displayMuteActive = draftMute
    ? draftMute.type === 'set'
    : serverMuteActive;

  const displayMuteUntil: string | null =
    draftMute?.type === 'set'
      ? buildMuteUntil(draftMute.hours)
      : (override?.mute_until ?? null);

  const getPref = (
    key: keyof FriendsAndAccountabilityPrefsType,
  ): NotificationTypePrefType =>
    draftPrefs[key] ??
    override?.prefs?.[key] ?? { enabled: true, delivery: 'immediate' };

  const hasChanges = Object.keys(draftPrefs).length > 0 || draftMute !== null;

  const muteExpiryLabel = (): string => {
    if (!displayMuteUntil) return '';
    const muteDate = new Date(displayMuteUntil);
    if (muteDate.getFullYear() > 9000)
      return t('notifications.muted_indefinitely');
    return t('notifications.muted_until', {
      time: muteDate.toLocaleString(),
    });
  };

  const handlePrefToggle = (
    key: keyof FriendsAndAccountabilityPrefsType,
    field: 'enabled' | 'delivery',
    value: boolean | NotificationDeliveryType,
  ) => {
    setDraftPrefs((prev) => ({
      ...prev,
      [key]: { ...getPref(key), [field]: value },
    }));
  };

  const handleSetMute = (hours: number | null) => {
    setDraftMute({ type: 'set', hours });
  };

  const handleClearMute = () => {
    setDraftMute({ type: 'clear' });
  };

  const handleSave = async () => {
    if (!roadmapId) return;
    setIsSaving(true);
    try {
      const mergedPrefs = { ...(override?.prefs ?? {}), ...draftPrefs };
      const payload: UpsertNotificationOverridePayloadType = {
        prefs: mergedPrefs,
      };
      if (draftMute?.type === 'set') {
        payload.mute_until = buildMuteUntil(draftMute.hours);
      }
      if (draftMute?.type === 'clear') payload.clear_mute_until = true;
      await upsertOverride({ roadmapId, payload }).unwrap();
      setDraftPrefs({});
      setDraftMute(null);
      dispatch(
        showToastAction({
          toastProps: { type: 'success', message: 'Settings saved' },
        }),
      );
    } catch {
      dispatch(
        showToastAction({
          toastProps: { type: 'failure', message: 'Failed to update settings' },
        }),
      );
    } finally {
      setIsSaving(false);
    }
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
              setDraftPrefs({});
              setDraftMute(null);
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
    ? getPref(deliveryPickerKey).delivery
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
              {!override && !hasChanges ? (
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
            {displayMuteActive && (
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
                      <AppText caption color={Colors.white} semibold>
                        {t('notifications.unmute')}
                      </AppText>
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
                <AppSwitch
                  value={displayMuteActive}
                  onValueChange={(value) => {
                    if (value) {
                      setIsMuteSheetVisible(true);
                    } else {
                      handleClearMute();
                    }
                  }}
                />
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
              const pref = getPref(key);
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
                      <AppView row centerV gap-8>
                        <AppButton
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
                        </AppButton>
                        <AppSwitch
                          value={pref.enabled}
                          onValueChange={(enabled) =>
                            handlePrefToggle(key, 'enabled', enabled)
                          }
                        />
                      </AppView>
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

      {hasChanges && (
        <AppView paddingH-16 paddingB-16>
          <AppButton
            bg-primary
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}>
            <AppView paddingV-14 centerH>
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <AppText body2 white semibold>
                  {t('notifications.save_changes')}
                </AppText>
              )}
            </AppView>
          </AppButton>
        </AppView>
      )}

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
  saveButton: {
    borderRadius: 12,
  },
});
