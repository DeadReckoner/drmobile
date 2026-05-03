import { AppCard } from '@/components/AppCard';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LineDivider } from '@/components/LineDivider';
import { StepsList } from '@/components/roadmap/StepsList';
import { UnorderedList } from '@/components/roadmap/UnorderedList';
import { AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const ReadonlyTaskDetails = () => {
  const params = useLocalSearchParams<{ task: string }>();
  const [task, setTask] = useState<TaskType | null>(null);

  useEffect(() => {
    if (params.task) {
      try {
        setTask(JSON.parse(params.task));
      } catch {}
    }
  }, [params.task]);

  const dependencies = useMemo(() => {
    if (!task?.dependencies) return 'N/A';
    try {
      const parsed = JSON.parse(task.dependencies);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {}
    return 'N/A';
  }, [task?.dependencies]);

  if (!task) return null;

  return (
    <AppScreen>
      <ScrollView
        contentInsetAdjustmentBehavior="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <AppView row spread centerV>
          <HeaderWithBack />
        </AppView>
        <Divider />
        <AppCard>
          <AppText body1 textColor>
            {task.title}
          </AppText>
          <LineDivider marginV-12 />
          <AppText captionLight textColor>
            {task.description}
          </AppText>
          {!!task.rationale && (
            <>
              <Divider margin-4 />
              <UnorderedList
                data={[
                  {
                    title: 'common.why_it_is_needed',
                    value: task.rationale || 'N/A',
                  },
                  {
                    title: 'common.estimated_time',
                    value: `${task.est_minutes || 0} mins`,
                  },
                  {
                    title: 'common.dependencies',
                    value: dependencies,
                  },
                ]}
              />
            </>
          )}
        </AppCard>
        <Divider />
        <AppView style={styles.childContentContainer}>
          {!!task.milestone_id && (
            <StepsList mode="readonly" steps={task.steps || []} />
          )}
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default ReadonlyTaskDetails;

const styles = StyleSheet.create({
  childContentContainer: {
    minHeight: 100,
  },
  scrollContainer: { paddingBottom: 60 },
});
