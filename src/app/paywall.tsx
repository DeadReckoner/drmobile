import { PaywallContent } from '@/components/paywall/PaywallContent';
import { FeatureKeyType } from '@/store/types/billing.types';
import { useLocalSearchParams } from 'expo-router';

const PaywallScreen = () => {
  const { feature } = useLocalSearchParams<{ feature?: FeatureKeyType }>();
  return <PaywallContent feature={feature} />;
};

export default PaywallScreen;
