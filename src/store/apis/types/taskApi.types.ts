import { TaskType } from '@/hooks/roadmap/types/roadmap.types';

export type CreateTaskParamsType = Pick<TaskType, 'title' | 'description'> & {
  milestone_id: string;
};

export type CreateTaskResponseType = TaskType;

export type UpdateTaskParamsType = Partial<
  Pick<TaskType, 'title' | 'description' | 'status'>
> & {
  task_id: string;
  milestone_id: string;
};

export type UpdateTaskResponseType = TaskType;
