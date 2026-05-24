import { api } from '@/store/apis/api';
import {
  AddNotificationTokenPayload,
  AddNotificationTokenResponse,
  NotificationType,
  RemoveNotificationTokenPayload,
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
    removeNotificationToken: builder.mutation<
      void,
      RemoveNotificationTokenPayload
    >({
      query: (tokenPayload) => {
        return {
          url: `/push/tokens/${tokenPayload.expo_token}`,
          method: 'DELETE',
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
    clearNotifications: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch {
          dispatch(notificationApi.util.invalidateTags(['Notifications']));
        } finally {
          dispatch(
            notificationApi.util.updateQueryData(
              'getNotifications',
              undefined,
              () => [],
            ),
          );
        }
      },
    }),
  }),
  overrideExisting: false,
});
