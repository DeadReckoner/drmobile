import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Loader } from '@/components/Loader';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useGetHabitsQuery } from '@/store/apis/habitsApi';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { Animations } from '@/utils/animation.utils';
import { LegendListRenderItemProps } from '@legendapp/list';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const ArchivedHabits = () => {
  const {
    data: habits,
    isLoading,
    refetch,
    isFetching,
  } = useGetHabitsQuery({ include_archived: true });
  const archivedHabits = habits?.filter((habit) => habit.archived);
  const { t } = useLocalization();

  const renderEmptyComponent = () => {
    return (
      <EmptyListItemPlaceholder
        title="habits.no_archived_habits"
        subtitle="habits.no_archived_habits_description"
      />
    );
  };

  const renderHabitItem = ({ item }: LegendListRenderItemProps<HabitType>) => {
    return (
      <AppCard row centerV padding-0>
        <AppView flex-1 padding-16>
          <AppView row centerV spread>
            <AppText body2 textColor>
              {item.title}
            </AppText>
            <AppView bg-primary paddingH-8 paddingV-4 br100>
              <AppText textColor sm regular>
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
    );
  };

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="habits.archived_habits" />
      <Divider />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={Colors.secondary}
          />
        }>
        {isLoading ? (
          <AppView height={200} center>
            <Loader transparent />
          </AppView>
        ) : (
          <AppView
            reanimated
            entering={Animations.Entry.FadeInDownWithSpring()}
            exiting={Animations.Exit.FadeOutDown()}>
            <AppList<HabitType>
              keyExtractor={(i) => i.habit_id}
              data={archivedHabits || []}
              renderItem={renderHabitItem}
              ListEmptyComponent={renderEmptyComponent}
              ListFooterComponent={() => <Divider />}
              ItemSeparatorComponent={() => <Divider />}
            />
          </AppView>
        )}
      </ScrollView>
    </AppScreen>
  );
};

export default ArchivedHabits;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 24,
  },
  indicator: { height: '100%', width: 4 },
});
