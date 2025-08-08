import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { CreateTaskForm } from '@/components/roadmap/CreateTaskForm';
import StepsList from '@/components/roadmap/StepsList';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppText, AppView } from '@/components/ui';
import { FormEditModeType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  removeTaskAction,
  selectSelectedTask,
} from '@/store/slices/roadmapDraftSlice';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

const AddTask = () => {
  const { mode } = useLocalSearchParams<{ mode: FormEditModeType }>();
  const dispatch = useAppDispatch();
  const selectedTask = useAppSelector(selectSelectedTask);
  const { showToast } = useToast();
  const { t } = useLocalization();
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = mode === 'edit';

  const onDelete = () => {
    dispatch(removeTaskAction());
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
              entering={FadeInDown.duration(300).delay(100)}
              exiting={FadeOutDown.duration(200)}>
              <ScreenHeader
                title="tabs.create_tab.add_new_task"
                subtitle="tabs.create_tab.add_new_task_desc"
                titleProps={{ body1: true }}
                subtileProps={{ xsm: true }}
                marginT-0
              />
              <Divider margin-8 />
              <CreateTaskForm mode="create" />
            </AppView>
          )}

          {selectedTask && canEdit && !isEditing && (
            <>
              <AppView
                reanimated
                bg-lightCardBG
                padding-16
                br30
                entering={FadeInDown.duration(300).delay(100)}
                exiting={FadeOutDown.duration(200)}>
                <AppText body1 textColor>
                  {selectedTask?.Title}
                </AppText>
                <LineDivider marginV-16 />
                <AppText captionLight textColor style={{ fontSize: 14 }}>
                  {selectedTask?.Description}
                </AppText>
              </AppView>
              <Divider margin-16 />
              <StepsList />
            </>
          )}

          {isEditing && (
            <AppView
              reanimated
              paddingT-16
              entering={FadeInDown.duration(300).delay(100)}
              exiting={FadeOutDown.duration(200)}>
              <CreateTaskForm mode="edit" />
            </AppView>
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default AddTask;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 60,
  },
});
