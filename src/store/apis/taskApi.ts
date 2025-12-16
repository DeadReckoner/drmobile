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
  setDraftRoadmapAction,
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
    const state = getState() as unknown as RootStateType;
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        if (roadmapIdx === -1 || milestoneIdx === -1) {
          return;
        }
        const currentRoadmap = draft[roadmapIdx];
        currentRoadmap.milestones[milestoneIdx].tasks.push(data);
        dispatch(addTaskAction(data));

        currentRoadmap.daysRemainingTillNextMilestone =
          currentRoadmap.milestones[milestoneIdx].tasks.length || 0;
        dispatch(setDraftRoadmapAction(currentRoadmap));
      }),
    );
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
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        const taskIdx = state.roadmapDraft.selectedTaskIndex;

        if (roadmapIdx === -1 || milestoneIdx === -1 || taskIdx === -1) {
          return;
        }

        const updatedTask = {
          ...data,
          steps:
            draft[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx].steps,
        };
        draft[roadmapIdx].milestones[milestoneIdx].tasks[taskIdx] = updatedTask;
        dispatch(updateTaskAction(updatedTask));
        dispatch(setSelectedTaskAction({ task: updatedTask }));
      }),
    );
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
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const roadmapIdx = state.roadmapDraft.selectedRoadmapIndex;
        const milestoneIdx = state.roadmapDraft.selectedMilestoneIndex;
        const taskIdx = state.roadmapDraft.selectedTaskIndex;

        if (roadmapIdx === -1 || milestoneIdx === -1 || taskIdx === -1) {
          return;
        }

        roadmaps[roadmapIdx].milestones[milestoneIdx].tasks.splice(taskIdx, 1);
        const updatedTasks =
          roadmaps[roadmapIdx].milestones[milestoneIdx].tasks || [];

        roadmaps[roadmapIdx].daysRemainingTillNextMilestone =
          updatedTasks.length || 0;

        dispatch(removeTaskAction());
        dispatch(setDraftRoadmapAction(roadmaps[roadmapIdx]));
      }),
    );
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
        url: `tasks/user?start_date=${startDate}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 600,
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
