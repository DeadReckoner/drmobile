import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { router } from 'expo-router';
import { ViewProps } from 'react-native-ui-lib';

interface HeaderWithBackProps extends ViewProps {
  headerKey?: TranslationKeysType;
  onBackPress?: () => void;
  onHeaderTitlePress?: () => void;
  headerText?: string; //For dynamic title strings
  goBackOnPress?: boolean;
}

export const HeaderWithBack = ({
  headerKey,
  headerText,
  onBackPress,
  onHeaderTitlePress,
  goBackOnPress = true,
  ...containerStyles
}: HeaderWithBackProps) => {
  const onBackArrowPress = () => {
    onBackPress?.();
    if (goBackOnPress) {
      router.back();
    }
  };

  return (
    <AppView row gap-16 {...containerStyles}>
      <AppButton onPress={onBackArrowPress}>
        <AppIcon name="arrowleft" />
      </AppButton>
      {(headerKey || headerText) && (
        <AppButton
          centerV
          flex-1
          disabled={!onHeaderTitlePress}
          onPress={onHeaderTitlePress}>
          {headerKey ? (
            <TranslatedText body1 translationKey={headerKey} />
          ) : (
            <AppText textColor body1 textBreakStrategy="highQuality">
              {headerText}
            </AppText>
          )}
        </AppButton>
      )}
    </AppView>
  );
};
