import { ENTITLEMENT_ID } from '@/constants/iap';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  clearProEntitlement,
  setLastChecked,
  setProEntitlement,
} from '@/store/slices/settingsSlice';
import { useCallback } from 'react';
import Purchases from 'react-native-purchases';

/**
 * Hook that checks the current RevenueCat entitlement status and syncs it
 * to Redux.
 *
 * The AppState foreground listener is intentionally NOT registered here to
 * avoid duplicate listeners when the hook is composed into multiple sub-hooks.
 * Register it once at the app root via `useAppForegroundEntitlementCheck`.
 *
 * @returns `checkEntitlementStatus` — call after a purchase or restore.
 *   Resolves to `true` if the user has an active Pro entitlement.
 */
export const useEntitlementCheck = () => {
  const dispatch = useAppDispatch();

  const checkEntitlementStatus = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      if (entitlement) {
        dispatch(
          setProEntitlement({
            isProUser: true,
            activeProductId: entitlement.productIdentifier,
            expirationDate: entitlement.expirationDate ?? null,
          }),
        );
        dispatch(setLastChecked(new Date().toISOString()));
        return true;
      } else {
        dispatch(clearProEntitlement());
        dispatch(setLastChecked(new Date().toISOString()));
        return false;
      }
    } catch {
      // Silently fail — the persisted state will reflect the last known status
      return false;
    }
  }, [dispatch]);

  return { checkEntitlementStatus };
};
