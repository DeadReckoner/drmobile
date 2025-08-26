import { api } from '@/store/apis/api';

type UserParams = {
  first_name: string;
  last_name: string;
  email: string;
  user_id?: string;
};

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<UserParams, UserParams>({
      query: (user: UserParams) => {
        return {
          url: `/user`,
          method: 'POST',
          body: user,
        };
      },
    }),
  }),
  overrideExisting: true,
});
