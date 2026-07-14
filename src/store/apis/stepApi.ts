import {
  StepStatusType,
  StepType,
  TaskType,
} from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { taskApi } from '@/store/apis/taskApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  addStepAction,
  removeStepAction,
  setSelectedTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import { DateUtils } from '@/utils/date.utils';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateStepQueryStarted: TypedMutationOnQueryStarted<
  StepType,
  StepType & { task_id: string },
  BaseQueryFunctionType
> = async (_task, { dispatch, queryFulfilled, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const taskIdx = state.roadmapDraft.selectedTaskIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    if (roadmapIdx === -1 || milestoneIdx === -1 || taskIdx === -1) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        if (
          !roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps
        ) {
          roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps =
            [];
        }
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps.push(
          data,
        );
      }),
    );

    if (roadmapId) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          roadmapId,
          (draft) => {
            if (!draft.milestones[milestoneIdx].tasks[taskIdx].steps) {
              draft.milestones[milestoneIdx].tasks[taskIdx].steps = [];
            }
            draft.milestones[milestoneIdx].tasks[taskIdx].steps.push(data);
          },
        ),
      );
    }

    dispatch(addStepAction(data));

    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const taskIdx = tasks.findIndex((t) => t.task_id === data.task_id);
          if (taskIdx !== -1) {
            const task = tasks[taskIdx];
            task.steps.push(data);
          }
        },
      ),
    );
  } catch {}
};

const isStepDone = (s: StepType) =>
  s.status === 'completed' || s.completed || s.status === 'skipped';

const recalcTaskStatus = (
  tasks: StepType[],
  stepId: string,
  newCompleted: boolean,
  newStatus: StepStatusType,
) => {
  const updatedSteps = tasks.map((s) =>
    s.step_id === stepId
      ? { ...s, completed: newCompleted, status: newStatus }
      : s,
  );
  const allDone = updatedSteps.length > 0 && updatedSteps.every(isStepDone);
  return allDone ? ('completed' as const) : ('in_progress' as const);
};

const onUpdateStepQueryStarted: TypedMutationOnQueryStarted<
  StepType,
  StepType & { task_id: string },
  BaseQueryFunctionType
> = async (stepArg, { dispatch, queryFulfilled, getState }) => {
  // Optimistic update — runs immediately before the server responds
  const patchResult = dispatch(
    taskApi.util.updateQueryData(
      'getUserTasksByStartDate',
      DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
      (tasks) => {
        const taskIdx = tasks.findIndex((t) => t.task_id === stepArg.task_id);
        if (taskIdx === -1) return;
        const task = tasks[taskIdx];
        const stepIdx = task.steps?.findIndex(
          (s) => s.step_id === stepArg.step_id,
        );
        if (!task.steps || stepIdx === undefined || stepIdx === -1) return;

        task.steps[stepIdx].completed = stepArg.completed ?? false;
        task.steps[stepIdx].status = stepArg.status ?? 'incomplete';

        const newTaskStatus = recalcTaskStatus(
          task.steps as StepType[],
          stepArg.step_id!,
          stepArg.completed ?? false,
          stepArg.status ?? 'incomplete',
        );
        if (newTaskStatus === 'completed' || task.status === 'completed') {
          task.status = newTaskStatus;
        }
      },
    ),
  );

  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const taskIdx = state.roadmapDraft.selectedTaskIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    // Reconcile with real server data
    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const tIdx = tasks.findIndex((t) => t.task_id === data.task_id);
          if (tIdx === -1) return;
          const task = tasks[tIdx];
          const stepIdx = task.steps?.findIndex(
            (s) => s.step_id === data.step_id,
          );
          if (!task.steps || stepIdx === undefined || stepIdx === -1) return;
          task.steps[stepIdx] = data;
          const newTaskStatus = recalcTaskStatus(
            task.steps as StepType[],
            data.step_id,
            data.completed,
            data.status ?? 'incomplete',
          );
          if (newTaskStatus === 'completed' || task.status === 'completed') {
            task.status = newTaskStatus;
          }
        },
      ),
    );

    if (roadmapIdx === -1 || milestoneIdx === -1 || taskIdx === -1) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const steps =
          roadmaps[roadmapIdx]?.milestones[milestoneIdx]?.tasks[taskIdx]?.steps;
        if (steps) {
          const stepIdx = steps.findIndex((s) => s.step_id === data.step_id);
          if (stepIdx !== -1) {
            steps[stepIdx] = data;
          }
        }
      }),
    );

    if (roadmapId) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          roadmapId,
          (draft) => {
            const steps = draft.milestones[milestoneIdx]?.tasks[taskIdx]?.steps;
            if (steps) {
              const stepIdx = steps.findIndex(
                (s) => s.step_id === data.step_id,
              );
              if (stepIdx !== -1) {
                steps[stepIdx] = data;
              }
            }
          },
        ),
      );
    }
  } catch {
    patchResult.undo();
  }
};

