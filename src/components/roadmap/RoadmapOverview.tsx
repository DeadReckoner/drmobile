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
  const roadmapProgress = roadmap.progress || 0;

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
            {`: ${roadmap.daysRemainingTillNextMilestone ?? 'N/A'}`}
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
            progress={roadmapProgress}
            progressColor={theme === 'dark' ? Colors.white : Colors.primary}
          />
          <AppText xsm textColor>
            {roadmapProgress}%
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
