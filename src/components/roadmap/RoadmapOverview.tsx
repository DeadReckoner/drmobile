import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import type { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapOverviewProps {
  roadmap: RoadmapType;
  toggleEditMode: () => void;
  readonly?: boolean;
}

export const RoadmapOverview = ({
  roadmap,
  toggleEditMode,
  readonly = false,
}: RoadmapOverviewProps) => {
  const { theme } = useAppTheme();
  const roadmapProgress = roadmap.progress || 0;

  return (
    <AppCard>
      <AppView row>
        <AppText flex body2 light textColor marginR-16>
          {roadmap.description}
        </AppText>
        {!readonly && (
          <AppButton onPress={toggleEditMode}>
            <AppIcon set="Feather" name={'edit'} size={20} />
          </AppButton>
        )}
      </AppView>
      <LineDivider bg-secondary />
      <AppView row centerV spread>
        <AppView row gap-2>
          <TranslatedText light translationKey="common.next_milestone" />
          <AppText body2 light textColor>
            {`: ${roadmap.daysRemainingTillNextMilestone || 0}`}{' '}
            <TranslatedText light translationKey="common.days" />
          </AppText>
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
          <AppText body2 light textColor>
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
