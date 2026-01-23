import { api } from '@/store/apis/api';
import {
  AddNotificationTokenPayload,
  AddNotificationTokenResponse,
  NotificationType,
} from '@/store/apis/types/notificationsApi.types';

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addNotificationToken: builder.mutation<
      AddNotificationTokenResponse,
      AddNotificationTokenPayload
    >({
      query: (tokenPayload) => {
        return {
          url: `/push/tokens`,
          method: 'POST',
          body: tokenPayload,
        };
      },
    }),
    getNotifications: builder.query<NotificationType[], void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),
    markNotificationAsRead: builder.mutation<NotificationType, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddNotificationTokenMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = notificationApi;
