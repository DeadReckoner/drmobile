import type {
  ApiDigestFrequencyType,
  NotificationSettingsResponseType,
  UpdateNotificationSettingsPayloadType,
} from '@/store/apis/types/notificationsApi.types';
import type { NotificationSettingsType } from '@/store/types/settingsSlice.types';

export const apiDigestToLocal = (
  freq: ApiDigestFrequencyType,
): NotificationSettingsType['digestFrequency'] => {
  return freq === 'none' ? 'never' : freq;
};

export const localDigestToApi = (
  freq: NotificationSettingsType['digestFrequency'],
): ApiDigestFrequencyType => {
  return freq === 'never' ? 'none' : freq;
};

export const apiResponseToLocalSettings = (
  data: NotificationSettingsResponseType,
): NotificationSettingsType => ({
  pushEnabled: data.push_enabled,
  emailEnabled: data.email_enabled,
  fAndAEnabled: data.f_and_a_enabled,
  applyToAllFriends: data.apply_to_all_friends,
  quietHoursEnabled: data.quiet_hours_enabled,
  quietHoursStart: data.quiet_hours_start,
  quietHoursEnd: data.quiet_hours_end,
  digestFrequency: apiDigestToLocal(data.digest_frequency),
  digestDeliveryHour: data.digest_delivery_hour,
  digestDeliveryDayOfWeek: data.digest_delivery_day_of_week,
  globalMuteUntil: data.global_mute_until,
});

export const localSettingsToApiPayload = (
  partial: Partial<NotificationSettingsType>,
): UpdateNotificationSettingsPayloadType => {
  const payload: UpdateNotificationSettingsPayloadType = {};
  if (partial.pushEnabled !== undefined)
    payload.push_enabled = partial.pushEnabled;
  if (partial.emailEnabled !== undefined)
    payload.email_enabled = partial.emailEnabled;
  if (partial.fAndAEnabled !== undefined)
    payload.f_and_a_enabled = partial.fAndAEnabled;
  if (partial.applyToAllFriends !== undefined)
    payload.apply_to_all_friends = partial.applyToAllFriends;
  if (partial.quietHoursEnabled !== undefined)
    payload.quiet_hours_enabled = partial.quietHoursEnabled;
  if (partial.quietHoursStart !== undefined)
    payload.quiet_hours_start = partial.quietHoursStart;
  if (partial.quietHoursEnd !== undefined)
    payload.quiet_hours_end = partial.quietHoursEnd;
  if (partial.digestFrequency !== undefined)
    payload.digest_frequency = localDigestToApi(partial.digestFrequency);
  if (partial.digestDeliveryHour !== undefined)
    payload.digest_delivery_hour = partial.digestDeliveryHour;
  if (partial.digestDeliveryDayOfWeek !== undefined)
    payload.digest_delivery_day_of_week = partial.digestDeliveryDayOfWeek;
  return payload;
};

export const MUTE_DURATION_OPTIONS = [
  { labelKey: 'notifications.mute_24h', hours: 24 },
  { labelKey: 'notifications.mute_7d', hours: 7 * 24 },
  { labelKey: 'notifications.mute_indefinite', hours: null },
] as const;

export const buildMuteUntil = (hours: number | null): string | undefined => {
  if (hours === null) return undefined;
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
};

export const isMuteActive = (muteUntil: string | null): boolean => {
  if (!muteUntil) return false;
  return new Date(muteUntil) > new Date();
};
