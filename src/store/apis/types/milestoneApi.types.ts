import { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';

export type UpdateMilestoneParamsType = Partial<
  Pick<MilestoneType, 'sub_goal' | 'description' | 'status' | 'day'>
> & { milestoneId: string };
