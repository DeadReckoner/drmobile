import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/hooks/task';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addTaskAction,
  selectDraftSlice,
  selectSelectedMilestone,
  selectSelectedTask,
  updateTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createTaskValidationSchema = (t: (_: TranslationKeysType) => string) => {
  const nameLabel = t('tabs.create_tab.task_name_label');
  const descLabel = t('tabs.create_tab.task_desc_label');
  return Yup.object({
    taskName: Yup.string()
      .label(nameLabel)
      .min(2, isInvalidMessage(nameLabel, t))
      .required(isRequiredMessage(nameLabel, t)),
    taskDescription: Yup.string()
      .label(descLabel)
      .min(2, isInvalidMessage(descLabel, t))
      .required(isRequiredMessage(descLabel, t)),
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

export const useTaskForm = ({
  onSuccess,
  mode = 'create',
  onError,
}: TaskFormHookProps) => {
  const { t } = useLocalization();
  const schema = createTaskValidationSchema(t);
  const dispatch = useAppDispatch();
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const selectedTask = useAppSelector(selectSelectedTask);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const canEdit = mode === 'edit';

  const onTaskSubmit = async ({
    taskName,
    taskDescription,
  }: TaskSchemaType) => {
    if (selectedDraft?.shouldSyncWithServer) {
      try {
        if (selectedMilestone?.milestone_id) {
          if (canEdit && selectedTask?.task_id) {
            await updateTask({
              task_id: selectedTask.task_id,
              title: taskName,
              description: taskDescription,
              milestone_id: selectedMilestone.milestone_id,
            }).unwrap();
          } else {
            await createTask({
              title: taskName,
              description: taskDescription,
              milestone_id: selectedMilestone.milestone_id,
            }).unwrap();
          }
          onSuccess?.();
        }
      } catch (error) {
        onError?.(error);
      }
    } else {
      if (canEdit) {
        dispatch(
          updateTaskAction({
            title: taskName,
            description: taskDescription,
          }),
        );
      } else {
        dispatch(
          addTaskAction({
            title: taskName,
            description: taskDescription,
          }),
        );
      }
      onSuccess?.();
    }
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<TaskSchemaType>({
      initialValues: {
        taskName: (canEdit && selectedTask?.title) || '',
        taskDescription: (canEdit && selectedTask?.description) || '',
      },
      validationSchema: schema,
      onSubmit: onTaskSubmit,
    });

  return {
    isLoading: isCreating || isUpdating,
    handleChange: handleChange<keyof TaskSchemaType>,
    handleBlur: handleBlur<keyof TaskSchemaType>,
    ...restFormikOptions,
  };
};
