export type AddNotificationTokenPayload = {
  expo_token: string;
  platform: 'android' | 'ios';
  device_id: string;
};

export type AddNotificationTokenResponse = {
  message: string;
  token_id: string;
};

export type NotificationType = {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  sent_at: string;
  error: string;
  created_at: string;
};
