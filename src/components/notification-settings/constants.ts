import type {
  FriendsAndAccountabilityPrefsType,
  MyGoalsPrefsType,
  NotificationDeliveryType,
} from '@/store/apis/types/notificationsApi.types';
import type { DigestFrequencyType } from '@/store/types/settingsSlice.types';

export const DIGEST_OPTIONS: { label: string; value: DigestFrequencyType }[] = [
  { label: 'notifications.digest_daily', value: 'daily' },
  { label: 'notifications.digest_weekly', value: 'weekly' },
  { label: 'notifications.digest_never', value: 'never' },
];

export const DAY_OPTIONS = [
  { label: 'notifications.days_of_week.0', value: 0 },
  { label: 'notifications.days_of_week.1', value: 1 },
  { label: 'notifications.days_of_week.2', value: 2 },
  { label: 'notifications.days_of_week.3', value: 3 },
  { label: 'notifications.days_of_week.4', value: 4 },
  { label: 'notifications.days_of_week.5', value: 5 },
  { label: 'notifications.days_of_week.6', value: 6 },
];

export const DELIVERY_OPTIONS: {
  labelKey: string;
  value: NotificationDeliveryType;
}[] = [
  { labelKey: 'notifications.delivery_immediate', value: 'immediate' },
  { labelKey: 'notifications.delivery_digest', value: 'digest' },
];

export const MY_GOALS_KEYS: (keyof MyGoalsPrefsType)[] = [
  'daily_task_reminder',
  'task_due_reminder',
  'missed_task',
  'falling_behind',
  'milestone_at_risk',
  'milestone_due',
  'follow_on_milestone_ready',
  'goal_milestone_completed',
];

export const F_AND_A_KEYS: (keyof FriendsAndAccountabilityPrefsType)[] = [
  'friend_request',
  'anchor_request',
  'anchor_accepted_removed',
  'missed_progress',
  'falling_behind',
  'milestone_at_risk',
  'milestone_completed',
  'goal_completed',
  'timeline_updated',
];

export const HOUR_ITEM_HEIGHT = 44;
