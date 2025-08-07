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

export type UseRoadmapBuilderType = {
  roadmap: RoadmapType;
  setRoadmapMetadata: (_meta: Partial<Omit<RoadmapType, 'Milestones'>>) => void;
  milestones: MilestoneType[];
  addMilestone: (
    _milestone: Omit<MilestoneType, 'MilestoneId' | 'RoadmapId' | 'Tasks'>,
  ) => void;
  updateMilestone: (_milestone: MilestoneType) => void;
  removeMilestone: (_milestoneId: string) => void;
  tasks: (_milestoneId: string) => TaskType[];
  addTask: (
    _milestoneId: string,
    _task: Omit<TaskType, 'TaskId' | 'MilestoneId' | 'Steps'>,
  ) => void;
  updateTask: (_milestoneId: string, _task: TaskType) => void;
  removeTask: (_milestoneId: string, _taskId: string) => void;
  steps: (_milestoneId: string, _taskId: string) => StepType[];
  addStep: (
    _milestoneId: string,
    _taskId: string,
    _step: Omit<StepType, 'TaskId' | 'Number'>,
  ) => void;
  updateStep: (
    _milestoneId: string,
    _taskId: string,
    _steptep: StepType,
  ) => void;
  removeStep: (_milestoneId: string, _taskId: string, _number: number) => void;
  reset: () => void;
};

export type FormRoadmapType = Pick<
  RoadmapType,
  'Goal' | 'Description' | 'Days' | 'Reason'
>;

export type FormEditModeType = 'edit' | 'create';
