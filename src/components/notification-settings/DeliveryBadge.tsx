import { AppButton } from '@/components/AppButton';
import { TranslatedText } from '@/components/TranslatedText';
import React from 'react';

interface DeliveryBadgeProps {
  delivery: 'immediate' | 'digest';
  onPress: () => void;
}

export const DeliveryBadge = ({ delivery, onPress }: DeliveryBadgeProps) => {
  return (
    <AppButton bg-accent paddingH-8 paddingV-4 br50 onPress={onPress}>
      <TranslatedText
        sm
        textOnPrimary
        regular
        translationKey={
          delivery === 'immediate'
            ? 'notifications.delivery_immediate'
            : 'notifications.delivery_digest'
        }
      />
    </AppButton>
  );
};
