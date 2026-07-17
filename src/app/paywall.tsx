import { PaywallContent } from '@/components/paywall/PaywallContent';
import { FeatureKeyType } from '@/store/types/billing.types';
import { useLocalSearchParams } from 'expo-router';

const PaywallScreen = () => {
  const { feature, message } = useLocalSearchParams<{
    feature?: FeatureKeyType;
    message?: string;
  }>();
  return <PaywallContent feature={feature} message={message} />;
};

export default PaywallScreen;
