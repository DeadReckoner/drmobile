import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AddEditCustomRoadmapForm } from '@/components/roadmap/AddEditCustomRoadmapForm';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { AppView } from '@/components/ui';
import {
  useCreateRoadmapMutation,
  useDeleteRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearTransition } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const RoadmapDetailsPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  const { t } = useLocalization();
  const { showToast } = useToast();
  const [deleteRoadmap, { isLoading }] = useDeleteRoadmapMutation();
  const [createRoadmap, { isLoading: isCreatingRoadmap }] =
    useCreateRoadmapMutation();

  const [isEditing, setIsEditing] = useState(false);
  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onDeleteConfirmation = async () => {
    hideDialog();
    if (roadmap.roadmap_id) {
      try {
        await deleteRoadmap(roadmap.roadmap_id).unwrap();
        onDeleteSuccess();
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    }
  };

  const onDeleteSuccess = () => {
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  };

  const hideDiscardDialog = () => setIsBackModalOpen(false);
  const showDiscardDialog = () => setIsBackModalOpen(true);

  const onBackPress = () => {
    if (roadmap?.roadmap_id) {
      return router.back();
    }
    showDiscardDialog();
  };

  const toggleEditMode = () => setIsEditing((edit) => !edit);
  const onCreateRoadmap = async () => {
    try {
      const { goal, description, days, completed, milestones } = roadmap;

      await createRoadmap({
        goal,
        description,
        days,
        completed,
        milestones,
      }).unwrap();
      showToast({
        type: 'success',
        message: t('common.created_successfully'),
      });
      router.dismissTo('/(protected)/(tabs)/progress');
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <AppView flex-1 bg-red10 reanimated layout={LinearTransition}>
      {isLoading && <Loader />}
      <AppKeyboardController>
        <AppView spread row gap-16>
          <HeaderWithBack
            headerText={roadmap.goal}
            flex-1
            goBackOnPress={false}
            onBackPress={onBackPress}
          />
          <AppView row gap-16 top>
            {isEditing && (
              <AppButton onPress={toggleEditMode}>
                <AppIcon
                  set="Feather"
                  name={isEditing ? 'x' : 'edit'}
                  size={22}
                />
              </AppButton>
            )}
            {!!roadmap?.roadmap_id && (
              <AppButton onPress={showDialog}>
                <AppIcon name={'delete'} color={Colors.error} size={20} />
              </AppButton>
            )}
          </AppView>
        </AppView>
        <Divider margin-16 />
        <AppView reanimated layout={Animations.Layout.Springify()}>
          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
              exiting={Animations.Exit.FadeOutDown()}>
              <AddEditCustomRoadmapForm
                mode="edit"
                onSuccess={() => setIsEditing(false)}
              />
            </AppView>
          )}

          {!isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
              exiting={Animations.Exit.FadeOutDown()}>
              <RoadmapDetails
                roadmap={roadmap}
                toggleEditMode={toggleEditMode}
              />
              <Divider margin-8 />

              {roadmap.milestones.length > 0 && !roadmap?.roadmap_id && (
                <PrimaryButton
                  label="tabs.create_tab.submit_roadmap"
                  onPress={onCreateRoadmap}
                  shouldShowLoader
                  isLoading={isCreatingRoadmap}
                />
              )}
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
      <ConfirmationDialog
        isDialogOpen={isBackModalOpen}
        onDismiss={hideDiscardDialog}
        title="tabs.create_tab.leave_without_saving"
        subtitle="tabs.create_tab.discard_roadmap_description"
        onNegativePress={hideDiscardDialog}
        onPositivePress={() => {
          hideDiscardDialog();
          router.back();
        }}
        negativeText="common.stay"
        positiveText="common.leave"
        negativeButtonIcon={
          <AppIcon
            set="Feather"
            name="map"
            color={Colors.textOnPrimary}
            size={14}
          />
        }
        positiveButtonIcon={
          <AppIcon name="arrowleft" color={Colors.textOnPrimary} size={14} />
        }
      />
    </AppView>
  );
};

export default RoadmapDetailsPage;
