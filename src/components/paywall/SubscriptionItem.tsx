import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
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
  const isPro = subscription.id === 'paywall.pro_plan';

  return (
    <AppView
      key={subscription.id}
      flex
      style={[
        styles.subscriptionItem,
        styles.subscriptionShadow,
        {
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? Colors.blue : Colors.outline,
          shadowColor: isSelected ? Colors.blue : Colors.outline,
          shadowOpacity: isSelected && isPro ? 0.4 : 0.1,
        },
      ]}>
      <TranslatedText
        body2
        textColor
        translationKey={subscription.id as TranslationKeysType}
      />
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
