import { StepType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { taskApi } from '@/store/apis/taskApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  addStepAction,
  removeStepAction,
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
    const state = getState() as unknown as RootStateType;
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        const taskIdx = state.roadmapDraft.selectedTaskIndex;
        if (roadmapIdx === -1 || milestoneIdx === -1 || taskIdx === -1) {
          return;
        }
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps.push(
          data,
        );
        dispatch(addStepAction(data));
      }),
    );

    dispatch(
      taskApi.util.updateQueryData(
        'getUserTasksByStartDate',
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        (tasks) => {
          const taskIdx = tasks.findIndex((t) => t.task_id === data.task_id);
          if (taskIdx !== -1) {
            const task = tasks[taskIdx];
            task.steps.push(data);
            task.completed = task.steps?.every((s) => s.completed) || false;
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
              task.completed = task.steps?.every((s) => s.completed) || false;
            }
          }
        },
      ),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        const taskIdx = state.roadmapDraft.selectedTaskIndex;

        if (roadmapIdx !== -1 && milestoneIdx !== -1 && taskIdx !== -1) {
          const steps =
            roadmaps[roadmapIdx]?.milestones[milestoneIdx]?.tasks[taskIdx]
              ?.steps;
          if (steps) {
            const stepIdx = steps.findIndex((s) => s.step_id === data.step_id);
            if (stepIdx !== -1) {
              steps[stepIdx] = data;
              const task =
                roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx];
              task.completed = task.steps?.every((s) => s.completed) || false;
            }
          }
        }
      }),
    );
  } catch {}
};

const onDeleteStepQueryStarted: TypedMutationOnQueryStarted<
  unknown,
  { step_id: string; task_id: string },
  BaseQueryFunctionType
> = async (step, { dispatch, queryFulfilled, getState }) => {
  try {
    const state = getState() as unknown as RootStateType;
    await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        const taskIdx = state.roadmapDraft.selectedTaskIndex;
        const stepIdx = state.roadmapDraft.selectedStepIndex;

        if (
          roadmapIdx === -1 ||
          milestoneIdx === -1 ||
          taskIdx === -1 ||
          stepIdx === -1
        ) {
          return;
        }
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[
          taskIdx
        ].steps.splice(stepIdx, 1);
        dispatch(
          removeStepAction({
            step_id: step.step_id,
          }),
        );
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
              task.completed = task.steps?.every((s) => s.completed) || false;
            }
          }
        },
      ),
    );
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
  }),
  overrideExisting: true,
});
