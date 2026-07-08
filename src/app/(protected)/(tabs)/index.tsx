import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { OnboardingSetupTask } from '@/components/onboarding/OnboardingSetupTask';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useGetFriendsQuery } from '@/hooks/friends';
import { useGetNotificationsQuery } from '@/hooks/notifications';
import { useGetRoadmapsQuery } from '@/hooks/roadmap';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import {
  useGetTasksByRangeQuery,
  useGetUserTasksByStartDateQuery,
} from '@/hooks/task';
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useGetTodayHabitsQuery } from '@/store/apis/habitsApi';
import { HabitWithStatusType } from '@/store/apis/types/habitsApi.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectHasRequestBadge,
  setRequestBadgeAction,
} from '@/store/slices/notificationsSlice';
import {
  selectIsSetupTaskCompleted,
  selectSetupSteps,
  setSetupStepAction,
} from '@/store/slices/onboardingSlice';
import {
  setSelectedTaskAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import { storeTask } from '@/utils/roadmapTransfer';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router, Tabs } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Today = () => {
  const { t } = useLocalization();
  const isSetupTaskCompleted = useAppSelector(selectIsSetupTaskCompleted);
  const setupSteps = useAppSelector(selectSetupSteps);
  const showSetupTask = !isSetupTaskCompleted;

  const [currentDate] = useState(() =>
    DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
  );

  const { data, isLoading, refetch } = useGetUserTasksByStartDateQuery(
    currentDate,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: habitsData,
    isLoading: habitsLoading,
    refetch: refetchHabits,
  } = useGetTodayHabitsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [isWeeklyModalVisible, setIsWeeklyModalVisible] = useState(false);
  const dispatch = useAppDispatch();

  const weeklyRange = useMemo(() => {
    const tomorrow = DateUtils.createDate().add(1, 'day');
    return {
      startDate: DateUtils.formatDate(tomorrow, 'YYYY-MM-DD'),
      endDate: DateUtils.formatDate(tomorrow.add(7, 'day'), 'YYYY-MM-DD'),
    };
  }, []);

  const { data: weeklyTasks, isLoading: weeklyTasksLoading } =
    useGetTasksByRangeQuery(weeklyRange, { skip: !isWeeklyModalVisible });
  const { requestPermissions } = usePushNotifications();

  useEffect(() => {
    (async () => {
      await requestPermissions();
    })();
  }, [requestPermissions]);

  useEffect(() => {
    if (!isSetupTaskCompleted && !setupSteps.reviewToday) {
      dispatch(setSetupStepAction({ key: 'reviewToday', value: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskClick = (task: TaskType, index: number) => {
    dispatch(setShouldSyncWithServerAction(true));
    dispatch(setSelectedTaskAction({ task, index }));
    router.navigate(`/task/today-task-details`);
  };

  const { data: friends } = useGetFriendsQuery(undefined, {
    refetchOnMountOrArgChange: 3600 * 24, // 24 hours
  });
  const { data: roadmaps } = useGetRoadmapsQuery(undefined, {
    refetchOnMountOrArgChange: 3600 * 24, // 24 hours
  });
  const { data: notificationsData, refetch: refetchNotifications } =
    useGetNotificationsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (isSetupTaskCompleted) return;

    const hasRoadmap = (roadmaps?.length ?? 0) > 0;
    const hasFriend = (friends?.length ?? 0) > 0;
    const hasAnchor = roadmaps?.some((r) => !!r.anchor_id) ?? false;

    if (hasRoadmap && !setupSteps.createOrReviewRoadmap) {
      dispatch(
        setSetupStepAction({ key: 'createOrReviewRoadmap', value: true }),
      );
    }
    if (hasFriend && !setupSteps.inviteFriend) {
      dispatch(setSetupStepAction({ key: 'inviteFriend', value: true }));
    }
    if (hasAnchor && !setupSteps.addAnchor) {
      dispatch(setSetupStepAction({ key: 'addAnchor', value: true }));
    }

    const allOtherStepsDone =
      setupSteps.reviewToday &&
      setupSteps.createOrReviewRoadmap &&
      setupSteps.inviteFriend &&
      setupSteps.addAnchor;
    if (allOtherStepsDone && !setupSteps.completeTask) {
      dispatch(setSetupStepAction({ key: 'completeTask', value: true }));
    }
  }, [roadmaps, friends, setupSteps, isSetupTaskCompleted, dispatch]);

  const onCalendarClick = () => {
    setIsWeeklyModalVisible(true);
  };

  const handleWeeklyTaskPress = (task: TaskType) => {
    storeTask(task);
    setIsWeeklyModalVisible(false);
    router.navigate('/settings/readonly-task-details');
  };

  const onNotificationsClick = () => {
    router.navigate('/notifications');
  };

  const onUserProfileClick = () => {
    router.navigate('/settings');
  };

  const onAnchorClick = () => {
    router.navigate('/anchoring');
  };

  const hasUnreadNotifications = useAppSelector(selectHasRequestBadge);

  const hasAnchorNotifications = useMemo(
    () =>
      notificationsData?.some(
        (n) => n.type === 'anchor_request' || n.type === 'habit_anchor_request',
      ) ?? false,
    [notificationsData],
  );

  useEffect(() => {
    if (notificationsData !== undefined) {
      const hasRequests = notificationsData.some(
        (n) =>
          n.type === 'friend_request' ||
          n.type === 'anchor_request' ||
          n.type === 'habit_anchor_request',
      );
      dispatch(setRequestBadgeAction(hasRequests));
    }
  }, [notificationsData, dispatch]);

  const completedTasks = useMemo(
    () =>
      data?.filter(
        (task) =>
          task.status === 'completed' ||
          (!!task.steps?.length && task.steps.every((step) => step.completed)),
      ) ?? [],
    [data],
  );

  const nonCompletedTasks = useMemo(
    () =>
      data?.filter(
        (task) =>
          task.status !== 'completed' &&
          !(task.steps?.length && task.steps.every((step) => step.completed)),
      ) ?? [],
    [data],
  );

  const nonCompletedHabits = useMemo(
    () => habitsData?.filter((habit) => !habit.is_completed) ?? [],
    [habitsData],
  );

  const completedHabits = useMemo(
    () => habitsData?.filter((habit) => habit.is_completed) ?? [],
    [habitsData],
  );

  const shouldShowEmptyState =
    nonCompletedTasks.length === 0 &&
    completedTasks.length === 0 &&
    nonCompletedHabits.length === 0 &&
    completedHabits.length === 0 &&
    !isLoading &&
    !habitsLoading;

  const handleRefresh = async () => {
    try {
      setManualRefreshing(true);
      await Promise.allSettled([
        refetch().unwrap(),
        refetchHabits().unwrap(),
        refetchNotifications().unwrap(),
      ]);
    } catch {
    } finally {
      setManualRefreshing(false);
    }
  };

  const handleHabitClick = (habit: HabitWithStatusType) => {
    router.push({
      pathname: '/habits/habit-mark-completion',
      params: { habitId: habit.habit_id, isCompleted: `${habit.is_completed}` },
    });
  };

  const renderEmptyComponent = () => {
    if (showSetupTask) return null;
    return (
      <AppView
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}
        exiting={Animations.Exit.FadeOutDown()}>
        <EmptyListItemPlaceholder
          title="onboarding.empty_state.no_tasks_title"
          subtitle="onboarding.empty_state.no_tasks_description"
          btnText="onboarding.empty_state.go_to_create"
          onPress={() => router.navigate('/create')}
        />
      </AppView>
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
              backgroundColor:
                item.status === 'completed' ? Colors.success : Colors.primary,
            },
          ]}
        />
        <AppView flex-1 padding-16>
          <AppText body2 textColor>
            {item.title}
          </AppText>
          {!!item.description && (
            <AppText xsm textColor marginT-4 numberOfLines={3}>
              {item.description}
            </AppText>
          )}
        </AppView>
      </AppCard>
    );
  };

  const renderHabitItem = ({
    item,
  }: LegendListRenderItemProps<HabitWithStatusType>) => {
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
                : Colors.primary,
            },
          ]}
        />
        <AppView flex-1 padding-16 centerV>
          <AppView row>
            <AppText body2 textColor flex-1 marginR-8 numberOfLines={2}>
              {item.title}
            </AppText>
            <AppView
              bg-accent
              paddingH-8
              paddingV-4
              br100
              style={styles.habitChipContainer}>
              <AppText
                white
                sm
                regular
                numberOfLines={2}
                style={{ textTransform: 'capitalize' }}>
                {item.recurrence_type === 'none'
                  ? t('habits.recurrence.none')
                  : item.recurrence_type}
              </AppText>
            </AppView>
          </AppView>
          {!!item.description && (
            <AppText xsm textColor marginT-4 numberOfLines={3}>
              {item.description}
            </AppText>
          )}
        </AppView>
      </AppCard>
    );
  };

  return (
    <AppScreen>
      <Tabs.Screen
        options={{
          tabBarIcon: ({ color }) => (
            <AppView>
              <AppIcon size={28} name="home" color={color} />
              {nonCompletedHabits.length > 0 && (
                <AppView style={styles.customBadge} />
              )}
            </AppView>
          ),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.secondary}
          />
        }>
        <Divider />

        <AppView row centerV spread>
          <TranslatedText h2 translationKey="tabs.today" />
          <AppView center row gap-20>
            <AppButton onPress={onCalendarClick}>
              <AppIcon set="Feather" name="calendar" size={26} />
            </AppButton>
            <AppButton onPress={onNotificationsClick}>
              <AppView>
                <AppIcon name="notification" size={26} />
                {hasUnreadNotifications && (
                  <AppView style={styles.customBadge} />
                )}
              </AppView>
            </AppButton>
            <AppButton onPress={onAnchorClick}>
              <AppView>
                <AppIcon set="Feather" name="anchor" size={24} />
                {hasAnchorNotifications && (
                  <AppView style={styles.customBadge} />
                )}
              </AppView>
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

        {showSetupTask && !isLoading && !habitsLoading && (
          <AppView>
            <OnboardingSetupTask />
            <Divider />
          </AppView>
        )}

        {!isLoading && !habitsLoading && (
          <>
            {shouldShowEmptyState && renderEmptyComponent()}

            <AppView
              reanimated
              entering={Animations.Entry.FadeInDownWithSpring()}
              exiting={Animations.Exit.FadeOutDown()}>
              <AppList<HabitWithStatusType>
                keyExtractor={(i) => i.habit_id}
                data={nonCompletedHabits || []}
                renderItem={renderHabitItem}
                ListFooterComponent={() =>
                  nonCompletedHabits.length > 0 && <Divider />
                }
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
                ItemSeparatorComponent={() => <Divider />}
              />
            </AppView>
            {(completedTasks?.length > 0 || completedHabits?.length > 0) && (
              <TranslatedText
                body2
                translationKey="common.completed_tasks"
                marginV-16
              />
            )}
            {completedTasks?.length > 0 && (
              <AppList<TaskType>
                keyExtractor={(i) => i.task_id}
                data={completedTasks || []}
                renderItem={renderItem}
                ListFooterComponent={() => <Divider />}
                ItemSeparatorComponent={() => <Divider />}
              />
            )}
            {completedHabits?.length > 0 && (
              <AppList<HabitWithStatusType>
                keyExtractor={(i) => i.habit_id}
                data={completedHabits || []}
                renderItem={renderHabitItem}
                ListFooterComponent={() => <Divider />}
                ItemSeparatorComponent={() => <Divider />}
              />
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={isWeeklyModalVisible}
        backdropColor={Colors.screenBG}
        presentationStyle="pageSheet"
        animationType="slide"
        allowSwipeDismissal
        onRequestClose={() => {
          setIsWeeklyModalVisible(false);
        }}>
        <AppView
          marginT-8
          centerV
          style={{
            width: 100,
            height: 3,
            borderRadius: 10,
            backgroundColor: Colors.textColor,
            alignSelf: 'center',
          }}
        />
        <Divider marginT-16 />

        <AppList
          keyExtractor={(i) => i.task_id}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={() => (
            <AppView flex-1>
              <TranslatedText
                h3
                textColor
                translationKey="tabs.upcoming_week"
                marginB-12
              />
              {weeklyTasksLoading && (
                <AppView height={80}>
                  <Loader transparent />
                </AppView>
              )}
            </AppView>
          )}
          data={weeklyTasks || []}
          renderItem={({ item, index: idx }) => (
            <React.Fragment key={item.task_id}>
              {idx > 0 && <Divider />}
              <AppCard
                style={styles.taskCard}
                row
                centerV
                onPress={() => handleWeeklyTaskPress(item)}
                padding-0>
                <AppView
                  br40
                  style={[
                    styles.indicator,
                    {
                      backgroundColor:
                        item.status === 'completed'
                          ? Colors.success
                          : Colors.primary,
                    },
                  ]}
                />
                <AppView flex-1 padding-16>
                  <AppText body2 textColor>
                    {item.title}
                  </AppText>
                  {!!item.description && (
                    <AppText xsm textColor marginT-4 numberOfLines={3}>
                      {item.description}
                    </AppText>
                  )}
                </AppView>
              </AppCard>
            </React.Fragment>
          )}
          ListEmptyComponent={() =>
            !weeklyTasksLoading && (
              <AppView marginT-16>
                <EmptyListItemPlaceholder
                  title="onboarding.empty_state.no_weekly_tasks_title"
                  subtitle="onboarding.empty_state.no_weekly_tasks_description"
                />
              </AppView>
            )
          }
        />
      </Modal>
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
  },
  habitChipContainer: { alignSelf: 'flex-start' },
  modalOverlay: {
    flex: 1,
  },
  weeklySheetContent: {
    flex: 1,
  },
  weeklySheetContentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  customBadge: {
    position: 'absolute',
    right: -2,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 9,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
