import { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import { UpdateMilestoneParamsType } from '@/store/apis/types/milestoneApi.types';
import {
  removeMilestoneAction,
  updateMilestoneAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onUpdateMilestoneQueryStarted: TypedMutationOnQueryStarted<
  MilestoneType,
  UpdateMilestoneParamsType,
  BaseQueryFunctionType
> = async (_milestone, { queryFulfilled, dispatch, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex(
          (r) => r.roadmap_id === state.roadmapDraft.roadmap.roadmap_id,
        );
        if (idx !== -1) {
          const roadmap = draft[idx];
          const milestoneIndex = roadmap.milestones.findIndex(
            (r) => r.milestone_id === _milestone.milestoneId,
          );
          if (milestoneIndex !== -1) {
            const existingMilestone =
              state.roadmapDraft.roadmap.milestones[milestoneIndex];
            const updatedMilestone = {
              ...existingMilestone,
              ...data,
              tasks: existingMilestone.tasks,
            };
            draft[idx].milestones[milestoneIndex] = updatedMilestone;
            dispatch(updateMilestoneAction(updatedMilestone));
          }
        }
      }),
    );
  } catch {}
};

const onDeleteMilestoneQueryStarted: TypedMutationOnQueryStarted<
  unknown,
  string,
  BaseQueryFunctionType
> = async (milestoneId, { queryFulfilled, dispatch, getState }) => {
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const idx = roadmaps.findIndex(
          (r) => r.roadmap_id === state.roadmapDraft.roadmap.roadmap_id,
        );
        if (idx !== -1) {
          roadmaps[idx].milestones = roadmaps[idx].milestones.filter(
            (m) => m.milestone_id !== milestoneId,
          );
        }
      }),
    );
    dispatch(removeMilestoneAction());
  } catch {}
};

export const milestoneApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateMilestone: builder.mutation<MilestoneType, UpdateMilestoneParamsType>(
      {
        query: (milestone) => ({
          url: `/roadmap/milestone/${milestone.milestoneId}`,
          method: 'PATCH',
          body: milestone,
        }),
        onQueryStarted: onUpdateMilestoneQueryStarted,
      },
    ),
    deleteMilestone: builder.mutation<unknown, string>({
      query: (milestoneId) => ({
        url: `/roadmap/milestone/${milestoneId}`,
        method: 'DELETE',
      }),
      onQueryStarted: onDeleteMilestoneQueryStarted,
    }),
  }),
  overrideExisting: true,
});
