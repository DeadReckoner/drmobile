import { billingApi } from '@/store/apis/billingApi';
import { createAppSelector } from '@/store/hooks/store.hooks';
import {
  BillingLimits,
  BillingSourceType,
  BillingSubStatusType,
  BillingUsage,
  FeatureKeyType,
  PaywallTriggerType,
  PlanType,
} from '@/store/types/billing.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';

type BillingStateType = {
  plan: PlanType;
  source: BillingSourceType | null;
  status: BillingSubStatusType;
  trialEndsAt: string | null;
  renewsAt: string | null;
  productId: string | null;
  limits: BillingLimits | null;
  usage: BillingUsage | null;
  lastFetched: string | null;
  /** Set by the 402 interceptor; consumed by useBillingPaywall to open the modal. */
  paywallTrigger: PaywallTriggerType;
};

const initialState: BillingStateType = {
  plan: 'free',
  source: null,
  status: null,
  trialEndsAt: null,
  renewsAt: null,
  productId: null,
  limits: null,
  usage: null,
  lastFetched: null,
  paywallTrigger: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setPaywallTrigger(
      state,
      action: PayloadAction<NonNullable<PaywallTriggerType>>,
    ) {
      state.paywallTrigger = action.payload;
    },
    clearPaywallTrigger(state) {
      state.paywallTrigger = null;
    },
    resetBillingSlice: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      billingApi.endpoints.getBillingStatus.matchFulfilled,
      (state, { payload }) => {
        state.plan = payload.plan;
        state.source = payload.source;
        state.status = payload.status ?? null;
        state.trialEndsAt = payload.trial_ends_at ?? null;
        state.renewsAt = payload.renews_at ?? null;
        state.productId = payload.product_id ?? null;
        state.limits = payload.limits;
        state.usage = payload.usage;
        state.lastFetched = new Date().toISOString();
      },
    );
  },
});

export const { setPaywallTrigger, clearPaywallTrigger, resetBillingSlice } =
  billingSlice.actions;

export const selectPlan = createAppSelector((state) => state.billing.plan);
export const selectBillingLimits = createAppSelector(
  (state) => state.billing.limits,
);
export const selectBillingUsage = createAppSelector(
  (state) => state.billing.usage,
);
export const selectBillingStatus = createAppSelector(
  (state) => state.billing.status,
);
export const selectTrialEndsAt = createAppSelector(
  (state) => state.billing.trialEndsAt,
);
export const selectRenewsAt = createAppSelector(
  (state) => state.billing.renewsAt,
);
export const selectPaywallTrigger = createAppSelector(
  (state) => state.billing.paywallTrigger,
);
export const selectBillingLastFetched = createAppSelector(
  (state) => state.billing.lastFetched,
);

/**
 * Hybrid Pro flag (BILLING_INTEGRATION_PLAN.md Phase 6). Backend `/billing/status`
 * is authoritative; RevenueCat's optimistic `isProUser` covers the brief window
 * after a purchase before the webhook lands and `/billing/status` is refetched.
 */
export const selectIsPro = createAppSelector(
  (state) => state.billing.plan === 'paid' || state.settings.iap.isProUser,
);

export type { BillingStateType };
export type { FeatureKeyType };

export const billingReducer = persistReducer(
  {
    key: 'billing',
    storage: AsyncStorage,
    // paywallTrigger is ephemeral UI state — never persist it.
    blacklist: ['paywallTrigger'],
  },
  billingSlice.reducer,
);
