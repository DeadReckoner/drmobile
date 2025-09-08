import { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import { UpdateMilestoneParamsType } from '@/store/apis/types/milestoneApi.types';
import {
  addMilestoneAction,
  removeMilestoneAction,
  updateMilestoneAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateMilestoneQueryStarted: TypedMutationOnQueryStarted<
  MilestoneType,
  UpdateMilestoneParamsType,
  BaseQueryFunctionType
> = async (_milestone, { queryFulfilled, dispatch, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const { selectedRoadmapIndex } = state.roadmapDraft;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        const roadmap = roadmaps[selectedRoadmapIndex];
        if (roadmap) {
          roadmap.milestones.push(data);
          dispatch(addMilestoneAction(data));
        }
      }),
    );
  } catch {}
};

const onUpdateMilestoneQueryStarted: TypedMutationOnQueryStarted<
  MilestoneType,
  UpdateMilestoneParamsType,
  BaseQueryFunctionType
> = async (_milestone, { queryFulfilled, dispatch, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const { selectedRoadmapIndex, selectedMilestoneIndex } = state.roadmapDraft;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        let roadmapIdx = selectedRoadmapIndex;
        if (roadmapIdx === -1) {
          roadmapIdx = draft.findIndex(
            (r) => r.roadmap_id === state.roadmapDraft.roadmap.roadmap_id,
          );
        }

        if (roadmapIdx !== -1) {
          const roadmap = draft[roadmapIdx];
          let milestoneIdx = selectedMilestoneIndex;
          if (milestoneIdx === -1) {
            milestoneIdx = roadmap.milestones.findIndex(
              (r) => r.milestone_id === _milestone.milestoneId,
            );
          }

          if (milestoneIdx !== -1) {
            const existingMilestone =
              state.roadmapDraft.roadmap.milestones[milestoneIdx];
            const updatedMilestone = {
              ...existingMilestone,
              ...data,
              tasks: existingMilestone.tasks,
            };
            draft[roadmapIdx].milestones[milestoneIdx] = updatedMilestone;
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
> = async (_milestoneId, { queryFulfilled, dispatch, getState }) => {
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const { selectedRoadmapIndex, selectedMilestoneIndex } = state.roadmapDraft;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (roadmaps) => {
        if (selectedRoadmapIndex === -1 || selectedMilestoneIndex === -1) {
          return;
        }
        roadmaps[selectedRoadmapIndex].milestones.splice(
          selectedMilestoneIndex,
          1,
        );
      }),
    );
    dispatch(removeMilestoneAction());
  } catch {}
};

export const milestoneApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createMilestone: builder.mutation<MilestoneType, Partial<MilestoneType>>({
      query: (milestone) => ({
        url: `/roadmaps/${milestone.roadmap_id}/milestones`,
        method: 'POST',
        body: milestone,
      }),
      onQueryStarted: onCreateMilestoneQueryStarted,
    }),
    updateMilestone: builder.mutation<MilestoneType, UpdateMilestoneParamsType>(
      {
        query: (milestone) => ({
          url: `/milestones/${milestone.milestoneId}`,
          method: 'PATCH',
          body: milestone,
        }),
        onQueryStarted: onUpdateMilestoneQueryStarted,
      },
    ),
    deleteMilestone: builder.mutation<unknown, string>({
      query: (milestoneId) => ({
        url: `/milestones/${milestoneId}`,
        method: 'DELETE',
      }),
      onQueryStarted: onDeleteMilestoneQueryStarted,
    }),
  }),
  overrideExisting: true,
});
