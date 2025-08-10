import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { CreateStepForm } from '@/components/roadmap/CreateStepForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeStepAction,
  selectSelectedTask,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const AddEditStep = () => {
  const { mode, stepDescription, stepNumber } = useLocalSearchParams<{
    mode: FormEditModeType;
    stepDescription: string;
    stepNumber: string;
  }>();
  const dispatch = useAppDispatch();
  const selectedTask = useAppSelector(selectSelectedTask);
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = mode === 'edit';

  const onDelete = () => {
    dispatch(removeStepAction({ number: Number(stepNumber) }));
    showToast({
      type: 'success',
      message: t('common.deleted_successfully'),
    });
    router.back();
  };

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
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

        <AppView
          reanimated
          paddingL-4
          layout={LinearTransition.springify().damping(15).stiffness(150)}>
          {!canEdit && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDown}
              exiting={Animations.Exit.FadeOutDown}>
              <ScreenHeader
                title="tabs.create_tab.add_new_step"
                subtitle="tabs.create_tab.add_new_step_desc"
                titleProps={{ body1: true }}
                subtileProps={{ xsm: true }}
                marginT-0
              />
              <Divider margin-8 />
              <CreateStepForm mode="create" />
            </AppView>
          )}

          {selectedTask && canEdit && !isEditing && (
            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring}
              exiting={Animations.Exit.FadeOutDown}>
              <AppView bg-lightCardBG padding-16 br30>
                <AppText body1 textColor>
                  {t('tabs.create_tab.step_label')}
                </AppText>
                <LineDivider marginV-12 />
                <AppText captionLight textColor>
                  {stepDescription}
                </AppText>
              </AppView>
            </AppView>
          )}

          {isEditing && (
            <AppView
              reanimated
              paddingT-16
              entering={Animations.Entry.FadeInDown}
              exiting={Animations.Exit.FadeOutDown}>
              <CreateStepForm
                mode="edit"
                stepDescription={stepDescription}
                stepNumber={Number(stepNumber)}
                taskId={selectedTask?.TaskId}
              />
            </AppView>
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default AddEditStep;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 60,
  },
});
