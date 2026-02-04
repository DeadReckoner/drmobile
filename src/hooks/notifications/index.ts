import { notificationApi } from '@/store/apis/notificationsApi';

export const {
  useAddNotificationTokenMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useClearNotificationsMutation,
} = notificationApi;
