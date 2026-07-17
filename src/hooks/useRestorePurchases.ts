import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setIapError, setIapLoading } from '@/store/slices/settingsSlice';
import { useCallback, useState } from 'react';
import Purchases, { type PurchasesError } from 'react-native-purchases';
import { useBillingStatusSync } from './useBillingStatusSync';
import { useEntitlementCheck } from './useEntitlementCheck';

/**
 * Hook that handles restoring previous purchases through RevenueCat.
 *
 * - Sets loading state during the restore call.
 * - Re-checks entitlements after a successful restore.
 * - Returns `true` only when the user actually has an active Pro entitlement
 *   after the restore (not just when the API call succeeds).
 * - Returns `false` when nothing is found to restore (no purchases on record).
 * - Gracefully handles errors by dispatching them to Redux.
 *
 * @returns `restorePurchases` and `isRestoring` boolean.
 */
export const useRestorePurchases = () => {
  const dispatch = useAppDispatch();
  const { checkEntitlementStatus } = useEntitlementCheck();
  const { verifyBillingPlan } = useBillingStatusSync();

  const [isRestoring, setIsRestoring] = useState(false);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    dispatch(setIapLoading(true));
    setIsRestoring(true);
    dispatch(setIapError(null));

    try {
      await Purchases.restorePurchases();
      const isNowPro = await checkEntitlementStatus();

      if (!isNowPro) return false;

      const serverConfirmed = await verifyBillingPlan();
      if (!serverConfirmed) {
        dispatch(
          setIapError(
            'Your purchase was restored but could not be verified. Please try again or contact support.',
          ),
        );
      }

      return serverConfirmed;
    } catch (e) {
      const error = e as PurchasesError;
      dispatch(setIapError(error.message ?? 'Restore failed'));
      return false;
    } finally {
      dispatch(setIapLoading(false));
      setIsRestoring(false);
    }
  }, [dispatch, checkEntitlementStatus, verifyBillingPlan]);

  return { restorePurchases, isRestoring };
};
