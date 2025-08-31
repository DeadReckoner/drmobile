import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppView } from '@/components/ui';
import { WeekdayIndex, WeekdaySelector } from '@/components/WeekdaySelector';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useStandaloneTaskForm } from '@/hooks/roadmap/useStandaloneTaskForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { DateUtils } from '@/utils/date.utils';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

interface CreateStandaloneTaskFormProps {
  mode: FormEditModeType;
  onSuccess?: () => void;
}

export const CreateStandaloneTaskForm = ({
  mode,
  onSuccess,
}: CreateStandaloneTaskFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [selectedDays, setSelectedDays] = useState<WeekdayIndex[]>([]);

  //TODO: handle standalone task creation
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
    handleBlur,
    handleChange,
    touched,
    errors,
    handleSubmit,
    values,
    setFieldValue,
  } = useStandaloneTaskForm({
    mode,
    selectedDays,
    onSuccess: onFormSuccess,
  });

  const onDateChange = (type: 'startDate' | 'endDate', date: Date) => {
    if (type === 'startDate') {
      setFieldValue('endDate', '');
    }
    setFieldValue(type, date);
  };

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
      <AppDateTimePicker
        style={[StyleSheet.absoluteFillObject]}
        renderInput={({ value }) => (
          <TranslatedTextInput
            labelKey="tabs.create_tab.start_date"
            placeholderKey="tabs.create_tab.select_date"
            onChangeText={handleChange('startDate')}
            onBlur={handleBlur('startDate')}
            error={touched.startDate && errors.startDate}
            value={value}
            editable={false}
            reduceOpacityWhenDisabled={false}
          />
        )}
        value={
          values.startDate
            ? DateUtils.createDate(values.startDate).toDate()
            : undefined
        }
        mode={'date'}
        minimumDate={DateUtils.createDate().toDate()}
        onChange={(date) => onDateChange('startDate', date)}
      />
      <AppDateTimePicker
        style={[StyleSheet.absoluteFillObject]}
        renderInput={({ value }) => (
          <TranslatedTextInput
            labelKey="tabs.create_tab.end_date"
            placeholderKey="tabs.create_tab.select_date"
            onChangeText={handleChange('endDate')}
            onBlur={handleBlur('endDate')}
            error={touched.endDate && errors.endDate}
            value={value}
            editable={false}
            reduceOpacityWhenDisabled={false}
          />
        )}
        mode={'date'}
        minimumDate={DateUtils.createDate(values.endDate).toDate()}
        value={
          values.endDate
            ? DateUtils.createDate(values.endDate).toDate()
            : undefined
        }
        onChange={(date) => onDateChange('endDate', date)}
      />
      <Divider margin-4 />
      <WeekdaySelector
        onDaysChanged={(selectedDays) => setSelectedDays(selectedDays)}
      />
      <Divider margin-12 />
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
