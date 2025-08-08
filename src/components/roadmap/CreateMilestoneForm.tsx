import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useMilestoneForm } from '@/hooks/roadmap/useMilestoneForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';

export const CreateMilestoneForm = ({ mode }: { mode: FormEditModeType }) => {
  const { showToast } = useToast();
  const { t } = useLocalization();

  const { handleBlur, handleChange, touched, errors, handleSubmit, values } =
    useMilestoneForm({
      mode,
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t(
            mode === 'create'
              ? 'common.created_successfully'
              : 'common.updated_successfully',
          ),
        });
        router.back();
      },
    });
  return (
    <AppView>
      <TranslatedTextInput
        labelKey="tabs.create_tab.milestone_name_label"
        placeholderKey="tabs.create_tab.milestone_name_placeholder"
        onChangeText={handleChange('milestoneName')}
        onBlur={handleBlur('milestoneName')}
        error={touched.milestoneName && errors.milestoneName}
        value={values.milestoneName}
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.milestone_desc_label"
        placeholderKey="tabs.create_tab.milestone_desc_placeholder"
        onChangeText={handleChange('milestoneDescription')}
        onBlur={handleBlur('milestoneDescription')}
        error={touched.milestoneDescription && errors.milestoneDescription}
        value={values.milestoneDescription}
      />
      <PrimaryButton
        label={
          mode === 'create'
            ? 'tabs.create_tab.add_new_milestone'
            : 'tabs.create_tab.update_milestone'
        }
        onPress={handleSubmit}
      />
    </AppView>
  );
};
