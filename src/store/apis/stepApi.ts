import { StepType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { roadmapApi, transformRoadmap } from '@/store/apis/roadmapApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  addStepAction,
  removeStepAction,
  updateStepAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
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
  } catch {}
};

const onUpdateStepQueryStarted: TypedMutationOnQueryStarted<
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
        const stepIdx = state.roadmapDraft.selectedStepIndex;

        if (
          roadmapIdx === -1 ||
          milestoneIdx === -1 ||
          taskIdx === -1 ||
          stepIdx === -1
        ) {
          return;
        }
        dispatch(updateStepAction(data));
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps[
          stepIdx
        ] = data;
        const task =
          roadmaps[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx];
        if (task) {
          if (
            task.steps?.every((s) => s.completed) ||
            !task.steps ||
            task.steps?.length === 0
          ) {
            task.completed = true;
          } else {
            task.completed = false;
          }
        }
        roadmaps[roadmapIdx] = transformRoadmap(roadmaps[roadmapIdx]);
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
