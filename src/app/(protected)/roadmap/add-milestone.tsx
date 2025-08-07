import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { CreateMilestoneForm } from '@/components/roadmap/CreateMilestoneForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeMilestoneAction,
  selectDraftRoadmap,
  selectSelectedMilestone,
} from '@/store/slices/roadmapDraftSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const AddMilestone = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
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
          <HeaderWithBack headerText={roadmap.Goal} />
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

        <AppView
          reanimated
          paddingL-4
          layout={LinearTransition.springify().damping(15).stiffness(150)}>
          {!canEdit && (
            <Animated.View
              entering={FadeInDown.duration(300).delay(100)}
              exiting={FadeOutDown.duration(200)}>
              <ScreenHeader
                title="tabs.create_tab.add_new_milestone"
                subtitle="tabs.create_tab.add_new_milestone_desc"
                titleProps={{ body1: true }}
                subtileProps={{ xsm: true }}
              />
              <Divider margin-8 />
              <CreateMilestoneForm mode="create" />
            </Animated.View>
          )}

          {selectedMilestone && canEdit && !isEditing && (
            <Animated.View
              entering={FadeInDown.duration(300).delay(100)}
              exiting={FadeOutDown.duration(200)}>
              <AppText subtitle1 textColor marginB-8>
                {selectedMilestone?.SubGoal} Hello
              </AppText>
              <AppText captionLight textColor style={{ fontSize: 14 }}>
                {selectedMilestone?.Description}
              </AppText>
            </Animated.View>
          )}

          {isEditing && (
            <Animated.View
              entering={FadeInDown.duration(300).delay(100)}
              exiting={FadeOutDown.duration(200)}>
              <CreateMilestoneForm mode="edit" />
            </Animated.View>
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
