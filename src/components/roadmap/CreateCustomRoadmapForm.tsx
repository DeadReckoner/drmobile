import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import type { FormRoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useCreateCustomRoadmapForm } from '@/hooks/roadmap/useCreateCustomRoadmapForm';
import { useDraftRoadmapBuilder } from '@/hooks/roadmap/useDraftRoadmapBuilder';
import { DateUtils } from '@/utils/date.utils';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const CreateCustomRoadmapForm = () => {
  const { setRoadmapMetadata } = useDraftRoadmapBuilder();

  const onSuccessCreateCustomRooadmap = (roadmap: FormRoadmapType) => {
    setRoadmapMetadata(roadmap);
    router.navigate('/(protected)/task/add-task');
  };

  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useCreateCustomRoadmapForm({
    onSuccess: onSuccessCreateCustomRooadmap,
  });

  const onDateChange = (date: Date) => {
    setFieldValue('targetDate', date);
  };

  const renderCustomDateInput = ({ value }: { value?: string }) => (
    <TranslatedTextInput
      editable={false}
      labelKey="tabs.create_tab.target_completion_date_label"
      placeholderKey="tabs.create_tab.target_completion_date_placeholder"
      onChangeText={handleChange('targetDate')}
      onBlur={handleBlur('targetDate')}
      error={touched.targetDate && errors.targetDate}
      value={value}
    />
  );

  return (
    <AppView marginT-24>
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_name_label"
        placeholderKey="tabs.create_tab.goal_name_placeholder"
        onChangeText={handleChange('goal')}
        onBlur={handleBlur('goal')}
        error={touched.goal && errors.goal}
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_description_placeholder"
        placeholderKey="tabs.create_tab.goal_description_placeholder"
        onChangeText={handleChange('goalDescription')}
        onBlur={handleBlur('goalDescription')}
        error={touched.goalDescription && errors.goalDescription}
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.why_matters_label"
        placeholderKey="tabs.create_tab.why_matters_placeholder"
        onChangeText={handleChange('reason')}
        onBlur={handleBlur('reason')}
        error={touched.reason && errors.reason}
      />
      <AppDateTimePicker
        style={[StyleSheet.absoluteFillObject]}
        renderInput={renderCustomDateInput}
        mode={'date'}
        minimumDate={DateUtils.createDate().toDate()}
        onChange={onDateChange}
      />
      <Divider margin-4 />
      <PrimaryButton
        label="tabs.create_tab.create_roadmap_button"
        onPress={handleSubmit}
      />
      <Divider />
    </AppView>
  );
};

export default CreateCustomRoadmapForm;
