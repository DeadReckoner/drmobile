import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppDialog } from '@/components/AppDialog';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { Colors } from 'react-native-ui-lib';

interface RegenerateDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onUseExisting: () => void;
  onEditInputs: () => void;
}

/**
 * The "Show me different options" confirmation.
 *
 * Three actions, which is why this exists instead of ConfirmationDialog (that
 * one is a two-button component). The copy states plainly that all three current
 * options are replaced — this is a set-level action, not a per-card one.
 */
export const RegenerateDialog = ({
  isOpen,
  onDismiss,
  onUseExisting,
  onEditInputs,
}: RegenerateDialogProps) => (
  <AppDialog visible={isOpen} onDismiss={onDismiss}>
    <AppCard padding-20 bg-cardBG disabled>
      <TranslatedText
        subtitle2
        textColor
        translationKey="goal_discovery.options.regenerate_title"
      />
      <Divider margin-4 />
      <TranslatedText
        xsm
        textColor
        translationKey="goal_discovery.options.regenerate_subtitle"
      />
      <Divider margin-12 />

      <AppButton
        bg-primary
        br20
        center
        padding-12
        onPress={onUseExisting}
        testID="regenerate-use-existing">
        <TranslatedText
          caption
          textOnPrimary
          translationKey="goal_discovery.options.regenerate_use_existing"
        />
      </AppButton>

      <AppView marginT-8>
        <AppButton
          br20
          center
          padding-12
          style={{ borderWidth: 1, borderColor: Colors.secondary }}
          onPress={onEditInputs}
          testID="regenerate-edit-inputs">
          <TranslatedText
            caption
            textColor
            translationKey="goal_discovery.options.regenerate_edit_inputs"
          />
        </AppButton>
      </AppView>

      <AppView marginT-8>
        <AppButton
          br20
          center
          padding-12
          onPress={onDismiss}
          testID="regenerate-cancel">
          <TranslatedText caption textColor translationKey="common.cancel" />
        </AppButton>
      </AppView>
    </AppCard>
  </AppDialog>
);
