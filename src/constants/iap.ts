import { Env } from '@/constants/Env';

// TODO: Replace with your RevenueCat API keys from the RevenueCat dashboard
export const REVENUECAT_API_KEY_IOS = Env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
export const REVENUECAT_API_KEY_ANDROID =
  Env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

export const ENTITLEMENT_ID = 'pro';
export const OFFERING_ID = 'default';

export const PRODUCT_IDS = {
  MONTHLY: 'pro_monthly',
  YEARLY: 'pro_yearly',
} as const;
