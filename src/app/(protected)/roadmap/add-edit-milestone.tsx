import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
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
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const AddMilestone = () => {
  const { mode } = useLocalSearchParams<{ mode: FormEditModeType }>();
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = mode === 'edit';

  const dispatch = useAppDispatch();
  const selectedMilestone = useAppSelector(selectSelectedMilestone);
  const { showToast } = useToast();
  const { t } = useLocalization();

  const onDelete = () => {
    dispatch(removeMilestoneAction());
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AppView spread row centerV>
          <HeaderWithBack />
          {canEdit && (
            <AppView row gap-12 center>
              <AppButton onPress={() => setIsEditing((edit) => !edit)}>
                <AppIcon
                  set="Feather"
                  name={isEditing ? 'x' : 'edit'}
                  size={20}
                />
              </AppButton>
              <AppButton onPress={onDelete}>
                <AppIcon name={'delete'} color={Colors.error} size={22} />
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
              <CreateMilestoneForm mode="create" />
            </AppView>
          )}

          {selectedMilestone && canEdit && !isEditing && (
            <AppView
              reanimated
              bg-lightCardBG
              padding-16
              br30
              entering={Animations.Entry.FadeInDownWithSpring}
              exiting={Animations.Exit.FadeOutDown}>
              <AppText body1 textColor>
                {selectedMilestone?.SubGoal}
              </AppText>
              <LineDivider marginV-12 marginB-8 />
              <AppText captionLight textColor>
                {selectedMilestone?.Description}
              </AppText>
            </AppView>
          )}

          {isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown}
              exiting={Animations.Exit.FadeOutDown}>
              <CreateMilestoneForm mode="edit" />
            </AppView>
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default AddMilestone;

const styles = StyleSheet.create({
  scrollContainer: { paddingTop: 60 },
});
