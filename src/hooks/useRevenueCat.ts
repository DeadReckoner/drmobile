import { OFFERING_ID } from '@/constants/iap';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectActiveProductId,
  selectIapError,
  selectIapExpirationDate,
  selectIapLoading,
  selectIsProUser,
  setIapError,
  setIapLoading,
} from '@/store/slices/settingsSlice';
import { useCallback, useEffect, useState } from 'react';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { useEntitlementCheck } from './useEntitlementCheck';
import { usePurchase } from './usePurchase';
import { useRestorePurchases } from './useRestorePurchases';

/**
 * Master hook that composes all RevenueCat IAP logic.
 *
 * Fetches the current Offering on mount and exposes purchase, restore, and
 * entitlement-check capabilities alongside the derived Redux state.
 *
 * @returns Full IAP state and action handlers for use in paywall UI.
 */
export const useRevenueCat = () => {
  const dispatch = useAppDispatch();
  const isProUser = useAppSelector(selectIsProUser);
  const isLoading = useAppSelector(selectIapLoading);
  const error = useAppSelector(selectIapError);
  const activeProductId = useAppSelector(selectActiveProductId);
  const expirationDate = useAppSelector(selectIapExpirationDate);

  type SubscriptionPackage = {
    pkg: PurchasesPackage;
    price: string;
  };

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPackage[]>([]);
  const [offeringsError, setOfferingsError] = useState(false);

  const { purchasePackage, isPurchasing } = usePurchase();
  const { restorePurchases, isRestoring } = useRestorePurchases();
  const { checkEntitlementStatus } = useEntitlementCheck();

  const dismissError = useCallback(() => {
    dispatch(setIapError(null));
  }, [dispatch]);

  useEffect(() => {
    dispatch(setIapLoading(false));
    dispatch(setIapError(null));
  }, [dispatch]);

  const fetchOfferings = useCallback(async () => {
    setOfferingsError(false);
    try {
      const offerings = await Purchases.getOfferings();
      const offering =
        OFFERING_ID === 'default'
          ? offerings.current
          : offerings.all[OFFERING_ID];

      if (!offering) return;

      const pkgs = offering.availablePackages;
      setPackages(pkgs);

      const monthly = pkgs.find((p) => p.packageType === 'MONTHLY');
      const yearly = pkgs.find((p) => p.packageType === 'ANNUAL');

      const subs: SubscriptionPackage[] = [];
      if (monthly)
        subs.push({ pkg: monthly, price: monthly.product.priceString });
      if (yearly) subs.push({ pkg: yearly, price: yearly.product.priceString });
      setSubscriptions(subs);
    } catch {
      setOfferingsError(true);
    }
  }, []);

  useEffect(() => {
    fetchOfferings();
  }, [fetchOfferings]);

  return {
    isProUser,
    isLoading,
    error,
    activeProductId,
    expirationDate,
    packages,
    subscriptions,
    offeringsError,
    retryFetchOfferings: fetchOfferings,
    purchasePackage,
    isPurchasing,
    isRestoring,
    restorePurchases,
    checkEntitlementStatus,
    dismissError,
  };
};
