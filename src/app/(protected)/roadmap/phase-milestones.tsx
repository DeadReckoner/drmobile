import { AppCard } from '@/components/AppCard';
import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { LevelBadge } from '@/components/roadmap/LevelBadge';
import { AppProgressBar, AppText, AppView } from '@/components/ui';
import { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useScrollToCurrentItem } from '@/hooks/useScrollToCurrentItem';
import { useAppSelector } from '@/store/hooks/store.hooks';
import {
  selectDraftRoadmap,
  selectPhaseMilestones,
} from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import {
  buildBadgeLabel,
  calculateMilestoneProgress,
  findOngoingMilestone,
} from '@/utils/roadmap.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const PhaseMilestones = () => {
  const params = useLocalSearchParams<{
    phaseId: string;
    phaseLabel?: string;
  }>();
  const { t } = useLocalization();
  const roadmap = useAppSelector(selectDraftRoadmap);
  const selector = useMemo(
    () => selectPhaseMilestones(params.phaseId),
    [params.phaseId],
  );
  const phaseMilestonesFromSelector = useAppSelector(selector);

  const milestones = useMemo(
    () =>
      roadmap.type === 'custom_made'
        ? roadmap.milestones || []
        : phaseMilestonesFromSelector,
    [roadmap.type, roadmap.milestones, phaseMilestonesFromSelector],
  );

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

    const onMilestonePress = () => {
      router.navigate({
        pathname: '/roadmap/phase-milestones-tasks',
        params: {
          milestoneId: item.milestone_id,
          phaseId: params.phaseId,
          phaseLabel: params.phaseLabel,
          milestoneLabel: milestoneNumber,
          milestone: JSON.stringify(item),
        },
      });
    };

    return (
      <AppCard
        onPress={onMilestonePress}
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

export default PhaseMilestones;

const styles = StyleSheet.create({
  progressBar: {
    flex: 1,
    height: 6,
  },
});
