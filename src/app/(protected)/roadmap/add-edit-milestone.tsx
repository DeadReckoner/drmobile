import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { AddEditMilestoneForm } from '@/components/roadmap/AddEditMilestoneForm';
import { TasksList } from '@/components/roadmap/TasksList';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useDeleteMilestoneMutation } from '@/hooks/milestone';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeMilestoneAction,
  selectDraftSlice,
  selectSelectedMilestone,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddMilestone = () => {
  const { mode, showTasksList } = useLocalSearchParams<{
    mode: FormEditModeType;
    showTasksList: string;
  }>();
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = mode === 'edit';
  const dispatch = useAppDispatch();
  const selectedRoadmap = useAppSelector(selectDraftSlice);
  const { t } = useLocalization();
  const [deleteMilestone, { isLoading: isDeleting }] =
    useDeleteMilestoneMutation();

  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const { showToast } = useToast();

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onBackPress = () => {
    router.back();
  };

  const onUpdateMilestoneError = (error: unknown) => {
    showToast({
      type: 'failure',
      message: getApiErrorMessage(error),
    });
  };

  const onDeleteConfirmation = async () => {
    hideDialog();
    if (
      selectedRoadmap?.shouldSyncWithServer &&
      selectedMilestone?.milestone_id
    ) {
      try {
        await deleteMilestone(selectedMilestone.milestone_id).unwrap();
        showToast({
          type: 'success',
          message: t('common.deleted_successfully'),
        });
        router.back();
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      }
    } else {
      showToast({
        type: 'success',
        message: t('common.deleted_successfully'),
      });
      dispatch(removeMilestoneAction());
      router.back();
    }
  };

  return (
    <>
      {isDeleting && <Loader />}
      <AppKeyboardController>
        <AppView spread row centerV>
          <AppView>{!isEditing && <HeaderWithBack />}</AppView>
          {canEdit && (
            <AppView row gap-16 center style={styles.headerOptions}>
              <AppButton onPress={() => setIsEditing((edit) => !edit)}>
                <AppIcon
                  set="Feather"
                  name={isEditing ? 'x' : 'edit'}
                  size={isEditing ? 22 : 20}
                />
              </AppButton>
              <AppButton onPress={showDialog}>
                <AppIcon name={'delete'} color={Colors.error} size={20} />
              </AppButton>
            </AppView>
          )}
        </AppView>
        <Divider margin-16 />

        <AppView paddingL-4>
          {!canEdit && (
            <AppView>
              <ScreenHeader
                title="tabs.create_tab.add_new_milestone"
                subtitle="tabs.create_tab.add_new_milestone_desc"
                titleProps={{ body1: true }}
                subtileProps={{ xsm: true }}
                marginT-0
              />
              <Divider margin-16 />
              <AddEditMilestoneForm mode="create" onSuccess={onBackPress} />
            </AppView>
          )}

          {selectedMilestone && canEdit && !isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}>
              <AppCard>
                <AppText body1 textColor>
                  {selectedMilestone?.sub_goal}
                </AppText>
                <LineDivider marginV-12 />
                <AppText captionLight textColor>
                  {selectedMilestone?.description}
                </AppText>
              </AppCard>
              {!!showTasksList && (
                <>
                  <Divider margin-16 />
                  <TranslatedText body1 translationKey="common.tasks" />
                  <Divider />
                  <TasksList
                    tasks={selectedMilestone.tasks}
                    onTaskClick={() => {
                      router.navigate({
                        pathname: '/task/add-edit-task',
                        params: { mode: 'edit' },
                      });
                    }}
                  />
                </>
              )}
            </AppView>
          )}

          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <AddEditMilestoneForm
                mode="edit"
                onSuccess={() => setIsEditing(false)}
                onError={onUpdateMilestoneError}
              />
            </AppView>
          )}
        </AppView>

        <ConfirmationDialog
          isDialogOpen={isDeleteMilestoneDialogOpen}
          onDismiss={hideDialog}
          title="common.are_you_sure"
          subtitle="common.delete_milestone"
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

export default AddMilestone;

const styles = StyleSheet.create({
  headerOptions: {
    minHeight: 24,
  },
});
