import { PaywallContent } from '@/components/paywall/PaywallContent';
import { AnalyticsEvent, track } from '@/lib/analytics';
import { FeatureKeyType } from '@/store/types/billing.types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

const PaywallScreen = () => {
  const { feature, message } = useLocalSearchParams<{
    feature?: FeatureKeyType;
    message?: string;
  }>();

  // The top of the revenue funnel. The server sees trials and purchases from
  // the store webhook, but it never learns the paywall was shown — so without
  // this event, paywall-to-trial conversion has no denominator.
  //
  // `feature` is the limit the user hit to get here, which is what makes the
  // event actionable: it says which wall converts and which just annoys.
  useEffect(() => {
    track(AnalyticsEvent.PaywallViewed, {
      ...(feature ? { source_screen: feature } : {}),
    });
  }, [feature]);

  return <PaywallContent feature={feature} message={message} />;
};

export default PaywallScreen;
