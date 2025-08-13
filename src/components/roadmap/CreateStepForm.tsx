import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useStepForm } from '@/hooks/roadmap/useStepForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';

interface CreateStepFormProps {
  mode: FormEditModeType;
  stepDescription?: string;
  stepNumber?: number;
  taskId?: string;
  onSuccess?: () => void;
}

export const CreateStepForm = ({
  mode,
  stepDescription = '',
  stepNumber,
  taskId,
  onSuccess,
}: CreateStepFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();

  const { handleBlur, handleChange, touched, errors, handleSubmit, values } =
    useStepForm({
      mode,
      stepDescription,
      stepNumber,
      taskId,
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t(
            mode === 'create'
              ? 'common.created_successfully'
              : 'common.updated_successfully',
          ),
        });
        onSuccess?.();
      },
    });
  return (
    <AppView>
      <TranslatedTextInput
        labelKey="tabs.create_tab.step_label"
        placeholderKey="tabs.create_tab.step_desc_placeholder"
        onChangeText={handleChange('stepDescription')}
        onBlur={handleBlur('stepDescription')}
        error={touched.stepDescription && errors.stepDescription}
        value={values.stepDescription}
      />
      <PrimaryButton
        label={
          mode === 'edit'
            ? 'tabs.create_tab.update_step'
            : 'tabs.create_tab.add_new_step'
        }
        onPress={handleSubmit}
      />
    </AppView>
  );
};
