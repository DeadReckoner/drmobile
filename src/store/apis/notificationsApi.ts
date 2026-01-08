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
  }),
  overrideExisting: false,
});
