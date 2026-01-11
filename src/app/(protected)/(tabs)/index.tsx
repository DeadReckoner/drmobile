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
import { useGetNotificationsQuery } from '@/hooks/notifications';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useGetUserTasksByStartDateQuery } from '@/hooks/task';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useGetTodayHabitsQuery } from '@/store/apis/habitsApi';
import { HabitWithStatusType } from '@/store/apis/types/habitsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setSelectedTaskAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Today = () => {
  const { data, isLoading, refetch, isFetching } =
    useGetUserTasksByStartDateQuery(
      DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
    );

  const {
    data: habitsData,
    isLoading: habitsLoading,
    refetch: refetchHabits,
    isFetching: habitsFetching,
  } = useGetTodayHabitsQuery();

  const dispatch = useAppDispatch();
  const { requestPermissions } = usePushNotifications();

  useEffect(() => {
    (async () => {
      await requestPermissions();
    })();
  }, [requestPermissions]);

  const handleTaskClick = (task: TaskType, index: number) => {
    dispatch(setShouldSyncWithServerAction(true));
    dispatch(setSelectedTaskAction({ task, index }));
    router.navigate(`/task/today-task-details`);
  };

  useGetFriendsQuery();
  useGetNotificationsQuery();

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

  const handleRefresh = () => {
    refetch();
    refetchHabits();
  };

  const handleHabitClick = (habit: HabitWithStatusType) => {
    router.push({
      pathname: '/habits/habit-mark-completion',
      params: { habitId: habit.habit_id, isCompleted: `${habit.is_completed}` },
    });
  };

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

  const renderHabitItem = ({
    item,
  }: LegendListRenderItemProps<HabitWithStatusType>) => {
    const getRecurrenceText = () => {
      switch (item.recurrence_type) {
        case 'daily':
          return 'Daily';
        case 'weekly':
          return 'Weekly';
        case 'monthly':
          return 'Monthly';
        default:
          return 'One-time';
      }
    };

    return (
      <AppCard
        style={styles.habitCard}
        row
        centerV
        onPress={() => handleHabitClick(item)}
        padding-0>
        <AppView
          br40
          style={[
            styles.indicator,
            {
              backgroundColor: item.is_completed
                ? Colors.success
                : Colors.secondary,
            },
          ]}
        />
        <AppView flex-1 padding-16 centerV>
          <AppView row>
            <AppText body2 textColor flex-1 marginR-8 numberOfLines={2}>
              {item.title}
            </AppText>
            <AppView
              bg-primary
              paddingH-8
              paddingV-4
              br100
              style={styles.habitChipContainer}>
              <AppText textColor sm regular numberOfLines={2}>
                {getRecurrenceText()}
              </AppText>
            </AppView>
          </AppView>
          {item.description && (
            <AppText xsm textColor marginT-4>
              {item.description}
            </AppText>
          )}
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
            refreshing={
              (isFetching && !isLoading) || (habitsFetching && !habitsLoading)
            }
            onRefresh={handleRefresh}
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
        {(habitsLoading || isLoading) && (
          <AppView height={80}>
            <Loader transparent />
          </AppView>
        )}

        {(!data || data?.length === 0) &&
          !isLoading &&
          (!habitsData || habitsData?.length === 0) &&
          !habitsLoading &&
          renderEmptyComponent()}

        <AppView
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring()}
          exiting={Animations.Exit.FadeOutDown()}>
          <AppList<HabitWithStatusType>
            keyExtractor={(i) => i.habit_id}
            data={habitsData || []}
            renderItem={renderHabitItem}
            ListFooterComponent={() => <Divider />}
            ItemSeparatorComponent={() => <Divider />}
          />
        </AppView>

        <AppView
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring()}
          exiting={Animations.Exit.FadeOutDown()}>
          <AppList<TaskType>
            keyExtractor={(i) => i.task_id}
            data={nonCompletedTasks || []}
            renderItem={renderItem}
            ListFooterComponent={() => <Divider />}
            ItemSeparatorComponent={() => <Divider />}
          />
        </AppView>
        <Divider margin-4 />
        {completedTasks?.length > 0 && (
          <>
            <TranslatedText body1 translationKey="common.completed_tasks" />
            <Divider margin-4 />
            <AppList<TaskType>
              keyExtractor={(i) => i.task_id}
              data={completedTasks || []}
              renderItem={renderItem}
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
  indicator: { height: '100%', width: 4 },
  taskCard: { overflow: 'hidden' },
  habitCard: {
    overflow: 'hidden',
    borderLeftWidth: 2,
    borderLeftColor: Colors.secondary,
  },
  habitChipContainer: { alignSelf: 'flex-start' },
});
