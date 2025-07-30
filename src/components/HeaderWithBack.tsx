import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppTouchableOpacity, AppView } from '@/components/ui';
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
      <AppTouchableOpacity center onPress={onBackArrowPress}>
        <AppIcon name="arrowleft" size={28} />
      </AppTouchableOpacity>
      {!!headerKey && (
        <AppTouchableOpacity
          center
          disabled={!onHeaderTitlePress}
          onPress={onHeaderTitlePress}>
          <TranslatedText subtitle1 translationKey={headerKey} />
        </AppTouchableOpacity>
      )}
    </AppView>
  );
};
