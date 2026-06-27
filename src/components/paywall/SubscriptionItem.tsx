import { AppText, AppView } from '@/components/ui';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface SubscriptionItemProps {
  isSelected?: boolean;
  /** Optional highlight pill (e.g. "Best Value", "Save 50%") shown above the title. */
  badge?: string;
  subscription: {
    id: string;
    title: string;
    price: string;
  };
}

export const SubscriptionItem = ({
  subscription,
  isSelected,
  badge,
}: SubscriptionItemProps) => {
  return (
    <AppView
      key={subscription.id}
      flex
      style={[
        styles.subscriptionItem,
        styles.subscriptionShadow,
        {
          borderColor: isSelected ? Colors.blue : Colors.outline,
          shadowColor: isSelected ? Colors.blue : Colors.outline,
          shadowOpacity: isSelected ? 0.5 : 0,
        },
      ]}>
      {!!badge && (
        <AppView
          style={[styles.badge, { backgroundColor: Colors.badgeCompleted }]}
          paddingH-8
          paddingV-4
          br20>
          <AppText sm semibold style={styles.badgeText}>
            {badge}
          </AppText>
        </AppView>
      )}
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 12,
  },
  badgeText: {
    color: Colors.white,
  },
});
