import AppButton from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { router } from 'expo-router';

interface HeaderWithBackProps {
  headerKey?: TranslationKeysType;
  onBackPress?: () => void;
  onHeaderTitlePress?: () => void;
  headerText?: string; //For dynamic title strings
}

export const HeaderWithBack = ({
  headerKey,
  headerText,
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
      {(headerKey || headerText) && (
        <AppButton
          center
          disabled={!onHeaderTitlePress}
          onPress={onHeaderTitlePress}>
          {headerKey ? (
            <TranslatedText subtitle1 translationKey={headerKey} />
          ) : (
            <AppText textColor subtitle1>
              {headerText}
            </AppText>
          )}
        </AppButton>
      )}
    </AppView>
  );
};
