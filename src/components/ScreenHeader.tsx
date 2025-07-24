import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { TextProps } from 'react-native-ui-lib';

interface ScreenHeaderProps {
  title: TranslationKeysType;
  subtitle: TranslationKeysType;
  titleProps?: TextProps;
  subtileProps?: TextProps;
}

export const ScreenHeader = ({
  title,
  subtitle,
  titleProps,
  subtileProps,
}: ScreenHeaderProps) => {
  return (
    <AppView marginT-24>
      <TranslatedText
        h2
        marginB-8
        textColor
        translationKey={title}
        {...titleProps}
      />
      <TranslatedText
        captionLight
        textColor
        translationKey={subtitle}
        {...subtileProps}
      />
    </AppView>
  );
};
