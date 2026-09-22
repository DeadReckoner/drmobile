import { api, ApiCacheTags } from '@/store/apis/api';
import { BillingStatusResponse } from '@/store/types/billing.types';

/**
 * Backend billing/plan-gating endpoints. `/billing/status` is the authoritative
 * source of truth for plan + limits + usage (BILLING_API_CONTRACT.md §2).
 */
export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBillingStatus: builder.query<BillingStatusResponse, void>({
      query: () => '/billing/status',
      providesTags: [ApiCacheTags.Billing],
    }),
  }),
  overrideExisting: true,
});

export const { useGetBillingStatusQuery, useLazyGetBillingStatusQuery } =
  billingApi;
