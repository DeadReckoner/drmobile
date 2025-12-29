import { WeekdayIndex } from '@/components/WeekdaySelector';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedTask } from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createTaskValidationSchema = (t: (_: TranslationKeysType) => string) => {
  const nameLabel = t('tabs.create_tab.task_name_label');
  const descLabel = t('tabs.create_tab.task_desc_label');
  const startDateLabel = t('tabs.create_tab.start_date');
  const endDateLabel = t('tabs.create_tab.end_date');
  return Yup.object({
    taskName: Yup.string()
      .label(nameLabel)
      .min(2, isInvalidMessage(nameLabel, t))
      .required(isRequiredMessage(nameLabel, t)),
    taskDescription: Yup.string()
      .label(descLabel)
      .min(2, isInvalidMessage(descLabel, t))
      .required(isRequiredMessage(descLabel, t)),
    startDate: Yup.string()
      .label(startDateLabel)
      .min(2, isInvalidMessage(startDateLabel, t))
      .required(isRequiredMessage(startDateLabel, t)),
    endDate: Yup.string()
      .label(endDateLabel)
      .min(2, isInvalidMessage(endDateLabel, t))
      .required(isRequiredMessage(endDateLabel, t)),
  });
};

type TaskSchemaType = Yup.InferType<
  ReturnType<typeof createTaskValidationSchema>
>;

interface TaskFormHookProps {
  mode?: FormEditModeType;
  selectedDays: WeekdayIndex[];
  onSuccess?: () => void;
}

export const useStandaloneTaskForm = ({
  mode = 'create',
  onSuccess,
  selectedDays: _selectedDays,
}: TaskFormHookProps) => {
  const { t } = useLocalization();
  const schema = createTaskValidationSchema(t);
  // const dispatch = useAppDispatch();
  const selectedTask = useAppSelector(selectSelectedTask);
  const canEdit = mode === 'edit';

  //TODO: handle standalone task submission, remove unused variables
  const onStandaloneTaskSubmit = async (_props: TaskSchemaType) => {
    if (canEdit) {
      // dispatch(
      //   updateTaskAction({
      //     description: taskDescription,
      //     title: taskName,
      //   }),
      // );
    } else {
      // dispatch(
      //   addTaskAction({
      //     description: taskDescription,
      //     title: taskName,
      //   }),
      // );
    }
    onSuccess?.();
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<TaskSchemaType>({
      initialValues: {
        taskName: (canEdit && selectedTask?.title) || '',
        taskDescription: (canEdit && selectedTask?.description) || '',
        startDate: '',
        endDate: '',
      },
      validationSchema: schema,
      onSubmit: onStandaloneTaskSubmit,
    });

  return {
    handleChange: handleChange<keyof TaskSchemaType>,
    handleBlur: handleBlur<keyof TaskSchemaType>,
    ...restFormikOptions,
  };
};
