import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useMilestoneForm } from '@/hooks/roadmap/useMilestoneForm';
import { router } from 'expo-router';

const CreateMilestoneForm = () => {
  const { handleBlur, handleChange, touched, errors, handleSubmit } =
    useMilestoneForm({
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
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.milestone_desc_label"
        placeholderKey="tabs.create_tab.milestone_desc_placeholder"
        onChangeText={handleChange('milestoneDescription')}
        onBlur={handleBlur('milestoneDescription')}
        error={touched.milestoneDescription && errors.milestoneDescription}
      />
      <PrimaryButton
        label="tabs.create_tab.add_new_milestone"
        onPress={handleSubmit}
      />
    </AppView>
  );
};

export default CreateMilestoneForm;
