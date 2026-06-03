export type NotificationDeliveryType = 'immediate' | 'digest';

export type NotificationTypePrefType = {
  enabled: boolean;
  delivery: NotificationDeliveryType;
};

export type MyGoalsPrefsType = {
  daily_task_reminder: NotificationTypePrefType;
  task_due_reminder: NotificationTypePrefType;
  missed_task: NotificationTypePrefType;
  falling_behind: NotificationTypePrefType;
  milestone_at_risk: NotificationTypePrefType;
  milestone_due: NotificationTypePrefType;
  follow_on_milestone_ready: NotificationTypePrefType;
  goal_milestone_completed: NotificationTypePrefType;
};

export type FriendsAndAccountabilityPrefsType = {
  friend_request: NotificationTypePrefType;
  anchor_request: NotificationTypePrefType;
  anchor_accepted_removed: NotificationTypePrefType;
  missed_progress: NotificationTypePrefType;
  falling_behind: NotificationTypePrefType;
  milestone_at_risk: NotificationTypePrefType;
  milestone_completed: NotificationTypePrefType;
  goal_completed: NotificationTypePrefType;
  timeline_updated: NotificationTypePrefType;
};

export type ApiDigestFrequencyType = 'none' | 'daily' | 'weekly';

export type NotificationSettingsResponseType = {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  f_and_a_enabled: boolean;
  apply_to_all_friends: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  digest_frequency: ApiDigestFrequencyType;
  digest_delivery_hour: number;
  digest_delivery_day_of_week: number;
  global_mute_until: string | null;
  my_goals_prefs: MyGoalsPrefsType;
  f_and_a_prefs: FriendsAndAccountabilityPrefsType;
  updated_at: string;
};

export type UpdateNotificationSettingsPayloadType = Partial<
  Omit<NotificationSettingsResponseType, 'user_id' | 'updated_at'>
> & {
  clear_global_mute?: boolean;
};

export type NotificationOverrideType = {
  id: string;
  friend_id?: string;
  anchored_roadmap_id?: string;
  prefs: Partial<FriendsAndAccountabilityPrefsType>;
  mute_until: string | null;
  updated_at: string;
};

export type UpsertNotificationOverridePayloadType = {
  prefs: Partial<FriendsAndAccountabilityPrefsType>;
  mute_until?: string;
  clear_mute_until?: boolean;
};

export type AddNotificationTokenPayload = {
  expo_token: string;
  platform: 'android' | 'ios';
  device_id: string;
};

export type RemoveNotificationTokenPayload = {
  expo_token: string;
};

export type AddNotificationTokenResponse = {
  message: string;
  token_id: string;
};

export type NotificationStatusType = 'pending' | 'sent' | 'failed' | 'read';

export type NotificationEventType =
  | 'roadmap_complete'
  | 'roadmap_failed'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'anchor_request'
  | 'habit_anchor_request'
  | 'anchor_accepted'
  | 'anchor_rejected'
  | 'message_new';

export type RoadmapCompleteData = { roadmap_id: string };
export type RoadmapFailedData = { roadmap_id: string; error: string };
export type FriendRequestData = {
  friendship_id: string;
  requester_id: string;
};
export type FriendAcceptedData = {
  addressee_id: string;
  friendship_id: string;
};
export type FriendRejectedData = {
  addressee_id: string;
  friendship_id: string;
};
export type AnchorRequestData = {
  request_id: string;
  roadmap_id?: string;
  habit_id?: string;
};
export type AnchorAcceptedData = {
  request_id: string;
  roadmap_id?: string;
  habit_id?: string;
};
export type AnchorRejectedData = {
  request_id: string;
  roadmap_id?: string;
  habit_id?: string;
};
export type MessageNewData = {
  message_id: string;
  thread_id: string;
  sender_id: string;
};

type NotificationTypeDataMap =
  | { type: 'roadmap_complete'; data: RoadmapCompleteData }
  | { type: 'roadmap_failed'; data: RoadmapFailedData }
  | { type: 'friend_request'; data: FriendRequestData }
  | { type: 'friend_accepted'; data: FriendAcceptedData }
  | { type: 'friend_rejected'; data: FriendRejectedData }
  | { type: 'anchor_request'; data: AnchorRequestData }
  | { type: 'habit_anchor_request'; data: AnchorRequestData }
  | { type: 'anchor_accepted'; data: AnchorAcceptedData }
  | { type: 'anchor_rejected'; data: AnchorRejectedData }
  | { type: 'message_new'; data: MessageNewData };

export type NotificationType = {
  notification_id: string;
  user_id: string;
  title: string;
  body: string;
  status: NotificationStatusType;
  sent_at: string;
  created_at: string;
} & NotificationTypeDataMap;
