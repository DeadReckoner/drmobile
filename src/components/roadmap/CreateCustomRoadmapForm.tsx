import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import type { FormRoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useCreateCustomRoadmapForm } from '@/hooks/roadmap/useCreateCustomRoadmapForm';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setMetaAction } from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

export const CreateCustomRoadmapForm = () => {
  const dispatch = useAppDispatch();

  const onSuccessCreateCustomRooadmap = (roadmap: FormRoadmapType) => {
    dispatch(setMetaAction(roadmap));
    router.navigate('/(protected)/roadmap/roadmap-details');
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
