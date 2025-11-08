import {
  ApiResponse,
  FriendProfileResponse,
  FriendResponse,
  Friendship,
  MessageResponse,
  UserSearchResult,
} from '@/hooks/friends/types/friends.types';
import { api } from '@/store/apis/api';

export const friendsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<UserSearchResult[], string>({
      query: (email) => ({
        url: '/friends/search',
        method: 'GET',
        params: { email },
      }),
      providesTags: ['Friends'],
    }),

    getPendingFriendRequests: builder.query<ApiResponse<Friendship[]>, void>({
      query: () => ({
        url: '/friends/requests',
        method: 'GET',
      }),
      providesTags: ['Friends'],
    }),

    sendFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (userId) => ({
        url: `/friends/request/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Friends'],
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
      invalidatesTags: ['Friends'],
    }),

    acceptFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (friendshipId) => ({
        url: `/friends/${friendshipId}`,
        method: 'PATCH',
        body: { status: 'accepted' },
      }),
      invalidatesTags: ['Friends'],
    }),

    rejectFriendRequest: builder.mutation<ApiResponse<Friendship>, string>({
      query: (friendshipId) => ({
        url: `/friends/${friendshipId}`,
        method: 'PATCH',
        body: { status: 'rejected' },
      }),
      invalidatesTags: ['Friends'],
    }),

    removeFriend: builder.mutation<MessageResponse, string>({
      query: (friendId) => ({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friends'],
    }),

    getFriends: builder.query<ApiResponse<FriendResponse[]>, void>({
      query: () => ({
        url: '/friends',
        method: 'GET',
      }),
      providesTags: ['Friends'],
    }),

    getFriendProfile: builder.query<ApiResponse<FriendProfileResponse>, string>(
      {
        query: (friendId) => ({
          url: `/friends/${friendId}/profile`,
          method: 'GET',
        }),
        providesTags: (_result, _error, friendId) => [
          { type: 'Friends', id: friendId },
        ],
      },
    ),
  }),
  overrideExisting: true,
});

export const {
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
