import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { JSX } from 'react';

interface ConfirmationDialogProps {
  isDialogOpen: boolean;
  title: TranslationKeysType;
  subtitle: TranslationKeysType;
  onPositivePress: () => void;
  onNegativePress: () => void;
  negativeText: TranslationKeysType;
  positiveText: TranslationKeysType;
  onDismiss: () => void;
  negativeButtonIcon?: JSX.Element;
  positiveButtonIcon?: JSX.Element;
}

const ConfirmationDialog = ({
  isDialogOpen,
  title,
  subtitle,
  onPositivePress,
  onNegativePress,
  onDismiss,
  negativeText,
  positiveText,
  negativeButtonIcon,
  positiveButtonIcon,
}: ConfirmationDialogProps) => {
  return (
    <AppDialog visible={isDialogOpen} onDismiss={onDismiss}>
      <AppCard padding-24 bg-cardBG>
        <TranslatedText subtitle2 textColor translationKey={title} />
        <Divider margin-4 />
        <TranslatedText xsm textColor translationKey={subtitle} />
        <Divider margin-12 />
        <AppView row centerV gap-8>
          <AppButton
            row
            bg-primary
            br20
            padding-12
            flex
            center
            onPress={onNegativePress}>
            <TranslatedText
              caption
              textOnPrimary
              translationKey={negativeText}
            />
            <Divider margin-4 />
            {negativeButtonIcon}
          </AppButton>
          <AppButton
            row
            bg-error
            br20
            padding-12
            flex
            center
            onPress={onPositivePress}>
            {positiveButtonIcon}
            <Divider margin-4 />
            <TranslatedText caption white translationKey={positiveText} />
          </AppButton>
        </AppView>
      </AppCard>
    </AppDialog>
  );
};

export default ConfirmationDialog;
