import { AppCard } from '@/components/AppCard';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import type { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectTheme } from '@/store/slices/settingsSlice';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapOverviewProps {
  roadmap: RoadmapType;
}

export const RoadmapOverview = ({ roadmap }: RoadmapOverviewProps) => {
  const theme = useAppSelector(selectTheme);
  const currentMilestone = roadmap.milestones.find((m) => !m.reached);

  const totalMilestoneDays = currentMilestone
    ? Math.max(...currentMilestone.tasks.map((t) => t.day), 0)
    : 0;
  const completedTaskDays =
    currentMilestone?.tasks.filter((t) => t.completed).map((t) => t.day) || [];
  const lastCompletedDay = completedTaskDays.length
    ? Math.max(...completedTaskDays)
    : 0;

  const daysRemainingInMilestone = Math.max(
    totalMilestoneDays - lastCompletedDay,
    0,
  );

  const progressPecentage = (lastCompletedDay / roadmap.days) * 100;
  const progress = isNaN(progressPecentage) ? 0 : progressPecentage;

  return (
    <AppCard>
      <AppText xsm textColor>
        {roadmap.description}
      </AppText>
      <LineDivider bg-secondary />
      <AppView row centerV spread>
        <AppView row gap-2>
          <TranslatedText xsm translationKey="common.next_milestone" />
          <AppText xsm textColor>
            {`: ${daysRemainingInMilestone}`}
          </AppText>
          <TranslatedText xsm translationKey="common.days" />
        </AppView>

        <AppView row center gap-8>
          <AppProgressBar
            style={[
              styles.roadmapProgressBar,
              { backgroundColor: Colors.outline },
            ]}
            fullWidth={false}
            progress={isNaN(progress) ? 0 : progress}
            progressColor={theme === 'dark' ? Colors.white : Colors.primary}
          />
          <AppText xsm textColor>
            {isNaN(progress) ? 0 : progress}%
          </AppText>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  roadmapProgressBar: {
    height: 5,
    width: 80,
  },
});
