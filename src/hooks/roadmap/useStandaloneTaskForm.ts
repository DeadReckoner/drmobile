import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import {
  useCreateHabitMutation,
  useUpdateHabitMutation,
} from '@/store/apis/habitsApi';
import {
  CreateHabitRequestType,
  RecurrenceType,
} from '@/store/apis/types/habitsApi.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedHabit } from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createTaskValidationSchema = (t: (_: TranslationKeysType) => string) => {
  const titleLabel = t('habits.title_label');
  const descLabel = t('habits.description_label');
  const recurrenceLabel = t('habits.recurrence_label');
  const startDateLabel = t('habits.start_date_label');
  const dayOfMonthLabel = t('habits.day_of_month_label');
  const dueDateLabel = t('habits.due_date_label');

  return Yup.object({
    title: Yup.string()
      .label(titleLabel)
      .min(2, isInvalidMessage(titleLabel, t))
      .required(isRequiredMessage(titleLabel, t)),
    description: Yup.string().label(descLabel).optional(),
    recurrenceType: Yup.string()
      .label(recurrenceLabel)
      .oneOf(['none', 'daily', 'weekly', 'monthly'])
      .required(isRequiredMessage(recurrenceLabel, t)),
    daysOfWeek: Yup.number()
      .label(t('habits.weekly_days_label'))
      .when('recurrenceType', {
        is: 'weekly',
        then: (schema) => schema.required(t('habits.weekly_days_required')),
        otherwise: (schema) => schema.optional(),
      }),
    dayOfMonth: Yup.number()
      .label(dayOfMonthLabel)
      .min(1, isInvalidMessage(dayOfMonthLabel, t))
      .max(31, isInvalidMessage(dayOfMonthLabel, t))
      .when('recurrenceType', {
        is: 'monthly',
        then: (schema) =>
          schema.required(isRequiredMessage(dayOfMonthLabel, t)),
        otherwise: (schema) => schema.optional(),
      }),
    dueDate: Yup.string()
      .label(dueDateLabel)
      .when('recurrenceType', {
        is: 'none',
        then: (schema) => schema.required(isRequiredMessage(dueDateLabel, t)),
        otherwise: (schema) => schema.optional(),
      }),
    startDate: Yup.string()
      .label(startDateLabel)
      .when('recurrenceType', {
        is: (value: string) => value !== 'none',
        then: (schema) => schema.required(isRequiredMessage(startDateLabel, t)),
        otherwise: (schema) => schema.optional(),
      }),
    endDate: Yup.string().label(t('habits.end_date_label')).optional(),
  });
};

type TaskSchemaType = Yup.InferType<
  ReturnType<typeof createTaskValidationSchema>
>;

interface TaskFormHookProps {
  mode?: FormEditModeType;
  onSuccess?: () => void;
  onError?: (_error: unknown) => void;
}

export const useStandaloneTaskForm = ({
  mode = 'create',
  onSuccess,
  onError,
}: TaskFormHookProps) => {
  const { t } = useLocalization();
  const schema = createTaskValidationSchema(t);
  const [createHabit, { isLoading: isHabitCreating }] =
    useCreateHabitMutation();
  const [updateHabit, { isLoading: isHabitUpdating }] =
    useUpdateHabitMutation();
  const selectedHabit = useAppSelector(selectSelectedHabit);
  const canEdit = mode === 'edit';

  const onStandaloneTaskSubmit = async (props: TaskSchemaType) => {
    const payload: CreateHabitRequestType = {
      title: props.title,
      description: props.description || '',
      recurrence_type: props.recurrenceType as RecurrenceType,
      start_date: props.startDate || props.dueDate || '',
    };

    if (props.endDate) {
      payload.end_date = props.endDate || undefined;
    }

    if (props.recurrenceType === 'weekly' && props.daysOfWeek) {
      payload.days_of_week = props.daysOfWeek;
    } else if (props.recurrenceType === 'monthly' && props.dayOfMonth) {
      payload.day_of_month = Number(props.dayOfMonth);
    } else if (props.recurrenceType === 'none' && props.dueDate) {
      payload.due_date = props.dueDate;
    }

    if (canEdit && selectedHabit?.habit_id) {
      await updateHabit({
        habit_id: selectedHabit?.habit_id,
        ...payload,
      }).unwrap();
    } else {
      try {
        await createHabit(payload).unwrap();
      } catch (error) {
        onError?.(error);
      }
    }
    onSuccess?.();
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<TaskSchemaType>({
      initialValues: {
        title: (canEdit && selectedHabit?.title) || '',
        description: (canEdit && selectedHabit?.description) || '',
        recurrenceType:
          selectedHabit?.recurrence_type ||
          (canEdit && 'none') ||
          ('none' as RecurrenceType),
        daysOfWeek: selectedHabit?.days_of_week || undefined,
        dayOfMonth: selectedHabit?.day_of_month || undefined,
        dueDate: selectedHabit?.due_date || '',
        startDate: selectedHabit?.start_date || '',
        endDate: selectedHabit?.end_date || '',
      },
      validationSchema: schema,
      onSubmit: onStandaloneTaskSubmit,
    });

  return {
    isLoading: isHabitCreating || isHabitUpdating,
    handleChange: handleChange<keyof TaskSchemaType>,
    handleBlur: handleBlur<keyof TaskSchemaType>,
    ...restFormikOptions,
  };
};
