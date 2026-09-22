import { userApi } from '@/store/apis/userApi';

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMyProfileQuery,
  useGetUserStatsQuery,
  useUpdateUserWithImageMutation,
  useDeleteUserImageMutation,
} = userApi;
