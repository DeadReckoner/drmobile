import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';

interface DeliveryBadgeProps {
  delivery: 'immediate' | 'digest';
  onPress: () => void;
}

export const DeliveryBadge = ({ delivery, onPress }: DeliveryBadgeProps) => {
  const { t } = useLocalization();
  return (
    <AppButton bg-accent paddingH-8 paddingV-4 br50 onPress={onPress}>
      <AppText sm textOnPrimary regular>
        {delivery === 'immediate'
          ? t('notifications.delivery_immediate')
          : t('notifications.delivery_digest')}
      </AppText>
    </AppButton>
  );
};
