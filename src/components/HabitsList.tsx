import { AppActionSheetModal } from '@/components/AppActionSheetModal';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import {
  useArchiveHabitMutation,
  useDeleteHabitMutation,
  useGetHabitsQuery,
} from '@/store/apis/habitsApi';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedHabit } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

export const HabitsList = () => {
  const { data, isLoading, isFetching } = useGetHabitsQuery({
    include_archived: false,
  });

  const { showToast } = useToast();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();

  const [selectedHabit, setSelectedLocalHabit] = useState<HabitType | null>(
    null,
  );
  const [isHabitModalVisible, setIsHabitModalVisible] = useState(false);

  const [archiveHabit, { isLoading: isArchivingHabit }] =
    useArchiveHabitMutation();
  const [deleteHabit, { isLoading: isDeletingHabit }] =
    useDeleteHabitMutation();

  const handleHabitClick = (habit: HabitType) => {
    setIsHabitModalVisible(true);
    setSelectedLocalHabit(habit);
    dispatch(setSelectedHabit(habit));
  };

  const handleCloseHabitModal = () => {
    setIsHabitModalVisible(false);
  };

  const handleEditHabit = () => {
    if (!selectedHabit) return;
    handleCloseHabitModal();
    router.push({
      pathname: '/habits/add-edit-habits-task',
      params: {
        mode: 'edit',
        habitId: selectedHabit.habit_id,
        isHabitEditing: 'true',
      },
    });
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
    } finally {
      setSelectedLocalHabit(null);
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
    } finally {
      setSelectedLocalHabit(null);
    }
  };

  const isHabitOperationsInProgress = isArchivingHabit || isDeletingHabit;

  const HABITS_ACTIONS = [
    {
      label: t('habits.update_habit'),
      onPress: handleEditHabit,
      disabled: isHabitOperationsInProgress,
      icon: <AppIcon set="Feather" name="edit" size={20} />,
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
        title="tabs.today_tab.no_habits_yet"
        subtitle="tabs.today_tab.no_habits_description"
      />
    );
  };

  const renderHabitItem = ({ item }: LegendListRenderItemProps<HabitType>) => {
    return (
      <>
        <AppCard
          disabled={isHabitOperationsInProgress}
          style={styles.habitCard}
          row
          onPress={() => handleHabitClick(item)}>
          {selectedHabit?.habit_id === item.habit_id &&
            isHabitOperationsInProgress && (
              <AppView
                absF
                br40
                style={{
                  overflow: 'hidden',
                  zIndex: 10,
                }}
                reanimated
                entering={Animations.Entry.FadeInDown()}
                exiting={Animations.Exit.FadeOutDown()}>
                <Loader />
              </AppView>
            )}
          <AppView flex-1>
            <AppView row centerV flex-1 gap-4>
              <AppText body2 textColor flex-1>
                {item.title}
              </AppText>
              <AppView bg-primary paddingH-8 paddingV-4 br100>
                <AppText
                  textColor
                  sm
                  regular
                  style={{ textTransform: 'capitalize' }}>
                  {item.recurrence_type === 'none'
                    ? t('habits.recurrence.none')
                    : item.recurrence_type}
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
      </>
    );
  };

  return (
    <>
      <AppView
        pointerEvents={isFetching ? 'none' : 'auto'}
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}
        exiting={Animations.Exit.FadeOutDown()}>
        <AppList<HabitType>
          scrollEnabled={false}
          keyExtractor={(i) => i.habit_id}
          data={data || []}
          extraData={[selectedHabit, isArchivingHabit, isDeletingHabit]}
          renderItem={renderHabitItem}
          ListFooterComponent={() => <Divider />}
          ItemSeparatorComponent={() => <Divider />}
          ListEmptyComponent={() =>
            !isLoading && !isFetching && renderEmptyComponent()
          }
        />
      </AppView>

      <AppActionSheetModal
        visible={isHabitModalVisible}
        title={selectedHabit?.title}
        onDismiss={handleCloseHabitModal}
        options={HABITS_ACTIONS}
      />
    </>
  );
};

const styles = StyleSheet.create({
  indicator: { height: '100%', width: 4 },
  habitCard: {
    overflow: 'hidden',
  },
});
