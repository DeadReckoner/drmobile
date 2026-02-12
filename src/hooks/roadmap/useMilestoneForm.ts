import {
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
} from '@/hooks/milestone';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addMilestoneAction,
  selectDraftSlice,
  selectSelectedMilestone,
  updateMilestoneAction,
} from '@/store/slices/roadmapDraftSlice';
import { isInvalidMessage, isRequiredMessage } from '@/utils/form.utils';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const createMilestoneValidationSchema = (
  t: (_: TranslationKeysType) => string,
) => {
  const nameLabel = t('tabs.create_tab.milestone_name_label');
  const descLabel = t('tabs.create_tab.milestone_desc_label');
  return Yup.object({
    milestoneName: Yup.string()
      .label(nameLabel)
      .min(2, isInvalidMessage(nameLabel, t))
      .required(isRequiredMessage(nameLabel, t)),
    milestoneDescription: Yup.string()
      .label(descLabel)
      .min(2, isInvalidMessage(descLabel, t))
      .required(isRequiredMessage(descLabel, t)),
  });
};

type MilestoneSchemaType = Yup.InferType<
  ReturnType<typeof createMilestoneValidationSchema>
>;

interface MilestoneFormHookProps {
  onSuccess?: () => void;
  onError?: (_error: unknown) => void;
  mode: FormEditModeType;
}

export const useMilestoneForm = ({
  mode,
  onSuccess,
  onError,
}: MilestoneFormHookProps) => {
  const { t } = useLocalization();
  const schema = createMilestoneValidationSchema(t);
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const selectedRoadmap = useAppSelector(selectDraftSlice);
  const dispatch = useAppDispatch();
  const [updateMilestone, { isLoading: isUpdating }] =
    useUpdateMilestoneMutation();
  const [createMilestone, { isLoading: isCreating }] =
    useCreateMilestoneMutation();
  const canEdit = mode === 'edit';

  const onMilestoneSubmit = async ({
    milestoneName,
    milestoneDescription,
  }: MilestoneSchemaType) => {
    if (selectedRoadmap?.shouldSyncWithServer) {
      try {
        if (selectedMilestone?.milestone_id && canEdit) {
          await updateMilestone({
            milestoneId: selectedMilestone.milestone_id,
            sub_goal: milestoneName,
            description: milestoneDescription,
          }).unwrap();
          onSuccess?.();
        } else if (selectedRoadmap?.roadmap.roadmap_id && !canEdit) {
          await createMilestone({
            sub_goal: milestoneName,
            description: milestoneDescription,
            roadmap_id: selectedRoadmap.roadmap.roadmap_id,
          }).unwrap();
          onSuccess?.();
        }
      } catch (error) {
        onError?.(error);
      }
    } else {
      if (canEdit) {
        dispatch(
          updateMilestoneAction({
            sub_goal: milestoneName,
            description: milestoneDescription,
          }),
        );
      } else {
        dispatch(
          addMilestoneAction({
            day: 0,
            description: milestoneDescription,
            reached: false,
            sub_goal: milestoneName,
          }),
        );
      }
      onSuccess?.();
    }
  };

  const { handleChange, handleBlur, ...restFormikOptions } =
    useFormik<MilestoneSchemaType>({
      initialValues: {
        milestoneName: (canEdit && selectedMilestone?.sub_goal) || '',
        milestoneDescription: (canEdit && selectedMilestone?.description) || '',
      },
      validationSchema: schema,
      onSubmit: onMilestoneSubmit,
    });

  return {
    isLoading: isCreating || isUpdating,
    handleChange: handleChange<keyof MilestoneSchemaType>,
    handleBlur: handleBlur<keyof MilestoneSchemaType>,
    ...restFormikOptions,
  };
};
