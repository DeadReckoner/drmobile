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
