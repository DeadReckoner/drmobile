import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { ArchivedHabitItem } from '@/components/settings/ArchivedHabitsItem';
import { HabitType } from '@/store/apis/types/habitsApi.types';
import { LegendListRenderItemProps } from '@legendapp/list';
import React from 'react';

const ArchivedHabits = ({ habits }: { habits: HabitType[] }) => {
  const archivedHabits = habits?.filter((habit) => habit.archived);

  const renderEmptyComponent = () => {
    return (
      <EmptyListItemPlaceholder
        title="habits.no_archived_habits"
        subtitle="habits.no_archived_habits_description"
      />
    );
  };

  const renderHabitItem = ({ item }: LegendListRenderItemProps<HabitType>) => (
    <ArchivedHabitItem habit={item} />
  );

  return (
    <AppList<HabitType>
      keyExtractor={(i) => i.habit_id}
      data={archivedHabits || []}
      renderItem={renderHabitItem}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={() => <Divider />}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

export default ArchivedHabits;
