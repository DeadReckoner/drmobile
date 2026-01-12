import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { CreateHabitTaskForm } from '@/components/roadmap/CreateHabitTaskForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetHabitQuery } from '@/store/apis/habitsApi';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddEditHabitTask = () => {
  const {
    mode,
    habitId,
    isHabitEditing = false,
  } = useLocalSearchParams<{
    mode: FormEditModeType;
    habitId: string;
    isHabitEditing: string;
  }>();
  const { data: selectedTask } = useGetHabitQuery(habitId);
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(
    isHabitEditing === 'true' || false,
  );

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
            <AppButton
              onPress={() =>
                isHabitEditing === 'true'
                  ? router.back()
                  : setIsEditing((edit) => !edit)
              }>
              <AppIcon
                set="Feather"
                name={isEditing ? 'x' : 'edit'}
                size={isEditing ? 22 : 20}
              />
            </AppButton>
            {!isEditing && (
              <AppButton onPress={showDialog}>
                <AppIcon name={'delete'} color={Colors.error} size={20} />
              </AppButton>
            )}
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
              title="tabs.create_tab.add_new_task_or_habit"
              subtitle="tabs.create_tab.add_new_task_desc"
              titleProps={{ body1: true }}
              subtileProps={{ xsm: true }}
              marginT-0
            />
            <Divider margin-16 />
            <CreateHabitTaskForm
              mode="create"
              onSuccess={() => router.dismissTo('/(protected)/(tabs)')}
            />
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
            <CreateHabitTaskForm
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
  );
};

export default AddEditHabitTask;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 60,
  },
  headerOptions: {
    minHeight: 24,
  },
});
