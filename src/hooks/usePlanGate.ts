import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectBillingLimits,
  selectBillingUsage,
  selectIsPro,
} from '@/store/slices/billingSlice';
import {
  BillingLimits,
  BillingUsage,
  FeatureKeyType,
} from '@/store/types/billing.types';
import { useCallback, useMemo } from 'react';

/** Features that map to a numeric limit in `/billing/status`. */
const LIMIT_KEY: Partial<Record<FeatureKeyType, keyof BillingLimits>> = {
  active_roadmaps: 'active_roadmaps',
  active_habits: 'active_habits',
  roadmap_anchors: 'anchors_per_roadmap',
  ai_generations_per_month: 'ai_generations_per_month',
};

/** Features whose current usage is reported in `/billing/status`. */
const USAGE_KEY: Partial<Record<FeatureKeyType, keyof BillingUsage>> = {
  active_roadmaps: 'active_roadmaps',
  active_habits: 'active_habits',
  ai_generations_per_month: 'ai_generations_this_period',
};

const UNLIMITED = -1;

/**
 * Central helper for proactive plan gating (BILLING_INTEGRATION_PLAN.md Phase 6).
 * Reads the backend-authoritative billing snapshot. The 402 interceptor remains
 * the server-side source of truth; these helpers just let the UI lock/badge an
 * action before the request fires.
 *
 * Note: features without a numeric limit (habit_anchors, archive, and the
 * Step-8 paid-only features) are simply "Pro-only" — blocked whenever the user
 * isn't Pro. When limits haven't loaded yet, gating is permissive and we let
 * the server return a 402.
 */
export const usePlanGate = () => {
  const isPro = useAppSelector(selectIsPro);
  const limits = useAppSelector(selectBillingLimits);
  const usage = useAppSelector(selectBillingUsage);

  const getLimit = useCallback(
    (feature: FeatureKeyType): number | null => {
      const key = LIMIT_KEY[feature];
      if (!key || !limits) return null;
      return limits[key];
    },
    [limits],
  );

  const getUsage = useCallback(
    (feature: FeatureKeyType): number | null => {
      const key = USAGE_KEY[feature];
      if (!key || !usage) return null;
      return usage[key];
    },
    [usage],
  );

  const isUnlimited = useCallback(
    (feature: FeatureKeyType): boolean => getLimit(feature) === UNLIMITED,
    [getLimit],
  );

  const isAtLimit = useCallback(
    (feature: FeatureKeyType): boolean => {
      if (isPro) return false;

      const limit = getLimit(feature);
      // Paid-only boolean feature (no numeric limit) — blocked for free users.
      if (limit === null) return !LIMIT_KEY[feature] ? true : false;
      if (limit === UNLIMITED) return false;

      const used = getUsage(feature) ?? 0;
      return used >= limit;
    },
    [isPro, getLimit, getUsage],
  );

  const remaining = useCallback(
    (feature: FeatureKeyType): number => {
      if (isPro || isUnlimited(feature)) return Infinity;
      const limit = getLimit(feature);
      if (limit === null) return 0;
      return Math.max(0, limit - (getUsage(feature) ?? 0));
    },
    [isPro, isUnlimited, getLimit, getUsage],
  );

  return useMemo(
    () => ({ isPro, getLimit, getUsage, isUnlimited, isAtLimit, remaining }),
    [isPro, getLimit, getUsage, isUnlimited, isAtLimit, remaining],
  );
};
