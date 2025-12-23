export type AddNotificationTokenPayload = {
  expo_token: string;
  platform: 'android' | 'ios';
  device_id: string;
};

export type AddNotificationTokenResponse = {
  message: string;
  token_id: string;
};
