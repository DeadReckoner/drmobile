import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface RoadmapListItemProps {
  onPress: (_roadmap: RoadmapType) => void;
  roadmap: RoadmapType;
}

export const RoadmapListItem = ({ onPress, roadmap }: RoadmapListItemProps) => {
  const { t } = useLocalization();
  const { theme } = useAppTheme();
  return (
    <AppCard paddingV-20 onPress={onPress}>
      <AppView row gap-16>
        <AppView bg-primary br30 center style={styles.iconContainer}>
          <AppIcon set="Feather" name="map" color={Colors.white} />
        </AppView>
        <AppView flex gap-8>
          <AppText body1 textColor>
            {roadmap.goal}
          </AppText>
          <AppText xsm textColor>
            {t('common.next_milestone')}:{' '}
            {roadmap.daysRemainingTillNextMilestone} {t('common.days')}
          </AppText>
          <AppView row gap-8 centerV>
            <AppProgressBar
              style={[
                styles.roadmapProgressBar,
                { backgroundColor: Colors.outline },
              ]}
              fullWidth={true}
              progress={roadmap.progress}
              progressColor={theme === 'dark' ? Colors.white : Colors.primary}
            />
            <AppText xsm textColor>
              {roadmap.progress}%
            </AppText>
          </AppView>
        </AppView>
      </AppView>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  iconContainer: { width: 50, height: 50 },
  roadmapProgressBar: {
    height: 5,
    width: '60%',
  },
});
