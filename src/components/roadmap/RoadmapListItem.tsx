import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { AppImage, AppProgressBar, AppText, AppView } from '@/components/ui';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isRoadmapStarted } from '@/utils/roadmap.utils';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Assets, Colors } from 'react-native-ui-lib';

interface RoadmapListItemProps {
  onPress: (_roadmap: RoadmapType) => void;
  roadmap: RoadmapType;
  showProgress?: boolean;
}

export const RoadmapListItem = ({
  onPress,
  roadmap,
  showProgress,
}: RoadmapListItemProps) => {
  const { t } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard paddingV-20 onPress={onPress}>
      <AppView row gap-16>
        <AppView bg-primary br30 center style={styles.iconContainer}>
          {roadmap.type === 'ai_generated' && (
            <AppImage
              style={[StyleSheet.absoluteFillObject]}
              source={Assets.logo.aiRoadmapBG}
            />
          )}
          <AppIcon set="Feather" name="map" color={Colors.white} />
        </AppView>
        <AppView flex gap-8>
          <AppText body1 textColor>
            {roadmap.goal}
          </AppText>
          <AppText xsm textColor>
            {t('common.next_milestone')}:{' '}
            {roadmap.daysRemainingTillNextMilestone || 0} {t('common.days')}
          </AppText>
          <AppView row centerV>
            {showProgress && (
              <AppView row gap-8 centerV flex-1>
                <AppProgressBar
                  style={[
                    styles.roadmapProgressBar,
                    { backgroundColor: Colors.outline },
                  ]}
                  fullWidth={true}
                  progress={roadmap.progress}
                  progressColor={
                    theme === 'dark' ? Colors.white : Colors.primary
                  }
                />

                <AppText xsm textColor>
                  {roadmap.progress || 0}%
                </AppText>
              </AppView>
            )}
            {!isRoadmapStarted(roadmap) && (
              <AppIcon name="clockcircleo" size={20} />
            )}
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
