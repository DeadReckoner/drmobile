import {
  ApiResponse,
  FriendProfileResponse,
  FriendResponse,
  Friendship,
  MessageResponse,
  UserSearchResult,
} from '@/hooks/friends/types/friends.types';
import { api } from '@/store/apis/api';
import { notificationApi } from '@/store/apis/notificationsApi';
import { setRequestBadgeAction } from '@/store/slices/notificationsSlice';
import { setSetupStepAction } from '@/store/slices/onboardingSlice';

const REQUEST_TYPES = [
  'friend_request',
  'anchor_request',
  'habit_anchor_request',
] as const;

const updateRequestBadge = (dispatch: any, getState: () => unknown) => {
  const updatedNotifications =
    notificationApi.endpoints.getNotifications.select()(getState() as any);
  const hasRemaining =
    updatedNotifications.data?.some((n) =>
      (REQUEST_TYPES as readonly string[]).includes(n.type),
    ) ?? false;
  dispatch(setRequestBadgeAction(hasRemaining));
};

const removeFromNotifications = (dispatch: any, friendshipId: string) => {
  dispatch(
    notificationApi.util.updateQueryData(
      'getNotifications',
      undefined,
      (draft) => {
        const index = draft.findIndex(
          (n) =>
            n.type === 'friend_request' &&
            n.data.friendship_id === friendshipId,
        );
        if (index === -1) return;
        //TODO: re-enable marking as read if backend needs it to remove it from list
        // dispatch(
        //   notificationApi.endpoints.markNotificationAsRead.initiate(
        //     draft[index].notification_id,
        //   ),
        // );
        draft.splice(index, 1);
      },
    ),
  );
};

export const friendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<UserSearchResult[], string>({
      query: (email) => ({
        url: '/friends/search',
        method: 'GET',
        params: { email },
      }),
      providesTags: ['Friends'],
      keepUnusedDataFor: 900,
    }),

    getPendingFriendRequests: builder.query<Friendship[], void>({
      query: () => ({
        url: '/friends/requests',
        method: 'GET',
      }),
      keepUnusedDataFor: 900,
      providesTags: ['FriendsRequests'],
    }),

    sendFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (userId) => ({
        url: `/friends/request/${userId}`,
        method: 'POST',
      }),
      async onQueryStarted(userId, { dispatch, queryFulfilled, getState }) {
        const searchUsersPatchResults: any[] = [];
        const state = getState() as any;
        const searchUsersQueries = state.api.queries;

        Object.keys(searchUsersQueries).forEach((key) => {
          if (key.startsWith('searchUsers(')) {
            const patchResult = dispatch(
              friendsApi.util.updateQueryData(
                'searchUsers',
                searchUsersQueries[key].originalArgs,
                (draft) => {
                  const userIndex = draft.findIndex(
                    (u) => u.user_id === userId,
                  );

                  if (userIndex !== -1) {
                    draft[userIndex].friendship_status = 'pending';
                  }
                },
              ),
            );
            searchUsersPatchResults.push(patchResult);
          }
        });

        try {
          await queryFulfilled;
          dispatch(setSetupStepAction({ key: 'inviteFriend', value: true }));
        } catch {
          searchUsersPatchResults.forEach((patchResult) => {
            patchResult.undo();
          });
        }
      },
    }),

    updateFriendRequestStatus: builder.mutation<
      ApiResponse<Friendship>,
      { friendshipId: string; status: 'accepted' | 'rejected' }
    >({
      query: ({ friendshipId, status }) => ({
        url: `/friends/${friendshipId}`,
        method: 'PATCH',
        body: { status },
      }),
    }),

    acceptFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (friendshipId) => ({
        url: `/friends/${friendshipId}`,
        method: 'PATCH',
        body: { status: 'accepted' },
      }),
      invalidatesTags: ['Friends', 'Threads'],
      async onQueryStarted(
        friendshipId,
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          await queryFulfilled;
          dispatch(
            friendsApi.util.updateQueryData(
              'getPendingFriendRequests',
              undefined,
              (draft) => {
                const index = draft.findIndex(
                  (friendship) => friendship.id === friendshipId,
                );
                if (index !== -1) {
                  draft.splice(index, 1);
                }
              },
            ),
          );
          removeFromNotifications(dispatch, friendshipId);
          updateRequestBadge(dispatch, getState);
        } catch {}
      },
    }),

    rejectFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (friendshipId) => ({
        url: `/friends/${friendshipId}`,
        method: 'PATCH',
        body: { status: 'rejected' },
      }),
      async onQueryStarted(
        friendshipId,
        { dispatch, queryFulfilled, getState },
      ) {
        try {
          await queryFulfilled;
          dispatch(
            friendsApi.util.updateQueryData(
              'getPendingFriendRequests',
              undefined,
              (draft) => {
                const index = draft.findIndex(
                  (friendship) => friendship.id === friendshipId,
                );
                if (index !== -1) {
                  draft.splice(index, 1);
                }
              },
            ),
          );
          removeFromNotifications(dispatch, friendshipId);
          updateRequestBadge(dispatch, getState);
        } catch {}
      },
    }),

    removeFriend: builder.mutation<MessageResponse, string>({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, friendId) => [
        'Friends',
        { type: 'Friends', id: friendId },
      ],
      async onQueryStarted(friendId, { dispatch, queryFulfilled, getState }) {
        const searchUsersPatchResults: any[] = [];
        try {
          await queryFulfilled;
          const state = getState() as any;
          const searchUsersQueries = state.api.queries;

          Object.keys(searchUsersQueries).forEach((key) => {
            if (key.startsWith('searchUsers(')) {
              const patchResult = dispatch(
                friendsApi.util.updateQueryData(
                  'searchUsers',
                  searchUsersQueries[key].originalArgs,
                  (draft) => {
                    const userIndex = draft.findIndex(
                      (u) => u.user_id === friendId,
                    );

                    if (userIndex !== -1) {
                      draft[userIndex].friendship_status = 'none';
                    }
                  },
                ),
              );
              searchUsersPatchResults.push(patchResult);
            }
          });
        } catch {
          searchUsersPatchResults.forEach((patchResult) => {
            patchResult.undo();
          });
        }
      },
    }),

    getFriends: builder.query<FriendResponse[], void>({
      query: () => ({
        url: '/friends',
        method: 'GET',
      }),
      providesTags: ['Friends'],
    }),

    getFriendProfile: builder.query<FriendProfileResponse, string>({
      query: (friendId) => ({
        url: `/friends/${friendId}/profile`,
        method: 'GET',
      }),
      keepUnusedDataFor: 86400,
      providesTags: (_result, _error, friendId) => [
        { type: 'Friends', id: friendId },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetPendingFriendRequestsQuery,
  useSendFriendRequestMutation,
  useUpdateFriendRequestStatusMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
  useGetFriendsQuery,
  useGetFriendProfileQuery,
} = friendsApi;