const onDeleteStepQueryStarted: TypedMutationOnQueryStarted<
  unknown,
  { step_id: string; task_id: string },
  BaseQueryFunctionType
> = async (step, { dispatch, queryFulfilled, getState }) => {
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const taskIdx = state.roadmapDraft.selectedTaskIndex;
    const stepIdx = state.roadmapDraft.selectedStepIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    if (
      roadmapIdx === -1 ||
      milestoneIdx === -1 ||
      taskIdx === -1 ||
      stepIdx === -1
    ) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[
          taskIdx
        ].steps.splice(stepIdx, 1);
      }),
    );

    if (roadmapId) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          roadmapId,
          (draft) => {
            draft.milestones[milestoneIdx].tasks[taskIdx].steps.splice(
              stepIdx,
              1,
            );
          },
        ),
      );
    }

    dispatch(
      removeStepAction({
        step_id: step.step_id,
      }),
    );
    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const taskIdx = tasks.findIndex((t) => t.task_id === step.task_id);
          if (taskIdx !== -1) {
            const task = tasks[taskIdx];
            const stepIdx = task.steps?.findIndex(
              (s) => s.step_id === step.step_id,
            );
            if (stepIdx !== -1) {
              task.steps.splice(stepIdx, 1);
            }
          }
        },
      ),
    );
  } catch {}
};

interface CompleteAllStepsResponse {
  message: string;
  steps_completed: number;
  task_id: string;
}

const onCompleteAllStepsQueryStarted: TypedMutationOnQueryStarted<
  CompleteAllStepsResponse,
  string,
  BaseQueryFunctionType
> = async (taskId, { dispatch, queryFulfilled, getState }) => {
  const state = getState() as unknown as RootStateType;
  const selectedTask = state.roadmapDraft.selectedTask;

  // Optimistic update — apply immediately before the server responds
  const patchResult = dispatch(
    taskApi.util.updateQueryData(
      'getUserTasksByStartDate',
      DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
      (tasks) => {
        const idx = tasks.findIndex((t) => t.task_id === taskId);
        if (idx !== -1) {
          tasks[idx].status = 'completed';
          if (tasks[idx].steps) {
            tasks[idx].steps = tasks[idx].steps.map((s) => ({
              ...s,
              completed: true,
              status: 'completed' as const,
            }));
          }
        }
      },
    ),
  );

  if (selectedTask) {
    const updatedTask: TaskType = {
      ...selectedTask,
      status: 'completed',
      steps: selectedTask.steps?.map((s) => ({ ...s, completed: true })) ?? [],
    };
    dispatch(setSelectedTaskAction({ task: updatedTask }));
  }

  try {
    await queryFulfilled;
    const roadmapId = (getState() as unknown as RootStateType).roadmapDraft
      .roadmap?.roadmap_id;

    if (roadmapId) {
      dispatch(
        roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
          forceRefetch: true,
        }),
      );
    }
  } catch {
    patchResult.undo();
  }
};

export const stepApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createStep: builder.mutation<
      StepType,
      Partial<StepType & { task_id: string }>
    >({
      query: (step) => {
        return {
          url: `/tasks/${step.task_id}/steps`,
          method: 'POST',
          body: step,
        };
      },
      onQueryStarted: onCreateStepQueryStarted,
    }),
    updateStep: builder.mutation<
      StepType,
      Partial<StepType & { task_id: string }>
    >({
      query: (step) => {
        return {
          url: `/tasks/${step.task_id}/steps/${step.step_id}`,
          method: 'PATCH',
          body: step,
        };
      },
      onQueryStarted: onUpdateStepQueryStarted,
    }),
    deleteStep: builder.mutation<unknown, { step_id: string; task_id: string }>(
      {
        query: (step) => {
          return {
            url: `/tasks/${step.task_id}/steps/${step.step_id}`,
            method: 'DELETE',
          };
        },
        onQueryStarted: onDeleteStepQueryStarted,
      },
    ),
    completeAllSteps: builder.mutation<CompleteAllStepsResponse, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}/steps/complete-all`,
        method: 'POST',
      }),
      onQueryStarted: onCompleteAllStepsQueryStarted,
    }),
  }),
  overrideExisting: true,
});
