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
