import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { CreateCustomRoadmapForm } from '@/components/roadmap/CreateCustomRoadmapForm';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { AppView } from '@/components/ui';
import { useDeleteRoadmapMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Colors } from 'react-native-ui-lib';

const RoadmapDetailsPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const { t } = useLocalization();
  const { showToast } = useToast();
  const [deleteRoadmap, { data, isLoading, error, reset }] =
    useDeleteRoadmapMutation();

  const [isEditing, setIsEditing] = useState(false);
  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onDeleteConfirmation = () => {
    deleteRoadmap(roadmap.roadmap_id);
    hideDialog();
  };

  const onDeleteSuccess = useCallback(() => {
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  }, [showToast, t]);

  useEffect(() => {
    if (data || error) {
      if (error) {
        showToast({
          type: 'failure',
          message: t('common.something_went_wrong'),
        });
      }

      if (data) {
        onDeleteSuccess();
      }
      reset();
    }
  }, [onDeleteSuccess, data, error, showToast, t, reset]);

  return (
    <>
      {isLoading && <Loader />}
      <AppKeyboardController>
        <AppView spread row gap-16>
          <HeaderWithBack headerText={roadmap.goal} flex-1 />
          <AppView row gap-12>
            <AppButton onPress={() => setIsEditing((edit) => !edit)}>
              <AppIcon
                set="Feather"
                name={isEditing ? 'x' : 'edit'}
                size={20}
              />
            </AppButton>
            <AppButton onPress={showDialog}>
              <AppIcon name={'delete'} color={Colors.error} size={20} />
            </AppButton>
          </AppView>
        </AppView>
        <Divider margin-16 />
        <AppView reanimated layout={Animations.Layout.Springify}>
          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring.delay(200)}
              exiting={Animations.Exit.FadeOutDown}>
              <CreateCustomRoadmapForm
                mode="edit"
                onSuccess={() => setIsEditing(false)}
              />
            </AppView>
          )}

          {!isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring.delay(200)}
              exiting={Animations.Exit.FadeOutDown}>
              <RoadmapDetails roadmap={roadmap} />
            </AppView>
          )}
        </AppView>

        <ConfirmationDialog
          isDialogOpen={isDeleteMilestoneDialogOpen}
          onDismiss={hideDialog}
          title="common.are_you_sure"
          subtitle="common.delete_roadmap"
          onNegativePress={hideDialog}
          onPositivePress={onDeleteConfirmation}
          negativeText="common.cancel"
          positiveText="common.remove"
          negativeButtonIcon={
            <AppIcon name="close" color={Colors.textOnPrimary} size={14} />
          }
          positiveButtonIcon={
            <AppIcon name="delete" color={Colors.textOnPrimary} size={14} />
          }
        />
      </AppKeyboardController>
    </>
  );
};

export default RoadmapDetailsPage;
