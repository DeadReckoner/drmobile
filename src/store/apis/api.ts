import { Env } from '@/constants/Env';
import i18nConfig from '@/lib/localization/i18nConfig';
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { setAuthUserAction } from '@/store/slices/authSlice';
import { showToastAction } from '@/store/slices/toastSlice';
import { PlanLimitError } from '@/store/types/billing.types';
import { RootStateType } from '@/store/types/store.types';
import { isTokenError, refreshUserSession } from '@/utils/auth.utils';
import {
  BaseQueryApi,
  createApi,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';

export const ApiCacheTags = Object.freeze({
  Roadmaps: 'Roadmaps',
  Friends: 'Friends',
  BlockedUsers: 'BlockedUsers',
  Threads: 'Threads',
  Tasks: 'Tasks',
  AnchorRequests: 'AnchorRequests',
  Notifications: 'Notifications',
  FriendsRequests: 'FriendsRequests',
  Habits: 'Habits',
  Billing: 'Billing',
  NotificationSettings: 'NotificationSettings',
  NotificationOverrides: 'NotificationOverrides',
});

const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: `${Env.EXPO_PUBLIC_API_URL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootStateType).auth.user.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

export const createBaseQueryWithReauth = () => {
  return async (
    args: FetchArgs | string,
    apiQuery: BaseQueryApi,
    extraOptions: object,
  ) => {
    const result = await baseQueryWithReauth(args, apiQuery, extraOptions);

    const errorData = result?.error?.data as unknown;
    const status =
      typeof result?.error?.status === 'number' ? result.error.status : 0;
    const hasTokenError = isTokenError(status, errorData);

    // Handle plan/limit errors (402) separately to avoid logging users out on session expiration (401)
    if (status === 402) {
      const planError = errorData as Partial<PlanLimitError> | undefined;
      if (planError?.feature) {
        apiQuery.dispatch({
          type: 'billing/setPaywallTrigger',
          payload: {
            feature: planError.feature,
            limit: planError.limit ?? 0,
            current: planError.current ?? 0,
          },
        });
      }
      return result;
    }

    if (hasTokenError) {
      try {
        const newSession = await refreshUserSession();

        if (newSession?.access_token) {
          const currentUser = (apiQuery.getState() as RootStateType).auth.user;
          apiQuery.dispatch(
            setAuthUserAction({
              ...currentUser,
              access_token: newSession.access_token,
            }),
          );

          const retryResult = await baseQueryWithReauth(
            args,
            apiQuery,
            extraOptions,
          );
          return retryResult;
        }
      } catch {}
      apiQuery.dispatch(api.util.resetApiState());
      apiQuery.dispatch(
        showToastAction({
          toastProps: {
            type: 'failure',
            message: i18nConfig.t('authentication.errors.session_expired'),
          },
        }),
      );
      supabaseClient.auth
        .signOut()
        .then(() => {})
        .catch(() => {});
    }

    return result;
  };
};

export const api = createApi({
  baseQuery: createBaseQueryWithReauth(),
  tagTypes: [...Object.values(ApiCacheTags)],
  endpoints: () => ({}),
  keepUnusedDataFor: 3600,
  refetchOnReconnect: true,
});
