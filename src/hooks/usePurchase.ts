import { syncRevenueCatAttributes } from '@/lib/revenueCat';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { selectUser } from '@/store/slices/authSlice';
import { setIapError, setIapLoading } from '@/store/slices/settingsSlice';
import { useCallback, useState } from 'react';
import Purchases, {
  PURCHASES_ERROR_CODE,
  type PurchasesError,
  type PurchasesPackage,
} from 'react-native-purchases';
import { useEntitlementCheck } from './useEntitlementCheck';

/**
 * Hook that handles the full purchase flow for a given `PurchasesPackage`.
 *
 * - Dispatches loading state before/after the purchase attempt.
 * - Silently ignores user-cancelled purchases (returns false).
 * - Treats PRODUCT_ALREADY_PURCHASED_ERROR as success — re-checks entitlements.
 * - Checks entitlements on success and dispatches the result to Redux.
 *
 * @returns `purchasePackage` — resolves to `true` on success, `false` otherwise.
 */
export const usePurchase = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { checkEntitlementStatus } = useEntitlementCheck();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      dispatch(setIapLoading(true));
      setIsPurchasing(true);
      dispatch(setIapError(null));

      try {
        await syncRevenueCatAttributes({
          name: user.name,
          email: user.email,
        });

        await Purchases.purchasePackage(pkg);
        await checkEntitlementStatus();
        return true;
      } catch (e) {
        const error = e as PurchasesError;

        if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
          // User tapped "Cancel" — not an error, not a success
          return false;
        }

        if (
          error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR
        ) {
          // Already subscribed on this or another account — treat as success
          await checkEntitlementStatus();
          return true;
        }

        dispatch(setIapError(error.message ?? 'Purchase failed'));
        return false;
      } finally {
        dispatch(setIapLoading(false));
        setIsPurchasing(false);
      }
    },
    [dispatch, checkEntitlementStatus, user.name, user.email],
  );

  return { purchasePackage, isPurchasing };
};
