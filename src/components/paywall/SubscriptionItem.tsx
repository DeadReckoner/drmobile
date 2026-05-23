import { AppText, AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface SubscriptionItemProps {
  isSelected?: boolean;
  subscription: {
    id: string;
    title: string;
    price: string;
  };
}

export const SubscriptionItem = ({
  subscription,
  isSelected,
}: SubscriptionItemProps) => {
  return (
    <AppView
      key={subscription.id}
      flex
      style={[
        styles.subscriptionItem,
        styles.subscriptionShadow,
        {
          borderWidth: 2,
          borderColor: isSelected ? Colors.blue : Colors.outline,
          shadowColor: isSelected ? Colors.blue : Colors.outline,
          shadowOpacity: isSelected ? 0.5 : 0,
        },
      ]}>
      <AppText body2 textColor>
        {subscription.title}
      </AppText>
      <AppText body1 textColor>
        {subscription.price}
      </AppText>
    </AppView>
  );
};

const styles = StyleSheet.create({
  subscriptionItem: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  subscriptionShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
});
