import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LevelBadge } from '@/components/roadmap/LevelBadge';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import {
  MilestoneType,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentItem } from '@/hooks/useScrollToCurrentItem';
import { DateUtils } from '@/utils/date.utils';
import {
  buildBadgeLabel,
  calculateMilestoneProgress,
  findOngoingMilestone,
  getAllMilestones,
} from '@/utils/roadmap.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const ReadonlyPhaseMilestones = () => {
  const params = useLocalSearchParams<{
    roadmap: string;
    phaseId?: string;
    phaseLabel?: string;
  }>();
  const { t } = useLocalization();
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);

  useEffect(() => {
    if (params.roadmap) {
      try {
        setRoadmap(JSON.parse(params.roadmap));
      } catch {}
    }
  }, [params.roadmap]);

  const milestones = useMemo(() => {
    if (!roadmap) return [];
    if (roadmap.type === 'custom_made') {
      return roadmap.milestones || [];
    }
    if (params.phaseId) {
      const phase = (roadmap.phases ?? []).find(
        (p) => p.phase_id === params.phaseId,
      );
      return phase?.milestones ?? [];
    }
    return getAllMilestones(roadmap);
  }, [roadmap, params.phaseId]);

  const currentMilestone = useMemo(
    () => findOngoingMilestone(milestones),
    [milestones],
  );

  const { scrollViewRef, onCurrentItemLayout } =
    useScrollToCurrentItem(!!currentMilestone);

  const renderMilestoneItem = ({
    item,
  }: {
    item: MilestoneType;
    index: number;
  }) => {
    const milestoneNumber = item.order_index;
    const badgeLabel = buildBadgeLabel({
      phase: params.phaseLabel,
      milestone: milestoneNumber,
    });
    const isCurrentMilestone =
      item.milestone_id === currentMilestone?.milestone_id;
    const badgeStatus = item.status;
    const itemProgress = calculateMilestoneProgress(item);

    return (
      <AppCard
        onPress={() => {
          router.navigate({
            pathname: '/settings/readonly-phase-milestones-tasks',
            params: {
              tasks: JSON.stringify(item.tasks ?? []),
              phaseLabel: params.phaseLabel,
              milestoneLabel: milestoneNumber,
            },
          });
        }}
        style={{
          borderWidth: 3,
          borderColor: isCurrentMilestone ? Colors.accent : 'transparent',
        }}>
        <AppView gap-8>
          <AppView row top>
            <AppText body1 textColor flex>
              {item.sub_goal}
            </AppText>
            <LevelBadge
              label={badgeLabel}
              status={isCurrentMilestone ? 'in_progress' : badgeStatus}
            />
          </AppView>
          <AppText xsm textColor>
            {t('common.description')}: {item.description}
          </AppText>
          {item.date && (
            <AppText xsm textColor>
              {t('common.date')}: {DateUtils.formatDate(item.date)}
            </AppText>
          )}
          <AppView row centerV gap-8>
            <AppProgressBar
              style={[styles.progressBar, { backgroundColor: Colors.outline }]}
              fullWidth={false}
              progress={itemProgress}
              progressColor={Colors.textColor}
            />
            <AppText xsm secondary>
              {itemProgress}%
            </AppText>
          </AppView>
        </AppView>
      </AppCard>
    );
  };

  const onLayout: ((_event: LayoutChangeEvent) => void) | undefined =
    currentMilestone
      ? (e) => {
          const { y, height } = e.nativeEvent.layout;
          onCurrentItemLayout(y, height);
        }
      : undefined;

  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="common.milestones" />
      <Divider />
      <AppList
        keyExtractor={(i) => i.milestone_id}
        refScrollView={scrollViewRef}
        data={milestones}
        ItemSeparatorComponent={() => <Divider />}
        onLayout={onLayout}
        renderItem={renderMilestoneItem}
      />
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: 6,
  },
});

export default ReadonlyPhaseMilestones;
