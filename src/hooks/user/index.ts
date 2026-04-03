import { userApi } from '@/store/apis/userApi';

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetMyProfileQuery,
} = userApi;
