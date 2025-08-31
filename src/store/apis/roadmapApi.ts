import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import { structureRoadmapApiPayload } from '@/utils/roadmap.utils';
import { TypedMutationOnQueryStarted } from '@reduxjs/toolkit/query';

const onCreateRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  RoadmapType,
  BaseQueryFunctionType
> = async (_roadmap, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        draft.push(data);
      }),
    );
  } catch {}
};

const onUpdateRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  RoadmapType,
  BaseQueryFunctionType
> = async (roadmap, { dispatch, queryFulfilled, getState }) => {
  try {
    const { data } = await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const { selectedRoadmapIndex } = state.roadmapDraft;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        let roadmapIdx = selectedRoadmapIndex;
        if (roadmapIdx === -1) {
          roadmapIdx = draft.findIndex(
            (r) => r.roadmap_id === roadmap.roadmap_id,
          );
        }

        if (roadmapIdx !== -1) {
          draft[roadmapIdx] = data;
        }
      }),
    );

    dispatch(setDraftRoadmapAction(data));
  } catch {}
};

const onDeleteRoadmapQueryStarted: TypedMutationOnQueryStarted<
  string,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled, getState }) => {
  try {
    await queryFulfilled;
    const state = getState() as unknown as RootStateType;
    const { selectedRoadmapIndex } = state.roadmapDraft;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        if (selectedRoadmapIndex !== -1) {
          draft.splice(selectedRoadmapIndex, 1);
        } else {
          const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
          if (idx !== -1) draft.splice(idx, 1);
        }
      }),
    );
    dispatch(resetDraftAction());
  } catch {}
};

const transformRoadmap = (roadmap: RoadmapType): RoadmapType => {
  const activeMilestone = roadmap.milestones.find((m) => !m.reached);

  if (!activeMilestone) {
    return {
      ...roadmap,
      progress: 100,
      daysRemainingTillNextMilestone: 0,
    };
  }
  const completedMilestones = roadmap.milestones.filter((m) => m.reached);
  return {
    ...roadmap,
    progress: Math.floor(
      (completedMilestones.length / roadmap.milestones.length) * 100,
    ),
    daysRemainingTillNextMilestone: activeMilestone.tasks.filter(
      (t) => !t.completed,
    ).length,
  };
};

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps',
      transformResponse: (roadmaps: RoadmapType[]) => {
        try {
          return roadmaps.map(transformRoadmap);
        } catch {
          return roadmaps;
        }
      },
    }),
    createRoadmap: builder.mutation<RoadmapType, Partial<RoadmapType>>({
      query: (roadmap) => {
        return {
          url: `/roadmaps`,
          method: 'POST',
          body: structureRoadmapApiPayload(roadmap),
        };
      },
      onQueryStarted: onCreateRoadmapQueryStarted,
    }),
    updateRoadmap: builder.mutation<
      RoadmapType,
      Partial<RoadmapType> & { roadmap_id: string }
    >({
      query: ({ roadmap_id, ...roadmap }) => {
        return {
          url: `/roadmaps/${roadmap_id}`,
          method: 'PATCH',
          body: roadmap,
        };
      },
      onQueryStarted: onUpdateRoadmapQueryStarted,
    }),
    deleteRoadmap: builder.mutation<string, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmaps/${roadmap_id}`,
          method: 'DELETE',
        };
      },
      onQueryStarted: onDeleteRoadmapQueryStarted,
    }),
  }),
  overrideExisting: true,
});
