import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { CreateStepForm } from '@/components/roadmap/CreateStepForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useDeleteStepMutation } from '@/hooks/step';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeStepAction,
  selectDraftSlice,
  selectSelectedStep,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddEditStep = () => {
  const { mode } = useLocalSearchParams<{
    mode: FormEditModeType;
  }>();
  const dispatch = useAppDispatch();
  const selectedStep = useAppSelector(selectSelectedStep);
  const selectedDraft = useAppSelector(selectDraftSlice);
  const [deleteStep, { isLoading: isDeletingStep }] = useDeleteStepMutation();

  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = mode === 'edit';

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onStepAdded = () => {
    router.back();
  };

  const onDeleteConfirmation = async () => {
    hideDialog();
    if (selectedStep?.step_id) {
      if (selectedDraft.shouldSyncWithServer) {
        try {
          await deleteStep({
            step_id: selectedStep.step_id,
            task_id: selectedStep.task_id,
          }).unwrap();
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
        dispatch(removeStepAction({ step_id: selectedStep.step_id }));
        showToast({
          type: 'success',
          message: t('common.deleted_successfully'),
        });
        router.back();
      }
    }
  };

  return (
    <>
      {isDeletingStep && <Loader />}
      <AppKeyboardController>
        <AppView spread row centerV>
          <HeaderWithBack />
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

        <AppView reanimated paddingL-4 layout={Animations.Layout.Springify()}>
          {!canEdit && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <ScreenHeader
                title="tabs.create_tab.add_new_step"
                subtitle="tabs.create_tab.add_new_step_desc"
                titleProps={{ body1: true }}
                subtileProps={{ xsm: true }}
                marginT-0
              />
              <Divider margin-16 />
              <CreateStepForm mode="create" onSuccess={onStepAdded} />
            </AppView>
          )}

          {selectedStep && canEdit && !isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}>
              <AppCard>
                <AppText body1 textColor>
                  {t('tabs.create_tab.step_label')} {selectedStep.number}
                </AppText>
                <LineDivider marginV-12 />
                <AppText captionLight textColor>
                  {selectedStep?.description}
                </AppText>
              </AppCard>
            </AppView>
          )}

          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown()}
              exiting={Animations.Exit.FadeOutDown()}>
              <CreateStepForm
                mode="edit"
                stepDescription={selectedStep?.description}
                stepNumber={selectedStep?.number}
                taskId={selectedStep?.task_id}
                onSuccess={() => setIsEditing(false)}
              />
            </AppView>
          )}
        </AppView>

        <ConfirmationDialog
          isDialogOpen={isDeleteMilestoneDialogOpen}
          onDismiss={hideDialog}
          title="common.are_you_sure"
          subtitle="common.delete_step"
          onPositivePress={onDeleteConfirmation}
          onNegativePress={hideDialog}
          positiveText="common.remove"
          negativeText="common.cancel"
          positiveButtonIcon={
            <AppIcon name="delete" color={Colors.textOnPrimary} size={14} />
          }
          negativeButtonIcon={
            <AppIcon name="close" color={Colors.textOnPrimary} size={14} />
          }
        />
      </AppKeyboardController>
    </>
  );
};

export default AddEditStep;

const styles = StyleSheet.create({
  headerOptions: {
    minHeight: 24,
  },
});
