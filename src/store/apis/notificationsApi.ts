import { api } from '@/store/apis/api';
import {
  AddNotificationTokenPayload,
  AddNotificationTokenResponse,
  NotificationOverrideType,
  NotificationSettingsResponseType,
  NotificationType,
  RemoveNotificationTokenPayload,
  UpdateNotificationSettingsPayloadType,
  UpsertNotificationOverridePayloadType,
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
    getNotificationSettings: builder.query<
      NotificationSettingsResponseType,
      void
    >({
      query: () => '/notification-settings',
      providesTags: ['NotificationSettings'],
    }),
    updateNotificationSettings: builder.mutation<
      NotificationSettingsResponseType,
      UpdateNotificationSettingsPayloadType
    >({
      query: (body) => ({
        url: '/notification-settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),
    getNotificationFriendOverrides: builder.query<
      { data: NotificationOverrideType[] },
      void
    >({
      query: () => '/notification-settings/friends',
      providesTags: ['NotificationOverrides'],
    }),
    upsertFriendNotificationOverride: builder.mutation<
      NotificationOverrideType,
      { friendId: string; payload: UpsertNotificationOverridePayloadType }
    >({
      query: ({ friendId, payload }) => ({
        url: `/notification-settings/friends/${friendId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['NotificationOverrides'],
    }),
    deleteFriendNotificationOverride: builder.mutation<void, string>({
      query: (friendId) => ({
        url: `/notification-settings/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotificationOverrides'],
    }),
    getNotificationAnchoredGoalOverrides: builder.query<
      { data: NotificationOverrideType[] },
      void
    >({
      query: () => '/notification-settings/anchored-goals',
      providesTags: ['NotificationOverrides'],
    }),
    upsertAnchoredGoalNotificationOverride: builder.mutation<
      NotificationOverrideType,
      { roadmapId: string; payload: UpsertNotificationOverridePayloadType }
    >({
      query: ({ roadmapId, payload }) => ({
        url: `/notification-settings/anchored-goals/${roadmapId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['NotificationOverrides'],
    }),
    deleteAnchoredGoalNotificationOverride: builder.mutation<void, string>({
      query: (roadmapId) => ({
        url: `/notification-settings/anchored-goals/${roadmapId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotificationOverrides'],
    }),
  }),
  overrideExisting: false,
});
