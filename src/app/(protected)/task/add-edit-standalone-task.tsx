import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { CreateStandaloneTaskForm } from '@/components/roadmap/CreateStandaloneTaskForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectSelectedTask } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddEditStandaloneTask = () => {
  const { mode } = useLocalSearchParams<{ mode: FormEditModeType }>();
  const selectedTask = useAppSelector(selectSelectedTask);
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = mode === 'edit';

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onDeleteConfirmation = () => {
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  };

  return (
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
      <AppView reanimated paddingL-4 layout={Animations.Layout.Springify()}>
        {!canEdit && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDown()}
            exiting={Animations.Exit.FadeOutDown()}>
            <ScreenHeader
              title="tabs.create_tab.add_new_task"
              subtitle="tabs.create_tab.add_new_task_desc"
              titleProps={{ body1: true }}
              subtileProps={{ xsm: true }}
              marginT-0
            />
            <Divider margin-16 />
            <CreateStandaloneTaskForm mode="create" />
          </AppView>
        )}

        {selectedTask && canEdit && !isEditing && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppCard>
              <AppText body1 textColor>
                {selectedTask?.title}
              </AppText>
              <LineDivider marginV-12 />
              <AppText captionLight textColor>
                {selectedTask?.description}
              </AppText>
            </AppCard>
            <Divider margin-16 />
          </AppView>
        )}

        {isEditing && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDown()}
            exiting={Animations.Exit.FadeOutDown()}>
            <CreateStandaloneTaskForm
              mode="edit"
              onSuccess={() => setIsEditing(false)}
            />
          </AppView>
        )}
      </AppView>
      <ConfirmationDialog
        isDialogOpen={isDeleteMilestoneDialogOpen}
        onDismiss={hideDialog}
        title="common.are_you_sure"
        subtitle="common.delete_task"
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
  );
};

export default AddEditStandaloneTask;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 60,
  },
  headerOptions: {
    minHeight: 24,
  },
});
