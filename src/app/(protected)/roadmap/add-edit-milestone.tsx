import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppKeyboardController } from '@/components/AppKeyboardController';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { CreateMilestoneForm } from '@/components/roadmap/CreateMilestoneForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeMilestoneAction,
  selectSelectedMilestone,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Colors } from 'react-native-ui-lib';

const AddMilestone = () => {
  const { mode } = useLocalSearchParams<{ mode: FormEditModeType }>();
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = mode === 'edit';

  const dispatch = useAppDispatch();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const { showToast } = useToast();
  const { t } = useLocalization();

  const [isDeleteMilestoneDialogOpen, setIsDeleteMilestoneDialogOpen] =
    useState(false);

  const hideDialog = () => setIsDeleteMilestoneDialogOpen(false);
  const showDialog = () => setIsDeleteMilestoneDialogOpen(true);

  const onBackPress = () => {
    router.back();
  };

  const onDeleteConfirmation = () => {
    dispatch(removeMilestoneAction());
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
          <AppView row gap-12 center>
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
            <CreateMilestoneForm mode="create" onSuccess={onBackPress} />
          </AppView>
        )}

        {selectedMilestone && canEdit && !isEditing && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring}
            exiting={Animations.Exit.FadeOutDown}>
            <AppCard>
              <AppText body1 textColor>
                {selectedMilestone?.SubGoal}
              </AppText>
              <LineDivider marginV-12 />
              <AppText captionLight textColor>
                {selectedMilestone?.Description}
              </AppText>
            </AppCard>
          </AppView>
        )}

        {isEditing && (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDown}
            exiting={Animations.Exit.FadeOutDown}>
            <CreateMilestoneForm
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
  );
};

export default AddMilestone;
