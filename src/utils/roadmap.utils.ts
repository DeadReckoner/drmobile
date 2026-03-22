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
  const reached = milestones.filter((m) => m.status === 'completed').length;
  return Math.floor((reached / milestones.length) * 100);
};

export const calculateMilestoneProgress = (
  milestone: MilestoneType,
): number => {
  const tasks = milestone.tasks ?? [];
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(
    (t: TaskType) => t.status === 'completed',
  ).length;
  return Math.floor((completed / tasks.length) * 100);
};

interface BadgeLabelParts {
  phase?: number | string;
  milestone?: number | string;
  task?: number | string;
}

export const buildBadgeLabel = ({
  phase,
  milestone,
  task,
}: BadgeLabelParts): string => {
  const parts: string[] = [];
  if (phase != null) parts.push(`P${phase}`);
  if (milestone != null) parts.push(`M${milestone}`);
  if (task != null) parts.push(`T${task}`);
  return parts.join('-');
};

/**
 * Centralised "ongoing" finders.
 * An item is ongoing if and only if its backend-provided status is 'in_progress'.
 */
export const findOngoingPhase = (phases: Phase[]): Phase | undefined =>
  phases.find((p) => p.status === 'in_progress');

export const findOngoingMilestone = (
  milestones: MilestoneType[],
): MilestoneType | undefined =>
  milestones.find((m) => m.status === 'in_progress');

export const findOngoingTask = (tasks: TaskType[]): TaskType | undefined =>
  tasks.find((t) => t.status === 'in_progress');

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

  const activeMilestone = milestones.find((m) => m.status !== 'completed');
  if (!activeMilestone) {
    return {
      ...roadmap,
      progress: 100,
      daysRemainingTillNextMilestone: 0,
    };
  }
  const allTasks = milestones.flatMap((m) => m.tasks);
  const completedTasks = allTasks.filter((t) => t.status === 'completed');

  return {
    ...roadmap,
    progress: Math.floor((completedTasks.length / allTasks.length) * 100),
    daysRemainingTillNextMilestone:
      activeMilestone?.tasks.filter((t) => t.status !== 'completed').length ||
      0,
  };
};
