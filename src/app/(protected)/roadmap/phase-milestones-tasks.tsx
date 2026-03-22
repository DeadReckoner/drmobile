import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AppText, AppView } from '@/components/ui';
import { TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setSelectedTaskAction } from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import { Dimensions, ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const WINDOW_HEIGHT = Dimensions.get('window').height;

const PhaseMilestonesTasks = () => {
  const params = useLocalSearchParams<{ tasks: string }>();
  const { t } = useLocalization();
  const scrollViewRef = useRef<ScrollView>(null);
  const dispatch = useAppDispatch();
  const tasks = useMemo(() => {
    try {
      return JSON.parse(params.tasks) as TaskType[];
    } catch {
      return [];
    }
  }, [params.tasks]);

  const currentTask = tasks.find((m) => !m.completed);

  const scrollToCurrentTask = useCallback((y: number, height: number) => {
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, y - 80 - WINDOW_HEIGHT / 2 + height / 2),
      animated: true,
    });
  }, []);

  const renderItem = ({ item, index }: { item: TaskType; index: number }) => (
    <AppCard
      onPress={() => {
        dispatch(setSelectedTaskAction({ task: item }));
        router.navigate({
          pathname: '/task/today-task-details',
        });
      }}
      style={{
        borderWidth: 3,
        borderColor:
          item.task_id === currentTask?.task_id ? Colors.accent : 'transparent',
      }}>
      <AppView gap-4>
        <AppText body1 textColor>
          {t('common.task')} {index + 1}: {item.title}
        </AppText>
        <AppText xsm textColor>
          {t('common.description')}: {item.description}
        </AppText>
        {item.date && (
          <AppText xsm textColor>
            {t('common.date')}: {DateUtils.formatDate(item.date)}
          </AppText>
        )}
      </AppView>
    </AppCard>
  );

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.tasks" />
      <Divider />
      <AppList
        refScrollView={scrollViewRef}
        data={tasks}
        ItemSeparatorComponent={() => <Divider />}
        onLayout={
          currentTask
            ? (e) => {
                const { y, height } = e.nativeEvent.layout;
                scrollToCurrentTask(y, height);
              }
            : undefined
        }
        renderItem={renderItem}
      />
    </AppScreen>
  );
};

export default PhaseMilestonesTasks;
