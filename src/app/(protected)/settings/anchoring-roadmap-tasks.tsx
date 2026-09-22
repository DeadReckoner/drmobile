import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { RoadmapNudgeButton } from '@/components/roadmap/RoadmapNudgeButton';
import { AppCheckbox, AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { consumeTasks } from '@/utils/roadmapTransfer';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

const AnchoringRoadmapTasks = () => {
  const params = useLocalSearchParams<{ goal?: string; roadmapId?: string }>();

  const [tasks] = useState<TaskType[]>(() => {
    const transferred = consumeTasks();
    return transferred ?? [];
  });

  const renderItem = ({ item }: { item: TaskType }) => (
    <AppCard>
      <AppView row flex>
        <AppView marginT-4>
          <AppCheckbox value={item.status === 'completed'} />
        </AppView>
        <Divider />
        <AppView gap-4 flex>
          <AppText body2 textColor numberOfLines={2}>
            {item.title}
          </AppText>
          {!!item.description && (
            <AppText xsm secondary numberOfLines={3}>
              {item.description}
            </AppText>
          )}
        </AppView>
      </AppView>
    </AppCard>
  );

  return (
    <AppScreen safeArea>
      <HeaderWithBack />
      <Divider />
      <AppList
        keyExtractor={(i) => i.task_id}
        data={tasks}
        contentContainerStyle={styles.scrollContainer}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <EmptyListItemPlaceholder
            title="roadmap.no_tasks_today"
            subtitle="roadmap.no_tasks_today_description"
          />
        )}
      />
      {!!params?.roadmapId && (
        <RoadmapNudgeButton roadmapId={params?.roadmapId} />
      )}
    </AppScreen>
  );
};

export default AnchoringRoadmapTasks;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
});
