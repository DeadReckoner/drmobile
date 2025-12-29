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
import { useAddEditCustomRoadmapForm } from '@/hooks/roadmap/useAddEditCustomRoadmapForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftRoadmap,
  selectDraftSlice,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { StyleSheet } from 'react-native';

interface AddEditCustomRoadmapFormProps {
  mode: FormEditModeType;
  onSuccess?: () => void;
}

export const AddEditCustomRoadmapForm = ({
  mode,
  onSuccess,
}: AddEditCustomRoadmapFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();
  const roadmap = useAppSelector(selectDraftRoadmap);
  const dispatch = useAppDispatch();
  const [updateRoadmap, { isLoading: isUpdatingRoadmap }] =
    useUpdateRoadmapMutation();
  const selectedDraft = useAppSelector(selectDraftSlice);

  const onRoadmapUpdateSuccess = () => {
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

  const onUpdateRoadmap = async (updatedRoadmapProperties: FormRoadmapType) => {
    try {
      await updateRoadmap({
        roadmap_id: roadmap.roadmap_id,
        ...updatedRoadmapProperties,
      }).unwrap();
      onRoadmapUpdateSuccess();
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const onCreateRoadmap = async (updatedRoadmapProperties: FormRoadmapType) => {
    dispatch(
      setDraftRoadmapAction({ ...roadmap, ...updatedRoadmapProperties }),
    );
    onRoadmapUpdateSuccess();
  };

  const onValidRoadmapFormSubmit = async (
    updatedRoadmapProperties: FormRoadmapType,
  ) => {
    if (selectedDraft.shouldSyncWithServer && mode === 'edit') {
      await onUpdateRoadmap(updatedRoadmapProperties);
      return;
    }
    onCreateRoadmap(updatedRoadmapProperties);
  };

  const {
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    values,
  } = useAddEditCustomRoadmapForm({
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
      editable={false}
      reduceOpacityWhenDisabled={false}
    />
  );

  return (
    <AppView marginT-24 pointerEvents={isUpdatingRoadmap ? 'none' : 'auto'}>
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_name_label"
        placeholderKey="tabs.create_tab.goal_name_placeholder"
        onChangeText={handleChange('goal')}
        onBlur={handleBlur('goal')}
        error={touched.goal && errors.goal}
        value={values.goal}
        multiline
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.goal_description_placeholder"
        placeholderKey="tabs.create_tab.goal_description_placeholder"
        onChangeText={handleChange('goalDescription')}
        onBlur={handleBlur('goalDescription')}
        error={touched.goalDescription && errors.goalDescription}
        value={values.goalDescription}
        multiline
      />
      <TranslatedTextInput
        labelKey="tabs.create_tab.why_matters_label"
        placeholderKey="tabs.create_tab.why_matters_placeholder"
        onChangeText={handleChange('reason')}
        onBlur={handleBlur('reason')}
        error={touched.reason && errors.reason}
        value={values.reason}
        multiline
      />
      {mode !== 'edit' && (
        <AppDateTimePicker
          style={[StyleSheet.absoluteFillObject]}
          renderInput={renderCustomDateInput}
          mode={'date'}
          minimumDate={DateUtils.createDate().toDate()}
          onChange={onDateChange}
        />
      )}
      <Divider margin-4 />
      <PrimaryButton
        label={
          mode === 'edit'
            ? 'tabs.create_tab.update_roadmap'
            : 'tabs.create_tab.add_milestones'
        }
        shouldShowLoader
        isLoading={isUpdatingRoadmap}
        onPress={handleSubmit}
      />
      <Divider />
    </AppView>
  );
};
