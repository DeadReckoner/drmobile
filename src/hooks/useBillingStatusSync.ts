import { billingApi } from '@/store/apis/billingApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { useCallback, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/** Delay (ms) before the post-purchase reconciliation refetch (webhook lag). */
const POST_PURCHASE_REFETCH_DELAY = 5000;

/**
 * Keeps the backend's authoritative `/billing/status` in sync (the source of
 * truth for plan + limits + usage). See BILLING_INTEGRATION_PLAN.md Phase 5.
 *
 * - `refetchBillingStatus()` — fetch now (no-op when logged out).
 * - `refetchBillingStatusAfterDelay()` — fetch now + again after ~5s, to catch
 *   the RevenueCat webhook landing on the backend after a purchase/restore.
 *
 * When `register` is true (mount once at the app root), also refetches on mount
 * and whenever the app returns to the foreground.
 */
export const useBillingStatusSync = ({ register = false } = {}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userId = user?.id;

  const refetchBillingStatus = useCallback(() => {
    if (!userId) return;
    dispatch(
      billingApi.endpoints.getBillingStatus.initiate(undefined, {
        forceRefetch: true,
      }),
    );
  }, [dispatch, userId]);

  const refetchBillingStatusAfterDelay = useCallback(() => {
    refetchBillingStatus();
    setTimeout(refetchBillingStatus, POST_PURCHASE_REFETCH_DELAY);
  }, [refetchBillingStatus]);

  useEffect(() => {
    if (!register) return;
    refetchBillingStatus();
  }, [register, refetchBillingStatus]);

  useEffect(() => {
    if (!register) return;
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') refetchBillingStatus();
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [register, refetchBillingStatus]);

  return { refetchBillingStatus, refetchBillingStatusAfterDelay };
};
