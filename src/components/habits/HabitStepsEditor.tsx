import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { LineDivider } from '@/components/LineDivider';
import { ListAddItemIcon } from '@/components/ListAddItemIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { HabitStepDraft } from '@/hooks/habits/useHabitStepsDraft';
import { useLocalization } from '@/hooks/useLocalization';
import { TextField } from 'react-native-ui-lib';

interface HabitStepsEditorProps {
  steps: HabitStepDraft[];
  onAdd: () => void;
  onChange: (_key: string, _description: string) => void;
  onRemove: (_key: string) => void;
  onMove: (_key: string, _direction: -1 | 1) => void;
  disabled?: boolean;
}

/**
 * Editor for a recurring item's step DEFINITIONS.
 *
 * Steps are optional: an item with none keeps the plain single-action
 * completion it has always had, so this section stays empty until the user adds
 * something. It deliberately reuses the same card/divider/add-footer shell as
 * the roadmap StepsList rather than introducing a second layout, but edits text
 * inline because these are being authored alongside the rest of the form rather
 * than navigated to one at a time.
 */
export const HabitStepsEditor = ({
  steps,
  onAdd,
  onChange,
  onRemove,
  onMove,
  disabled,
}: HabitStepsEditorProps) => {
  const { t } = useLocalization();

  return (
    <AppView marginT-8>
      <AppView row centerV spread>
        <TranslatedText body1 translationKey="common.steps" />
        <TranslatedText
          xsm
          secondary
          translationKey="habits.steps.optional_hint"
        />
      </AppView>
      <Divider marginV-8 />

      <AppCard padding-0>
        {steps.length === 0 ? (
          <AppView padding-16>
            <TranslatedText
              body2
              secondary
              translationKey="habits.steps.empty_hint"
            />
          </AppView>
        ) : (
          steps.map((step, index) => (
            <AppView key={step.key}>
              {index > 0 && <LineDivider marginV-0 />}
              <AppView row centerV gap-8 padding-12>
                <AppText body2 secondary>
                  {index + 1}.
                </AppText>
                <AppView flex>
                  <TextField
                    value={step.description}
                    editable={!disabled}
                    placeholder={t('habits.steps.step_placeholder')}
                    onChangeText={(text: string) => onChange(step.key, text)}
                    multiline
                  />
                </AppView>
                <AppButton
                  disabled={disabled || index === 0}
                  onPress={() => onMove(step.key, -1)}>
                  <AppIcon set="Feather" name="chevron-up" size={18} />
                </AppButton>
                <AppButton
                  disabled={disabled || index === steps.length - 1}
                  onPress={() => onMove(step.key, 1)}>
                  <AppIcon set="Feather" name="chevron-down" size={18} />
                </AppButton>
                <AppButton
                  disabled={disabled}
                  onPress={() => onRemove(step.key)}>
                  <AppIcon set="Feather" name="x" size={18} />
                </AppButton>
              </AppView>
            </AppView>
          ))
        )}

        <AppButton disabled={disabled} onPress={onAdd}>
          <LineDivider marginV-0 />
          <AppView row padding-16 centerV gap-16>
            <ListAddItemIcon />
            <TranslatedText body2 translationKey="habits.steps.add_step" />
          </AppView>
        </AppButton>
      </AppCard>
    </AppView>
  );
};
