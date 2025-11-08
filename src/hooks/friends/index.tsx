import { friendsApi } from '@/store/apis/friendsApi';

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
