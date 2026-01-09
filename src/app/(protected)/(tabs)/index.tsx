import { AppActionSheetModal } from '@/components/AppActionSheetModal';
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
import { useLocalization } from '@/hooks/useLocalization';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/useToast';
import {
  useArchiveHabitMutation,
  useCompleteHabitMutation,
  useDeleteHabitMutation,
  useGetHabitsQuery,
} from '@/store/apis/habitsApi';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import {
  setSelectedTaskAction,
  setShouldSyncWithServerAction,
} from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { DateUtils } from '@/utils/date.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
    // } = useGetTodayHabitsQuery();
  } = useGetHabitsQuery({ include_archived: false });

  const dispatch = useAppDispatch();
  const { requestPermissions } = usePushNotifications();
  const { showToast } = useToast();
  const { t } = useLocalization();

  const [selectedHabit, setSelectedHabit] = useState<HabitType | null>(null);
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);

  const [completeHabit, { isLoading: isCompletingHabit }] =
    useCompleteHabitMutation();
  const [archiveHabit, { isLoading: isArchivingHabit }] =
    useArchiveHabitMutation();
  const [deleteHabit, { isLoading: isDeletingHabit }] =
    useDeleteHabitMutation();

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

  const handleHabitClick = (habit: HabitType) => {
    setSelectedHabit(habit);
    setIsHabitModalVisible(true);
  };

  const handleCloseHabitModal = () => {
    setIsHabitModalVisible(false);
    setSelectedHabit(null);
  };

  const handleMarkCompleted = async () => {
    if (!selectedHabit) return;

    try {
      await completeHabit({
        habit_id: selectedHabit.habit_id,
        date: DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
      }).unwrap();

      showToast({
        message: t('habits.marked_completed_for_today'),
        type: 'success',
      });
      handleCloseHabitModal();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
    }
  };

  const handleArchiveHabit = async () => {
    if (!selectedHabit) return;

    try {
      await archiveHabit(selectedHabit.habit_id).unwrap();

      showToast({
        message: t('habits.archived_successfully'),
        type: 'success',
      });
      handleCloseHabitModal();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
    }
  };

  const handleDeleteHabit = async () => {
    if (!selectedHabit) return;

    try {
      await deleteHabit(selectedHabit.habit_id).unwrap();

      showToast({
        message: t('habits.deleted_successfully'),
        type: 'success',
      });
      handleCloseHabitModal();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error),
        type: 'failure',
      });
    }
  };
  const isHabitOperationsInProgress =
    isCompletingHabit || isArchivingHabit || isDeletingHabit;

  const HABITS_ACTIONS = [
    {
      label: t('habits.mark_complete'),
      onPress: handleMarkCompleted,
      disabled: isHabitOperationsInProgress,
      icon: true && (
        <AppIcon set="Ionicons" name="checkmark-circle" size={20} />
      ),
    },
    {
      label: t('habits.archive_habit'),
      onPress: handleArchiveHabit,
      disabled: isHabitOperationsInProgress,
      icon: <AppIcon set="Ionicons" name="archive" size={18} />,
    },
    {
      label: t('habits.delete_habit'),
      onPress: handleDeleteHabit,
      disabled: isHabitOperationsInProgress || isDeletingHabit,
      icon: <AppIcon name="delete" size={20} color={Colors.error} />,
    },
  ];

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

  const renderHabitItem = ({ item }: LegendListRenderItemProps<HabitType>) => {
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
              backgroundColor: Colors.secondary,
            },
          ]}
        />
        <AppView flex-1 padding-16>
          <AppView row centerV spread>
            <AppText body2 textColor>
              {item.title}
            </AppText>
            <AppView bg-primary paddingH-8 paddingV-4 br100>
              <AppText textColor sm regular>
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
        {habitsLoading ||
          (isLoading && (
            <AppView height={80}>
              <Loader transparent />
            </AppView>
          ))}

        {(!data || data?.length === 0) &&
          !isLoading &&
          (!habitsData || habitsData?.length === 0) &&
          !habitsLoading &&
          renderEmptyComponent()}

        <AppView
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring()}
          exiting={Animations.Exit.FadeOutDown()}>
          <AppList<HabitType>
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

      <AppActionSheetModal
        visible={isHabitModalVisible}
        title={selectedHabit?.title}
        onDismiss={handleCloseHabitModal}
        options={HABITS_ACTIONS}
      />

      {(isCompletingHabit || isArchivingHabit || isDeletingHabit) && (
        <AppView
          reanimated
          entering={Animations.Entry.FadeInDown()}
          exiting={Animations.Exit.FadeOutDown()}
          absF
          center
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
          }}>
          <Loader />
        </AppView>
      )}
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
});
