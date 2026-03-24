import type {
  MilestoneType,
  Phase,
  RoadmapType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';

/**
 * Universal helper to get all milestones from a roadmap, regardless of type.
 * - AI-generated roadmaps: milestones are in phases
 * - Custom/manual roadmaps: milestones are in top-level array
 */
export const getAllMilestones = (roadmap: RoadmapType): MilestoneType[] => {
  if (roadmap.phases && roadmap.phases.length > 0) {
    // AI-generated: get from phases
    return roadmap.phases.flatMap((phase) => phase.milestones || []);
  }
  // Custom/manual: use top-level array
  return roadmap.milestones || [];
};

const UNSET_DATE = '0001-01-01T00:00:00Z';

export const isRoadmapStarted = (roadmap: RoadmapType): boolean => {
  const milestones = getAllMilestones(roadmap);
  return (
    roadmap.start_date !== UNSET_DATE &&
    roadmap.start_date !== null &&
    milestones?.[0]?.date !== UNSET_DATE &&
    milestones?.[0]?.date !== null
  );
};

export const structureRoadmapApiPayload = (roadmap: Partial<RoadmapType>) => {
  return removeIds(roadmap);
};

export const calculatePhaseProgress = (phase: Phase): number => {
  const milestones = phase.milestones ?? [];
  if (milestones.length === 0) return 0;
  // Support both new status field and legacy reached field
  const reached = milestones.filter(
    (m) => m.status === 'completed' || m.reached,
  ).length;
  return Math.floor((reached / milestones.length) * 100);
};

export const calculateMilestoneProgress = (
  milestone: MilestoneType,
): number => {
  const tasks = milestone.tasks ?? [];
  if (tasks.length === 0) return 0;
  // Support both new status field and legacy completed field
  const completed = tasks.filter(
    (t: TaskType) => t.status === 'completed' || t.completed,
  ).length;
  return Math.floor((completed / tasks.length) * 100);
};

interface BadgeLabelParts {
  phase?: number | string;
  milestone?: number | string;
  task?: number | string;
}

const isValidValue = (value: number | string | undefined): boolean =>
  value !== undefined && value !== null && value !== '';

export const buildBadgeLabel = ({
  phase,
  milestone,
  task,
}: BadgeLabelParts): string => {
  const parts: string[] = [];
  if (isValidValue(phase)) parts.push(`P${phase}`);
  if (isValidValue(milestone)) parts.push(`M${milestone}`);
  if (isValidValue(task)) parts.push(`T${task}`);
  return parts.join('-');
};

/**
 * Centralised "ongoing" finders.
 * Prefers items with status 'in_progress', but falls back to first non-completed item
 * for backwards compatibility with data that may not have status field set.
 */
export const findOngoingPhase = (phases: Phase[]): Phase | undefined => {
  // First try to find one explicitly marked as in_progress
  const inProgress = phases.find((p) => p.status === 'in_progress');
  if (inProgress) return inProgress;
  // Fall back to first non-completed phase
  return phases.find((p) => p.status !== 'completed');
};

export const findOngoingMilestone = (
  milestones: MilestoneType[],
): MilestoneType | undefined => {
  // First try to find one explicitly marked as in_progress
  const inProgress = milestones.find((m) => m.status === 'in_progress');
  if (inProgress) return inProgress;
  // Fall back to first non-completed/non-reached milestone
  return milestones.find((m) => m.status !== 'completed' && !m.reached);
};

export const findOngoingTask = (tasks: TaskType[]): TaskType | undefined => {
  // First try to find one explicitly marked as in_progress
  const inProgress = tasks.find((t) => t.status === 'in_progress');
  if (inProgress) return inProgress;
  // Fall back to first non-completed task
  return tasks.find((t) => t.status !== 'completed' && !t.completed);
};

const ensureIds = (
  milestones: MilestoneType[],
  generateId: () => string,
): MilestoneType[] =>
  milestones.map((milestone) => ({
    ...milestone,
    milestone_id: milestone.milestone_id || generateId(),
    tasks:
      milestone.tasks?.map((task) => ({
        ...task,
        task_id: task.task_id || generateId(),
        steps:
          task.steps?.map((step) => ({
            ...step,
            step_id: step.step_id || generateId(),
          })) || [],
      })) || [],
  }));

export const assignRoadmapIds = (
  roadmap: RoadmapType,
  generateId: () => string,
): RoadmapType => ({
  ...roadmap,
  milestones: ensureIds(roadmap.milestones, generateId),
  phases: roadmap.phases?.map((phase) => ({
    ...phase,
    milestones: ensureIds(phase.milestones ?? [], generateId),
  })),
});

const removeIds = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(removeIds) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        if (!key.toLowerCase().endsWith('_id')) {
          (acc as Record<string, unknown>)[key] = removeIds(value);
        }
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
  }
  return obj;
};

export const transformRoadmap = (roadmap: RoadmapType): RoadmapType => {
  const milestones = getAllMilestones(roadmap);

  if (milestones.length === 0) {
    return { ...roadmap, milestones: roadmap.milestones || [] };
  }

  // Support both new status field and legacy reached field
  const activeMilestone = milestones.find(
    (m) => m.status !== 'completed' && !m.reached,
  );
  if (!activeMilestone) {
    return {
      ...roadmap,
      progress: 100,
      daysRemainingTillNextMilestone: 0,
    };
  }
  const allTasks = milestones.flatMap((m) => m.tasks);
  // Support both new status field and legacy completed field
  const completedTasks = allTasks.filter(
    (t) => t.status === 'completed' || t.completed,
  );

  return {
    ...roadmap,
    progress: Math.floor((completedTasks.length / allTasks.length) * 100),
    daysRemainingTillNextMilestone:
      activeMilestone?.tasks.filter(
        (t) => t.status !== 'completed' && !t.completed,
      ).length || 0,
  };
};
