import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { useUpdateRoadmapMutation } from '@/hooks/roadmap';
import type {
  FormEditModeType,
  FormRoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useCreateCustomRoadmapForm } from '@/hooks/roadmap/useCreateCustomRoadmapForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import { StyleSheet } from 'react-native';

interface CreateCustomRoadmapFormProps {
  mode: FormEditModeType;
  onSuccess?: () => void;
}

export const CreateCustomRoadmapForm = ({
  mode,
  onSuccess,
}: CreateCustomRoadmapFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();
  const roadmap = useAppSelector(selectDraftRoadmap);
  const [updateRoadmap, { isLoading }] = useUpdateRoadmapMutation();

  const onRoadmapUpdate = () => {
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

  const onValidRoadmapFormSubmit = async (
    updatedRoadmapProperties: FormRoadmapType,
  ) => {
    if (mode === 'edit') {
      try {
        await updateRoadmap({
          roadmap_id: roadmap.roadmap_id,
          ...updatedRoadmapProperties,
        }).unwrap();
        onRoadmapUpdate();
      } catch {
        showToast({
          type: 'failure',
          message: t('common.something_went_wrong'),
        });
      }
    } else {
      //TODO: create roadmap
    }
  };

  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    values,
  } = useCreateCustomRoadmapForm({
    mode,
    onSuccess: onValidRoadmapFormSubmit,
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
    <AppView marginT-24 pointerEvents={isLoading ? 'none' : 'auto'}>
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_name_label"
        placeholderKey="tabs.create_tab.goal_name_placeholder"
        onChangeText={handleChange('goal')}
        onBlur={handleBlur('goal')}
        error={touched.goal && errors.goal}
        value={values.goal}
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_description_placeholder"
        placeholderKey="tabs.create_tab.goal_description_placeholder"
        onChangeText={handleChange('goalDescription')}
        onBlur={handleBlur('goalDescription')}
        error={touched.goalDescription && errors.goalDescription}
        value={values.goalDescription}
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.why_matters_label"
        placeholderKey="tabs.create_tab.why_matters_placeholder"
        onChangeText={handleChange('reason')}
        onBlur={handleBlur('reason')}
        error={touched.reason && errors.reason}
        value={values.reason}
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
        label={
          mode === 'edit'
            ? 'tabs.create_tab.update_roadmap'
            : 'tabs.create_tab.create_roadmap_button'
        }
        shouldShowLoader
        isLoading={isLoading}
        onPress={handleSubmit}
      />
      <Divider />
    </AppView>
  );
};
