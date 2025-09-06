import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useTaskForm } from '@/hooks/roadmap/useTaskForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';

interface CreateTaskFormProps {
  mode: FormEditModeType;
  onSuccess?: () => void;
}

export const CreateTaskForm = ({ mode, onSuccess }: CreateTaskFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();

  const onFormSuccess = () => {
    showToast({
      type: 'success',
      message: t(
        mode === 'create'
          ? 'common.created_successfully'
          : 'common.updated_successfully',
      ),
    });
    onSuccess?.();
  };

  const {
    isLoading,
    handleBlur,
    handleChange,
    touched,
    errors,
    handleSubmit,
    values,
  } = useTaskForm({
    mode,
    onSuccess: onFormSuccess,
  });
  return (
    <AppView>
      <TranslatedTextInput
        labelKey="tabs.create_tab.task_name_label"
        placeholderKey="tabs.create_tab.task_name_placeholder"
        onChangeText={handleChange('taskName')}
        onBlur={handleBlur('taskName')}
        error={touched.taskName && errors.taskName}
        value={values.taskName}
        multiline
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.task_desc_label"
        placeholderKey="tabs.create_tab.task_desc_placeholder"
        onChangeText={handleChange('taskDescription')}
        onBlur={handleBlur('taskDescription')}
        error={touched.taskDescription && errors.taskDescription}
        value={values.taskDescription}
        multiline
      />
      <Divider margin-4 />
      <PrimaryButton
        label={
          mode === 'edit'
            ? 'tabs.create_tab.update_task'
            : 'tabs.create_tab.add_new_task'
        }
        shouldShowLoader
        isLoading={isLoading}
        onPress={handleSubmit}
      />
    </AppView>
  );
};
