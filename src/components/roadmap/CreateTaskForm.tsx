import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useTaskForm } from '@/hooks/roadmap/useTaskForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';

export const CreateTaskForm = ({ mode }: { mode: FormEditModeType }) => {
  const { showToast } = useToast();
  const { t } = useLocalization();

  const onSuccess = () => {
    showToast({
      type: 'success',
      message: t(
        mode === 'create'
          ? 'common.created_successfully'
          : 'common.updated_successfully',
      ),
    });
    router.back();
  };

  const { handleBlur, handleChange, touched, errors, handleSubmit, values } =
    useTaskForm({
      mode,
      onSuccess,
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
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.task_desc_label"
        placeholderKey="tabs.create_tab.task_desc_placeholder"
        onChangeText={handleChange('taskDescription')}
        onBlur={handleBlur('taskDescription')}
        error={touched.taskDescription && errors.taskDescription}
        value={values.taskDescription}
      />
      <PrimaryButton
        label={
          mode === 'edit'
            ? 'tabs.create_tab.update_task'
            : 'tabs.create_tab.add_new_task'
        }
        onPress={handleSubmit}
      />
    </AppView>
  );
};
