import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { Loader } from '@/components/Loader';
import { StepsList } from '@/components/roadmap/StepsList';
import { AppText, AppView } from '@/components/ui';
import { useGetTasksByIdQuery } from '@/hooks/task';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedTaskAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

type TaskDetailsRouteParams = {
  task_id: string;
  title: string;
  description: string;
  milestone_id: string;
};

const TaskDetails = () => {
  const { task_id, title, description } =
    useLocalSearchParams<TaskDetailsRouteParams>();
  const { data: task, isLoading } = useGetTasksByIdQuery(task_id);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (task) {
      dispatch(setSelectedTaskAction({ task, index: -1 }));
    }
  }, [task, dispatch]);

  const onRoadmapButtonPress = () => {
    router.navigate({
      pathname: '/roadmap/roadmap-details',
    });
  };
  return (
    <AppScreen>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <AppView row spread centerV>
          <HeaderWithBack />
          <AppButton onPress={onRoadmapButtonPress}>
            <AppIcon set="Feather" name="map" size={18} />
          </AppButton>
        </AppView>
        <Divider />
        <AppCard>
          <AppText body1 textColor>
            {title}
          </AppText>
          <LineDivider marginV-12 />
          <AppText captionLight textColor>
            {description}
          </AppText>
        </AppCard>
        <Divider />
        <AppView style={styles.childContentContainer} reanimated>
          {isLoading ? (
            <Loader transparent />
          ) : task?.milestone_id ? (
            <AppView reanimated entering={Animations.Entry.FadeInDown()}>
              <StepsList mode="view" />
            </AppView>
          ) : null}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default TaskDetails;

const styles = StyleSheet.create({
  childContentContainer: {
    minHeight: 100,
  },
});
