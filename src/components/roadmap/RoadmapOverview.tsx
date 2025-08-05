import { AppCard } from '@/components/AppCard';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import type { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapOverviewProps {
  roadmap: RoadmapType;
}

export const RoadmapOverview = ({ roadmap }: RoadmapOverviewProps) => {
  const currentMilestone = roadmap.Milestones.find((m) => !m.Reached);

  const totalMilestoneDays = currentMilestone
    ? Math.max(...currentMilestone.Tasks.map((t) => t.Day), 0)
    : 0;
  const completedTaskDays =
    currentMilestone?.Tasks.filter((t) => t.Completed).map((t) => t.Day) || [];
  const lastCompletedDay = completedTaskDays.length
    ? Math.max(...completedTaskDays)
    : 0;

  const daysRemainingInMilestone = Math.max(
    totalMilestoneDays - lastCompletedDay,
    0,
  );

  const progressPecentage = (lastCompletedDay / roadmap.Days) * 100;
  const progress = isNaN(progressPecentage) ? 0 : progressPecentage;

  return (
    <AppCard>
      <AppText xsm textColor>
        {roadmap.Description}
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
              { backgroundColor: Colors.highlight },
            ]}
            fullWidth={false}
            progress={isNaN(progress) ? 0 : progress}
            progressColor={Colors.primary}
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
