import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { JSX } from 'react';
import { Colors } from 'react-native-ui-lib';

interface EmptyListItemPlaceholderProps {
  onPress: () => void;
  title: TranslationKeysType;
  subtitle?: TranslationKeysType;
  btnText: TranslationKeysType;
  btnIcon?: JSX.Element;
}

export const EmptyListItemPlaceholder = ({
  title,
  subtitle,
  btnText,
  onPress,
  btnIcon = <AppIcon name="plus" size={18} color={Colors.white} />,
}: EmptyListItemPlaceholderProps) => {
  return (
    <AppCard paddingV-40>
      <AppView paddingH-16 center>
        <TranslatedText subtitle2 translationKey={title} />
        {!!subtitle && (
          <>
            <Divider />
            <TranslatedText xsm center translationKey={subtitle} />
          </>
        )}
      </AppView>
      <Divider margin-16 />
      <PrimaryButtonContainer row onPress={onPress}>
        {btnIcon}
        <Divider margin-4 />
        <TranslatedText body2 textOnPrimary translationKey={btnText} />
      </PrimaryButtonContainer>
    </AppCard>
  );
};
