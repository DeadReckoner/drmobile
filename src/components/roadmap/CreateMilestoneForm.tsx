import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useMilestoneForm } from '@/hooks/roadmap/useMilestoneForm';
import { router } from 'expo-router';

export const CreateMilestoneForm = ({ mode }: { mode: FormEditModeType }) => {
  const { handleBlur, handleChange, touched, errors, handleSubmit, values } =
    useMilestoneForm({
      mode,
      onSuccess: () => {
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
        label="tabs.create_tab.add_new_milestone"
        onPress={handleSubmit}
      />
    </AppView>
  );
};
