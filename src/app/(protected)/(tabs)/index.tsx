import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetFriendsQuery } from '@/hooks/friends';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useGetUserTasksByStartDateQuery } from '@/hooks/task';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setSelectedTaskAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Today = () => {
  const { data, isLoading, refetch, isFetching } =
    useGetUserTasksByStartDateQuery(
      DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
    );

  const dispatch = useAppDispatch();

  const handleTaskClick = (task: TaskType, index: number) => {
    dispatch(setShouldSyncWithServerAction(true));
    dispatch(setSelectedTaskAction({ task, index }));
    router.navigate(`/task/today-task-details`);
  };

  useGetFriendsQuery();

  const onCalendarClick = () => {
    // router.navigate('/calendar');
  };

  const onNotificationsClick = () => {
    router.navigate('/notifications');
  };

  const onUserProfileClick = () => {
    router.navigate('/settings');
  };

  const nonCompletedTasks = useMemo(
    () => data?.filter((task) => !task.steps?.every((step) => step.completed)),
    [data],
  );

  const completedTasks = useMemo(
    () =>
      data?.filter((task) => task.steps?.every((step) => step.completed)) || [],
    [data],
  );

  const renderEmptyComponent = () => {
    return (
      <EmptyListItemPlaceholder
        title="tabs.create_tab.no_tasks_yet"
        subtitle="tabs.create_tab.no_tasks_description"
      />
    );
  };

  const renderItem = ({ item, index }: LegendListRenderItemProps<TaskType>) => {
    return (
      <AppCard
        style={styles.taskCard}
        row
        centerV
        onPress={() => handleTaskClick(item, index)}
        padding-0>
        <AppView
          br40
          style={[
            styles.indicator,
            {
              backgroundColor: item.completed ? Colors.success : Colors.primary,
            },
          ]}
        />
        <AppView flex-1 padding-16>
          <AppText body2 textColor>
            {item.title}
          </AppText>
          <AppText xsm textColor marginT-4>
            {item.description}
          </AppText>
        </AppView>
      </AppCard>
    );
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.secondary}
          />
        }>
        <Divider />
        <AppView row centerV spread>
          <TranslatedText h2 translationKey="tabs.today" />
          <AppView center row gap-18>
            <AppButton onPress={onCalendarClick}>
              <AppIcon set="Feather" name="calendar" size={26} />
            </AppButton>
            <AppButton onPress={onNotificationsClick}>
              <AppIcon set="Feather" name="heart" size={24} />
            </AppButton>
            <AppButton onPress={onUserProfileClick}>
              <AppIcon set="Feather" name="user" size={26} />
            </AppButton>
          </AppView>
        </AppView>
        <Divider />

        {isLoading ? (
          <AppView height={100}>
            <Loader transparent />
          </AppView>
        ) : (
          <AppView
            pointerEvents={isFetching ? 'none' : 'auto'}
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppList<TaskType>
              keyExtractor={(i) => i.task_id}
              data={nonCompletedTasks || []}
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={() => <Divider />}
              ItemSeparatorComponent={() => <Divider />}
            />
          </AppView>
        )}
        <Divider margin-4 />
        {completedTasks?.length > 0 && (
          <>
            <TranslatedText body1 translationKey="common.completed_tasks" />
            <Divider margin-4 />
            <AppList<TaskType>
              keyExtractor={(i) => i.task_id}
              data={completedTasks || []}
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={() => <Divider />}
              ItemSeparatorComponent={() => <Divider />}
            />
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default Today;
const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 24,
  },
  indicator: { height: '100%', width: 6 },
  taskCard: { overflow: 'hidden' },
});
