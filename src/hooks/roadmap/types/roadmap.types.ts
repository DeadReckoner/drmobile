export type StepType = {
  TaskId: string;
  Description: string;
  Completed: boolean;
  Number: number;
};

export type TaskType = {
  TaskId: string;
  MilestoneId: string;
  Title: string;
  Description: string;
  Day: number;
  Completed: boolean;
  Steps: StepType[];
};

export type MilestoneType = {
  MilestoneId: string;
  RoadmapId: string;
  SubGoal: string;
  Description: string;
  Day: number;
  Reached: boolean;
  Tasks: TaskType[];
};

export type RoadmapType = {
  RoadmapId: string;
  UserId: string;
  Goal: string;
  Description: string;
  Days: number;
  Completed: boolean;
  StartDate?: string;
  Milestones: MilestoneType[];
  Reason: string;
};

export type FormRoadmapType = Pick<
  RoadmapType,
  'Goal' | 'Description' | 'Days' | 'Reason'
>;

export type FormEditModeType = 'edit' | 'create';
