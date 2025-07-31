import AppButton from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { router } from 'expo-router';
import React from 'react';

interface HeaderWithBackProps {
  headerKey?: TranslationKeysType;
  onBackPress?: () => void;
  onHeaderTitlePress?: () => void;
}

export const HeaderWithBack = ({
  headerKey,
  onBackPress,
  onHeaderTitlePress,
}: HeaderWithBackProps) => {
  const onBackArrowPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <AppView row gap-16>
      <AppButton center onPress={onBackArrowPress}>
        <AppIcon name="arrowleft" size={28} />
      </AppButton>
      {!!headerKey && (
        <AppButton
          center
          disabled={!onHeaderTitlePress}
          onPress={onHeaderTitlePress}>
          <TranslatedText subtitle1 translationKey={headerKey} />
        </AppButton>
      )}
    </AppView>
  );
};
