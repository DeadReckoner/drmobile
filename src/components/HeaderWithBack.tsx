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
  arrowStyle?: ViewProps['style'];
}

export const HeaderWithBack = ({
  headerKey,
  headerText,
  onBackPress,
  onHeaderTitlePress,
  goBackOnPress = true,
  arrowStyle,
  ...containerStyles
}: HeaderWithBackProps) => {
  const onBackArrowPress = () => {
    onBackPress?.();
    if (goBackOnPress) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(protected)/(tabs)');
      }
    }
  };

  return (
    <AppView row gap-12 {...containerStyles}>
      <AppButton onPress={onBackArrowPress} style={arrowStyle}>
        <AppIcon set="Ionicons" name="arrow-back-outline" size={28} />
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
