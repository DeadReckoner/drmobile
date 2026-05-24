import { ENTITLEMENT_ID, OFFERING_ID } from '@/constants/iap';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  clearProEntitlement,
  setLastChecked,
  setProEntitlement,
} from '@/store/slices/settingsSlice';
import type { IapStateType } from '@/store/types/settingsSlice.types';
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
      await Purchases.invalidateCustomerInfoCache();
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

      if (entitlement) {
        let priceString: string | null = null;
        let planCycle: IapStateType['planCycle'] = null;

        try {
          const offerings = await Purchases.getOfferings();
          const offering =
            OFFERING_ID === 'default'
              ? offerings.current
              : offerings.all[OFFERING_ID];
          if (offering) {
            const matchingPkg = offering.availablePackages.find(
              (p) => p.product.identifier === entitlement.identifier,
            );
            if (matchingPkg) {
              priceString = matchingPkg.product.priceString;
              planCycle = matchingPkg.packageType;
            }
          }
        } catch {
          // Non-critical — price/cycle will be null if offerings fetch fails
        }

        dispatch(
          setProEntitlement({
            isProUser: true,
            activeProductId: entitlement.productIdentifier,
            expirationDate: entitlement.expirationDate ?? null,
            priceString,
            planCycle,
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
