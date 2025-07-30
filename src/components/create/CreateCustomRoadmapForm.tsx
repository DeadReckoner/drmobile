import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import React from 'react';

const CreateCustomRoadmapForm = () => {
  return (
    <AppView marginT-16>
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_name_label"
        placeholderKey="tabs.create_tab.goal_name_placeholder"
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_description_placeholder"
        placeholderKey="tabs.create_tab.goal_description_placeholder"
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.why_matters_label"
        placeholderKey="tabs.create_tab.why_matters_placeholder"
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.target_completion_date_label"
        placeholderKey="tabs.create_tab.target_completion_date_placeholder"
      />
      <Divider margin-4 />
      <PrimaryButton
        label="tabs.create_tab.create_roadmap_button"
        onPress={() => {}}
      />
      <Divider />
    </AppView>
  );
};

export default CreateCustomRoadmapForm;
