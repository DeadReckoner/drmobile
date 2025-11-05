import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { AddEditCustomRoadmapForm } from '@/components/roadmap/AddEditCustomRoadmapForm';
import { AIRoadmapDetails } from '@/components/roadmap/ai-roamap/AIRoadmapDetails';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { AppView } from '@/components/ui';
import {
  useCreateRoadmapMutation,
  useDeleteRoadmapMutation,
  useGetRoadmapByIdQuery,
  useStartRoadmapMutation,
} from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftRoadmap,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import { useState } from 'react';
import { LinearTransition } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';
import { useDispatch } from 'react-redux';

const RoadmapDetailsPage = () => {
  const selectedRoadmap = useAppSelector(selectDraftRoadmap);
  const { data: roadmap = selectedRoadmap, isLoading: isRoadmapLoading } =
    useGetRoadmapByIdQuery(selectedRoadmap?.roadmap_id || '', {
      skip: !selectedRoadmap?.roadmap_id,
      refetchOnMountOrArgChange: true,
    });

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);

  const { t } = useLocalization();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [deleteRoadmap, { isLoading }] = useDeleteRoadmapMutation();
  const [createRoadmap, { isLoading: isCreatingRoadmap }] =
    useCreateRoadmapMutation();

  const [startRoadmap, { isLoading: isStartingRoadmap }] =
    useStartRoadmapMutation();

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
      const {
        goal,
        description,
        days,
        completed,
        milestones,
        macro_map,
        reason,
        type,
      } = roadmap;

      const createdRoadmap = await createRoadmap({
        goal,
        description,
        days,
        completed,
        milestones,
        macro_map,
        reason,
        type,
      }).unwrap();
      dispatch(setDraftRoadmapAction(createdRoadmap));
      showToast({
        type: 'success',
        message: t('common.created_successfully'),
      });
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const onStartRoadmap = async () => {
    try {
      const finalRoadmap = await startRoadmap(roadmap.roadmap_id).unwrap();
      dispatch(
        setDraftRoadmapAction({
          ...finalRoadmap,
          macro_map: selectedRoadmap.macro_map,
        }),
      );
      showToast({
        type: 'success',
        message: t('common.started_successfully'),
      });
      // await refetch();
    } catch (error) {
      showToast({
        type: 'failure',
        message: getApiErrorMessage(error),
      });
    }
  };

  const isRoadmapNotStarted =
    selectedRoadmap.start_date === '0001-01-01T00:00:00Z' ||
    selectedRoadmap.start_date === null;

  const hasMilestones =
    selectedRoadmap.type === 'ai_generated'
      ? (
          (selectedRoadmap.macro_map || roadmap?.macro_map)?.phases?.flatMap(
            (phase) => phase.macro_milestones,
          ) || []
        ).length > 0
      : (selectedRoadmap.milestones?.length || 0) > 0;

  return (
    <AppView flex-1 reanimated layout={LinearTransition}>
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
              marginB-50
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
              exiting={Animations.Exit.FadeOutDown()}>
              {roadmap?.type === 'ai_generated' ? (
                <AIRoadmapDetails
                  roadmap={roadmap}
                  isRoadmapLoading={isRoadmapLoading}
                  toggleEditMode={toggleEditMode}
                />
              ) : (
                <RoadmapDetails
                  roadmap={roadmap}
                  toggleEditMode={toggleEditMode}
                />
              )}
              <Divider margin-8 />

              {roadmap.milestones.length > 0 && !roadmap?.roadmap_id && (
                <PrimaryButton
                  label="tabs.create_tab.submit_roadmap"
                  onPress={onCreateRoadmap}
                  shouldShowLoader
                  isLoading={isCreatingRoadmap}
                />
              )}

              {!isRoadmapLoading && isRoadmapNotStarted && hasMilestones && (
                <AppView
                  reanimated
                  entering={Animations.Entry.FadeInDownWithSpring().delay(200)}
                  exiting={Animations.Exit.FadeOutDown()}>
                  <PrimaryButton
                    label="common.start_roadmap"
                    shouldShowLoader
                    isLoading={isStartingRoadmap}
                    onPress={onStartRoadmap}
                  />
                </AppView>
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
