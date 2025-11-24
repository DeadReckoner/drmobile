import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { JSX } from 'react';
import { StyleSheet } from 'react-native';
import { ViewProps } from 'react-native-ui-lib';

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
  styles?: {
    positive?: ViewProps['style'];
    negative?: ViewProps['style'];
  };
}

export const ConfirmationDialog = ({
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
  styles: propStyles,
}: ConfirmationDialogProps) => {
  return (
    <AppDialog visible={isDialogOpen} onDismiss={onDismiss}>
      <AppCard
        padding-20
        bg-cardBG
        style={{
          padding: 20,
        }}>
        <TranslatedText subtitle2 textColor translationKey={title} />
        <Divider margin-4 />
        <TranslatedText xsm textColor translationKey={subtitle} />
        <Divider margin-12 />
        <AppView row centerV gap-8>
          <AppButton
            bg-primary
            br20
            center
            style={[
              {
                flexShrink: 1,
                flexGrow: 1,
                flexBasis: 'auto',
              },
              propStyles?.negative,
            ]}
            padding-12
            paddingH-10
            onPress={onNegativePress}>
            <AppView row center gap-8>
              <TranslatedText
                caption
                textOnPrimary
                translationKey={negativeText}
              />
              {negativeButtonIcon}
            </AppView>
          </AppButton>

          <AppButton
            br20
            bg-error
            center
            style={[styles.buttonContainer, propStyles?.positive]}
            padding-12
            paddingH-12
            onPress={onPositivePress}>
            <AppView row center gap-8>
              {positiveButtonIcon}
              <TranslatedText caption white translationKey={positiveText} />
            </AppView>
          </AppButton>
        </AppView>
      </AppCard>
    </AppDialog>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: 'auto',
  },
});
