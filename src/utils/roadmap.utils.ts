import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';

export const structureRoadmapApiPayload = (roadmap: Partial<RoadmapType>) => {
  return removeIds(roadmap);
};

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
  const activeMilestone = roadmap.milestones.find((m) => !m.reached);

  if (!activeMilestone) {
    return {
      ...roadmap,
      progress: 100,
      daysRemainingTillNextMilestone: 0,
    };
  }
  const allTasks = roadmap.milestones.flatMap((m) => m.tasks);
  const completedTasks = allTasks.filter((t) => {
    return t.steps?.every((s) => s.completed) || false;
  });

  return {
    ...roadmap,
    progress: Math.floor((completedTasks.length / allTasks.length) * 100),
    daysRemainingTillNextMilestone: activeMilestone.tasks.filter(
      (t) => !t.completed,
    ).length,
  };
};
