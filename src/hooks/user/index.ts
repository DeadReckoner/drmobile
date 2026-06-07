import { userApi } from '@/store/apis/userApi';

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMyProfileQuery,
  useUpdateUserWithImageMutation,
  useDeleteUserImageMutation,
} = userApi;
