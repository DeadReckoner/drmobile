import { api } from '@/store/apis/api';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  CreateTaskParamsType,
  CreateTaskResponseType,
  UpdateTaskParamsType,
  UpdateTaskResponseType,
} from '@/store/apis/types/taskApi.types';
import {
  addTaskAction,
  removeTaskAction,
  setSelectedTaskAction,
  updateTaskAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateTaskQueryStarted: TypedMutationOnQueryStarted<
  CreateTaskResponseType,
  CreateTaskParamsType,
  BaseQueryFunctionType
> = async (_task, { dispatch, queryFulfilled, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    if (roadmapIdx === -1 || milestoneIdx === -1 || !roadmapId) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const currentRoadmap = draft[roadmapIdx];
        currentRoadmap.milestones[milestoneIdx].tasks.push(data);
        currentRoadmap.daysRemainingTillNextMilestone =
          currentRoadmap.milestones[milestoneIdx].tasks.length || 0;
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmapId, (draft) => {
        draft.milestones[milestoneIdx].tasks.push(data);
        draft.daysRemainingTillNextMilestone =
          draft.milestones[milestoneIdx].tasks.length || 0;
      }),
    );

    dispatch(addTaskAction(data));
  } catch {}
};

const onUpdateTaskQueryStarted: TypedMutationOnQueryStarted<
  UpdateTaskResponseType,
  UpdateTaskParamsType,
  BaseQueryFunctionType
> = async (_task, { dispatch, queryFulfilled, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const taskIdx = state.roadmapDraft.selectedTaskIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    if (
      roadmapIdx === -1 ||
      milestoneIdx === -1 ||
      taskIdx === -1 ||
      !roadmapId
    ) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const updatedTask = {
          ...data,
          steps:
            draft[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps,
        };
        draft[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx] = updatedTask;
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmapId, (draft) => {
        const updatedTask = {
          ...data,
          steps: draft.milestones[milestoneIdx].tasks[taskIdx].steps,
        };
        draft.milestones[milestoneIdx].tasks[taskIdx] = updatedTask;
      }),
    );

    const updatedTask = {
      ...data,
      steps:
        state.roadmapDraft.roadmap?.milestones[milestoneIdx].tasks[taskIdx]
          .steps,
    };
    dispatch(updateTaskAction(updatedTask));
    dispatch(setSelectedTaskAction({ task: updatedTask }));
  } catch {}
};

const onDeleteTaskQueryStarted: TypedMutationOnQueryStarted<
  unknown,
  string,
  BaseQueryFunctionType
> = async (_task_id, { dispatch, queryFulfilled, getState }) => {
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
    const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
    const taskIdx = state.roadmapDraft.selectedTaskIndex;
    const roadmapId = state.roadmapDraft.roadmap?.roadmap_id;

    if (
      roadmapIdx === -1 ||
      milestoneIdx === -1 ||
      taskIdx === -1 ||
      !roadmapId
    ) {
      return;
    }

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks.splice(taskIdx, 1);
        roadmaps[roadmapIdx].daysRemainingTillNextMilestone =
          roadmaps[roadmapIdx].milestones[milestoneIdx].tasks.length || 0;
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmapId, (draft) => {
        draft.milestones[milestoneIdx].tasks.splice(taskIdx, 1);
        draft.daysRemainingTillNextMilestone =
          draft.milestones[milestoneIdx].tasks.length || 0;
      }),
    );

    dispatch(removeTaskAction());
  } catch {}
};

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation<CreateTaskResponseType, CreateTaskParamsType>({
      query: (task) => {
        return {
          url: `/tasks`,
          method: 'POST',
          body: task,
        };
      },
      onQueryStarted: onCreateTaskQueryStarted,
    }),
    updateTask: builder.mutation<UpdateTaskResponseType, UpdateTaskParamsType>({
      query: (task) => {
        return {
          url: `/tasks/${task.task_id}`,
          method: 'PATCH',
          body: task,
        };
      },
      onQueryStarted: onUpdateTaskQueryStarted,
    }),
    deleteTask: builder.mutation<{ task_id: string }, unknown>({
      query: (task_id) => {
        return {
          url: `/tasks/${task_id}`,
          method: 'DELETE',
        };
      },
      onQueryStarted: onDeleteTaskQueryStarted,
    }),
    getUserTasksByStartDate: builder.query<CreateTaskResponseType[], string>({
      query: (startDate) => ({
        url: `/tasks/user?start_date=${startDate}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 600,
      providesTags: ['Tasks'],
    }),
    getTasksById: builder.query<CreateTaskResponseType, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 86400,
    }),
  }),
  overrideExisting: true,
});
