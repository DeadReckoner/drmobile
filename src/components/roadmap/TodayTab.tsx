import { AppCard } from '@/components/AppCard';
import { Divider } from '@/components/Divider';
import { TasksList } from '@/components/roadmap/TasksList';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useGetUserTasksByStartDateQuery } from '@/hooks/task';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { selectCurrentMilestone } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { DateUtils } from '@/utils/date.utils';
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface TodayTabProps {
  roadmap: RoadmapType;
  currentMilestone: ReturnType<typeof selectCurrentMilestone>;
  onRoadmapOverviewCardPress?: () => void;
}

export const TodayTab = ({
  roadmap,
  currentMilestone,
  onRoadmapOverviewCardPress,
}: TodayTabProps) => {
  const { t } = useLocalization();
  const { theme } = useAppTheme();
  const [currentDate] = useState(() =>
    DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
  );
  const { data } = useGetUserTasksByStartDateQuery(currentDate);
  const todayTasks = useMemo(
    () => data?.filter((task) => task.roadmap_id === roadmap.roadmap_id) || [],
    [data, roadmap.roadmap_id],
  );

  return (
    <AppView
      key="today-tab"
      flex
      reanimated
      entering={Animations.Entry.FadeInDown()}
      exiting={Animations.Exit.FadeOutDown()}>
      <AppCard onPress={onRoadmapOverviewCardPress}>
        <AppView flex gap-10>
          <AppView row centerV spread>
            <AppText subtitle1 regular textColor>
              {roadmap?.goal}
            </AppText>
          </AppView>
          <AppView row flex centerV gap-16>
            <AppText body2 regular textColor flex-0>
              {t('roadmap.progress')}:
            </AppText>
            <AppProgressBar
              style={[styles.progressBar, { backgroundColor: Colors.outline }]}
              fullWidth={true}
              progress={roadmap?.progress || 0}
              progressColor={theme === 'dark' ? Colors.white : Colors.primary}
            />
            <AppText body2 light textColor>
              {roadmap?.progress || 0}%
            </AppText>
          </AppView>
          {currentMilestone && (
            <AppView gap-4>
              <AppText body2 regular textColor style={{ lineHeight: 24 }}>
                {t('common.current_milestone')}:{' '}
                <AppText textColor body2 light>
                  {currentMilestone.sub_goal}
                </AppText>
              </AppText>
            </AppView>
          )}
        </AppView>
      </AppCard>
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
