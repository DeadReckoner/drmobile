import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppDateTimePicker } from '@/components/AppDateTimePicker';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedTextInput } from '@/components/TranslatedTextInput';
import { AppText, AppTouchableOpacity, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useStandaloneTaskForm } from '@/hooks/roadmap/useStandaloneTaskForm';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { RecurrenceType } from '@/store/apis/types/habitsApi.types';
import { DateUtils } from '@/utils/date.utils';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface CreateHabitTaskFormProps {
  mode: FormEditModeType;
  onSuccess?: () => void;
}

export const CreateHabitTaskForm = ({
  mode,
  onSuccess,
}: CreateHabitTaskFormProps) => {
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
  const [isDaysModalOpen, setIsDaysModalOpen] = useState(false);

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
    isLoading,
    handleBlur,
    handleChange,
    touched,
    errors,
    handleSubmit,
    values,
    setFieldValue,
  } = useStandaloneTaskForm({
    mode,
    onSuccess: onFormSuccess,
  });

  const onDateChange = (type: 'startDate' | 'endDate', date: Date) => {
    if (type === 'startDate') {
      setFieldValue('endDate', '');
    }
    setFieldValue(type, date);
  };

  const recurrenceOptions: {
    label: string;
    value: RecurrenceType;
    icon: React.ReactNode;
  }[] = [
    {
      label: t('habits.recurrence.none'),
      value: 'none',
      icon: (
        <AppIcon
          set="Ionicons"
          name="checkbox-outline"
          size={16}
          color={Colors.primary}
        />
      ),
    },
    {
      label: t('habits.recurrence.daily'),
      value: 'daily',
      icon: (
        <AppIcon
          set="Ionicons"
          name="calendar"
          size={16}
          color={Colors.primary}
        />
      ),
    },
    {
      label: t('habits.recurrence.weekly'),
      value: 'weekly',
      icon: (
        <AppIcon
          set="Ionicons"
          name="calendar-outline"
          size={16}
          color={Colors.primary}
        />
      ),
    },
    {
      label: t('habits.recurrence.monthly'),
      value: 'monthly',
      icon: (
        <AppIcon
          set="Ionicons"
          name="calendar-sharp"
          size={16}
          color={Colors.primary}
        />
      ),
    },
  ];

  const getRecurrenceLabel = () => {
    const selected = recurrenceOptions.find(
      (opt) => opt.value === values.recurrenceType,
    );
    return selected?.label || t('habits.select_recurrence');
  };

  const weeklyDaysOptions = [
    {
      label: t('habits.days_option.weekdays'),
      value: 62, // Mon-Fri (2+4+8+16+32)
      icon: (
        <AppIcon
          set="Ionicons"
          name="briefcase-outline"
          size={16}
          color={Colors.primary}
        />
      ),
    },
    {
      label: t('habits.days_option.weekend'),
      value: 65, // Sat-Sun (1+64)
      icon: (
        <AppIcon
          set="Ionicons"
          name="sunny-outline"
          size={16}
          color={Colors.primary}
        />
      ),
    },
    {
      label: t('habits.days_option.everyday'),
      value: 127, // All days (1+2+4+8+16+32+64)
      icon: (
        <AppIcon
          set="Ionicons"
          name="calendar"
          size={16}
          color={Colors.primary}
        />
      ),
    },
  ];

  const getDaysLabel = () => {
    const selected = weeklyDaysOptions.find(
      (opt) => opt.value === values.daysOfWeek,
    );
    return selected?.label || t('habits.select_days');
  };

  return (
    <AppView>
      <TranslatedTextInput
        labelKey="habits.title_label"
        placeholderKey="habits.title_placeholder"
        onChangeText={handleChange('title')}
        onBlur={handleBlur('title')}
        error={touched.title && errors.title}
        value={values.title}
        multiline
      />
      <TranslatedTextInput
        labelKey="habits.description_label"
        placeholderKey="habits.description_placeholder"
        onChangeText={handleChange('description')}
        onBlur={handleBlur('description')}
        error={touched.description && errors.description}
        value={values.description}
        multiline
      />

      {/* Recurrence Type Selector */}
      <AppView marginB-16>
        <AppText body2 textColor marginB-8>
          {t('habits.recurrence_label')}
        </AppText>
        <AppTouchableOpacity
          onPress={() => setIsFrequencyModalOpen(true)}
          style={[
            styles.fieldStyle,
            { borderColor: Colors.secondary, borderWidth: 1 },
          ]}>
          <AppText body2 textColor>
            {getRecurrenceLabel()}
          </AppText>
          <AppIcon
            set="Feather"
            name="chevron-down"
            size={20}
            color={Colors.secondary}
          />
        </AppTouchableOpacity>
        {touched.recurrenceType && errors.recurrenceType && (
          <AppText error sm marginT-8>
            {errors.recurrenceType}
          </AppText>
        )}
      </AppView>

      {/* Show Days Selector only for weekly recurrence */}
      {values.recurrenceType === 'weekly' && (
        <AppView marginB-16>
          <AppText body2 textColor marginB-8>
            {t('habits.weekly_days_label')}
          </AppText>
          <AppTouchableOpacity
            onPress={() => setIsDaysModalOpen(true)}
            style={[
              styles.fieldStyle,
              { borderColor: Colors.secondary, borderWidth: 1 },
            ]}>
            <AppText body2 textColor>
              {getDaysLabel()}
            </AppText>
            <AppIcon
              set="Feather"
              name="chevron-down"
              size={20}
              color={Colors.secondary}
            />
          </AppTouchableOpacity>
          {touched.daysOfWeek && errors.daysOfWeek && (
            <AppText error sm marginT-8>
              {errors.daysOfWeek}
            </AppText>
          )}
        </AppView>
      )}

      {/* Day of Month (for monthly recurrence) */}
      {values.recurrenceType === 'monthly' && (
        <TranslatedTextInput
          labelKey="habits.day_of_month_label"
          placeholderKey="habits.day_of_month_placeholder"
          onChangeText={handleChange('dayOfMonth')}
          onBlur={handleBlur('dayOfMonth')}
          error={touched.dayOfMonth && errors.dayOfMonth}
          value={String(values.dayOfMonth || '')}
          keyboardType="number-pad"
        />
      )}

      {/* Due Date (for one-time todos) */}
      {values.recurrenceType === 'none' && (
        <AppDateTimePicker
          style={[StyleSheet.absoluteFillObject]}
          renderInput={({ value }) => (
            <TranslatedTextInput
              labelKey="habits.due_date_label"
              placeholderKey="habits.select_date"
              onChangeText={handleChange('dueDate')}
              onBlur={handleBlur('dueDate')}
              error={touched.dueDate && errors.dueDate}
              value={value}
              editable={false}
              reduceOpacityWhenDisabled={false}
            />
          )}
          value={
            values.dueDate
              ? DateUtils.createDate(values.dueDate).toDate()
              : undefined
          }
          mode={'date'}
          minimumDate={DateUtils.createDate().toDate()}
          onChange={(date) => setFieldValue('dueDate', date)}
        />
      )}

      {/* Start/End Date (for recurring habits) */}
      {values.recurrenceType !== 'none' && (
        <>
          <AppDateTimePicker
            style={[StyleSheet.absoluteFillObject]}
            renderInput={({ value }) => (
              <TranslatedTextInput
                labelKey="habits.start_date_label"
                placeholderKey="habits.select_date"
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
                labelKey="habits.end_date_label"
                placeholderKey="habits.select_date"
                onChangeText={handleChange('endDate')}
                onBlur={handleBlur('endDate')}
                error={touched.endDate && errors.endDate}
                value={value}
                editable={false}
                reduceOpacityWhenDisabled={false}
              />
            )}
            mode={'date'}
            minimumDate={
              values.startDate
                ? DateUtils.createDate(values.startDate).toDate()
                : DateUtils.createDate().toDate()
            }
            value={
              values.endDate
                ? DateUtils.createDate(values.endDate).toDate()
                : undefined
            }
            onChange={(date) => onDateChange('endDate', date)}
          />
        </>
      )}

      <Divider margin-12 />
      <PrimaryButton
        label={mode === 'edit' ? 'habits.update_habit' : 'habits.create_habit'}
        onPress={handleSubmit}
        shouldShowLoader
        isLoading={isLoading}
      />

      {/* Recurrence Selection Modal */}
      <AppActionSheetModal
        visible={isFrequencyModalOpen}
        title={t('habits.select_recurrence')}
        onDismiss={() => setIsFrequencyModalOpen(false)}
        options={recurrenceOptions.map((option) => ({
          label: option.label,
          icon: option.icon,
          onPress: () => {
            setFieldValue('recurrenceType', option.value);
            setIsFrequencyModalOpen(false);
          },
        }))}
      />

      {/* Days of Week Selection Modal */}
      <AppActionSheetModal
        visible={isDaysModalOpen}
        title={t('habits.select_days')}
        onDismiss={() => setIsDaysModalOpen(false)}
        options={weeklyDaysOptions.map((option) => ({
          label: option.label,
          icon: option.icon,
          onPress: () => {
            setFieldValue('daysOfWeek', option.value);
            setIsDaysModalOpen(false);
          },
        }))}
      />
    </AppView>
  );
};

const styles = StyleSheet.create({
  fieldStyle: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
