import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { Loader } from '@/components/Loader';
import { TasksList } from '@/components/roadmap/TasksList';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { RoadmapType, TaskType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { selectCurrentMilestone } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface TodayTabProps {
  roadmap: RoadmapType;
  currentMilestone: ReturnType<typeof selectCurrentMilestone>;
  todayTasks: TaskType[];
  isRoadmapFeching?: boolean;
  onRoadmapOverviewCardPress?: () => void;
}

export const TodayTab = ({
  roadmap,
  currentMilestone,
  todayTasks = [],
  isRoadmapFeching,
  onRoadmapOverviewCardPress,
}: TodayTabProps) => {
  const { t } = useLocalization();
  const { theme } = useAppTheme();
  return (
    <AppView
      key="today-tab"
      flex
      useSafeArea
      reanimated
      entering={Animations.Entry.FadeInDown()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard onPress={onRoadmapOverviewCardPress}>
        <AppView flex gap-12>
          <AppView row centerV spread>
            <AppText subtitle1 regular textColor>
              {roadmap?.goal}
            </AppText>
          </AppView>
          <AppView row flex centerV gap-16>
            <AppText body1 light textColor flex-0>
              {t('roadmap.progress')}:
            </AppText>
            <AppProgressBar
              style={[styles.progressBar, { backgroundColor: Colors.outline }]}
              fullWidth={true}
              progress={roadmap?.progress || 0}
              progressColor={theme === 'dark' ? Colors.white : Colors.primary}
            />
            <AppText body1 light textColor>
              {roadmap?.progress || 0}%
            </AppText>
          </AppView>
          {currentMilestone && (
            <AppView gap-4>
              <AppText body1 light textColor>
                {t('common.current_milestone')}: {currentMilestone.sub_goal}
              </AppText>
            </AppView>
          )}
        </AppView>
      </AppCard>
      {isRoadmapFeching && todayTasks.length === 0 && (
        <AppView height={30} marginT-16>
          <Loader transparent />
        </AppView>
      )}
      <Divider />
      <TasksList tasks={todayTasks} />
    </AppView>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '50%',
  },
});
