import { OverviewCard } from '@/components/roadmap/OverviewCard';
import { SectionHeader } from '@/components/roadmap/SectionHeader';
import { AppView } from '@/components/ui';
import type {
  MilestoneType,
  Phase,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import {
  buildBadgeLabel,
  calculateMilestoneProgress,
  calculatePhaseProgress,
  findOngoingMilestone,
  findOngoingPhase,
} from '@/utils/roadmap.utils';
import { JSX, useMemo } from 'react';
import { View } from 'react-native';

interface RoadmapCurrentStateOverviewProps {
  roadmap: RoadmapType;
  roadmapCreateStartControls: JSX.Element | null;
  onOverviewPress?: (_currentPhase?: Phase) => void;
  onPhasePress?: (_phase: Phase) => void;
  onMilestonePress?: (_milestone: MilestoneType, _currentPhase?: Phase) => void;
  onOverviewCardRef?: (_ref: View | null) => void;
  onPhaseCardRef?: (_ref: View | null) => void;
  onMilestoneCardRef?: (_ref: View | null) => void;
}

export const RoadmapCurrentStateOverview = ({
  roadmap,
  roadmapCreateStartControls,
  onOverviewPress,
  onPhasePress,
  onMilestonePress,
  onOverviewCardRef,
  onPhaseCardRef,
  onMilestoneCardRef,
}: RoadmapCurrentStateOverviewProps) => {
  const { t } = useLocalization();

  const currentPhase = useMemo<Phase | undefined>(
    () => findOngoingPhase(roadmap.phases ?? []),
    [roadmap.phases],
  );

  const currentMilestone = useMemo<MilestoneType | undefined>(() => {
    if (roadmap.type === 'custom_made') {
      return findOngoingMilestone(roadmap.milestones ?? []);
    }
    return currentPhase && findOngoingMilestone(currentPhase.milestones ?? []);
  }, [currentPhase, roadmap.type, roadmap.milestones]);

  const phaseProgress = useMemo(
    () => (currentPhase ? calculatePhaseProgress(currentPhase) : 0),
    [currentPhase],
  );

  const milestoneProgress = useMemo(
    () => (currentMilestone ? calculateMilestoneProgress(currentMilestone) : 0),
    [currentMilestone],
  );

  return (
    <AppView>
      <View ref={onOverviewCardRef}>
        <SectionHeader label={t('common.overview')} />
        <OverviewCard
          title={roadmap.goal}
          description={roadmap.description}
          progress={roadmap.progress ?? 0}
          tooltipText={t('common.overview_tooltip')}
          onPress={() => onOverviewPress && onOverviewPress(currentPhase)}
        />
      </View>
      {roadmapCreateStartControls}
      {currentPhase && (
        <View ref={onPhaseCardRef}>
          <SectionHeader label={t('common.current_phase')} />
          <OverviewCard
            title={currentPhase.name}
            description={currentPhase.description}
            progress={phaseProgress}
            tooltipText={t('common.phase_tooltip')}
            badgeLabel={buildBadgeLabel({ phase: currentPhase.order_index })}
            badgeStatus="in_progress"
            onPress={
              onPhasePress ? () => onPhasePress(currentPhase) : undefined
            }
          />
        </View>
      )}

      {currentMilestone && (
        <View ref={onMilestoneCardRef}>
          <SectionHeader label={t('common.current_milestone')} />
          <OverviewCard
            title={`${currentMilestone.sub_goal}`}
            description={currentMilestone.description}
            progress={milestoneProgress}
            tooltipText={t('common.milestone_tooltip')}
            badgeLabel={buildBadgeLabel({
              phase: currentPhase?.order_index,
              milestone: currentMilestone.order_index,
            })}
            badgeStatus="in_progress"
            onPress={
              onMilestonePress
                ? () => onMilestonePress(currentMilestone, currentPhase)
                : undefined
            }
          />
        </View>
      )}
    </AppView>
  );
};
