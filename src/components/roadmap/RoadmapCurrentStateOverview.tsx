import { OverviewCard } from '@/components/roadmap/OverviewCard';
import { SectionHeader } from '@/components/roadmap/SectionHeader';
import { AppView } from '@/components/ui';
import type {
  MilestoneType,
  Phase,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useMemo } from 'react';

interface RoadmapCurrentStateOverviewProps {
  roadmap: RoadmapType;
  onOverviewPress?: (_currentPhase: Phase | null) => void;
  onPhasePress?: (_phase: Phase) => void;
  onMilestonePress?: (_milestone: MilestoneType) => void;
}

const calculatePhaseProgress = (phase: Phase): number => {
  const milestones = phase.milestones ?? [];
  if (milestones.length === 0) return 0;
  const reached = milestones.filter((m) => m.reached).length;
  return Math.floor((reached / milestones.length) * 100);
};

const calculateMilestoneProgress = (milestone: MilestoneType): number => {
  const tasks = milestone.tasks ?? [];
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) =>
    t.steps?.length ? t.steps.every((s) => s.completed) : t.completed,
  ).length;
  return Math.floor((completed / tasks.length) * 100);
};

export const RoadmapCurrentStateOverview = ({
  roadmap,
  onOverviewPress,
  onPhasePress,
  onMilestonePress,
}: RoadmapCurrentStateOverviewProps) => {
  const { t } = useLocalization();

  const currentPhase = useMemo<Phase | null>(() => {
    const phases = roadmap.phases ?? [];
    return (
      phases.find((p) => p.milestones?.some((m) => !m.reached)) ??
      phases[0] ??
      null
    );
  }, [roadmap.phases]);

  const currentMilestoneData = useMemo<{
    milestone: MilestoneType | null;
    index: number;
  }>(() => {
    if (currentPhase) {
      const milestones = currentPhase.milestones ?? [];
      const index = milestones.findIndex((m) => !m.reached);
      if (index !== -1) {
        return { milestone: milestones[index], index: index + 1 };
      }
      return milestones[0]
        ? { milestone: milestones[0], index: 1 }
        : { milestone: null, index: 0 };
    }
    const milestones = roadmap.milestones ?? [];
    const index = milestones.findIndex((m) => !m.reached);
    if (index !== -1) {
      return { milestone: milestones[index], index: index + 1 };
    }
    return milestones[0]
      ? { milestone: milestones[0], index: 1 }
      : { milestone: null, index: 0 };
  }, [currentPhase, roadmap.milestones]);

  const currentMilestone = currentMilestoneData.milestone;
  const currentMilestoneIndex = currentMilestoneData.index;

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
      <SectionHeader label={t('common.overview')} />
      <OverviewCard
        title={roadmap.goal}
        description={roadmap.description}
        progress={roadmap.progress ?? 0}
        tooltipText={t('common.overview_tooltip')}
        onPress={() => onOverviewPress && onOverviewPress(currentPhase)}
      />

      {currentPhase && (
        <>
          <SectionHeader label={t('common.current_phase')} />
          <OverviewCard
            title={currentPhase.name}
            description={currentPhase.description}
            progress={phaseProgress}
            tooltipText={t('common.phase_tooltip')}
            onPress={
              onPhasePress ? () => onPhasePress(currentPhase) : undefined
            }
          />
        </>
      )}

      {currentMilestone && (
        <>
          <SectionHeader label={t('common.current_milestone')} />
          <OverviewCard
            title={`${t('common.milestone')} ${currentMilestoneIndex}: ${currentMilestone.sub_goal}`}
            description={currentMilestone.description}
            progress={milestoneProgress}
            tooltipText={t('common.milestone_tooltip')}
            onPress={
              onMilestonePress
                ? () => onMilestonePress(currentMilestone)
                : undefined
            }
          />
        </>
      )}
    </AppView>
  );
};
