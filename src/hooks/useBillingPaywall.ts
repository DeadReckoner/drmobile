import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  clearPaywallTrigger,
  selectPaywallTrigger,
} from '@/store/slices/billingSlice';
import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Bridges the billing slice's `paywallTrigger` (set by the 402 interceptor) to
 * navigation — opens the paywall with the offending `feature` so the screen can
 * render the matching headline. Mount once at the app root.
 *
 * Navigation can't happen inside a reducer, so this hook does it as a side
 * effect when the trigger appears, then clears it.
 */
export const useBillingPaywall = () => {
  const dispatch = useAppDispatch();
  const trigger = useAppSelector(selectPaywallTrigger);

  useEffect(() => {
    if (!trigger) return;
    router.navigate({
      pathname: '/paywall',
      params: {
        feature: trigger.feature,
        ...(trigger.message ? { message: trigger.message } : {}),
      },
    });
    dispatch(clearPaywallTrigger());
  }, [trigger, dispatch]);
};
