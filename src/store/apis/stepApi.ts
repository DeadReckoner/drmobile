import { StepType, TaskType } from '@/hooks/roadmap/types/roadmap.types';
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

const onUpdateStepQueryStarted: TypedMutationOnQueryStarted<
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

    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const taskIdx = tasks.findIndex((t) => t.task_id === data.task_id);
          if (taskIdx !== -1) {
            const task = tasks[taskIdx];
            const stepIdx = task.steps?.findIndex(
              (s) => s.step_id === data.step_id,
            );
            if (stepIdx !== -1) {
              task.steps[stepIdx] = data;
            }
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
  } catch {}
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
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;
    const selectedTask = state.roadmapDraft.selectedTask;

    if (selectedTask) {
      const updatedTask: TaskType = {
        ...selectedTask,
        status: 'completed',
        steps:
          selectedTask.steps?.map((s) => ({ ...s, completed: true })) ?? [],
      };
      dispatch(setSelectedTaskAction({ task: updatedTask }));
    }

    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const idx = tasks.findIndex((t) => t.task_id === taskId);
          if (idx !== -1) {
            tasks[idx].status = 'completed';
            tasks[idx].steps = tasks[idx].steps?.map((s) => ({
              ...s,
              completed: true,
            }));
          }
        },
      ),
    );

    if (roadmapId) {
      dispatch(
        roadmapApi.endpoints.getRoadmapById.initiate(roadmapId, {
          forceRefetch: true,
        }),
      );
    }
  } catch {}
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
