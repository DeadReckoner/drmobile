import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
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
    dispatch(setDraftRoadmapAction(data));
  } catch {}
};

const onUpdateRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  RoadmapType,
  BaseQueryFunctionType
> = async (roadmap, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap.roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
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
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) draft.splice(idx, 1);
      }),
    );
    dispatch(resetDraftAction());
  } catch {}
};

/**
 * Provides endpoints to:
 *  - Fetch all roadmaps (`getRoadmaps`)
 *  - Update a roadmap (`updateRoadmap`)
 *  - Delete a roadmap (`deleteRoadmap`)
 *
 * Uses `onQueryStarted` to update the cached list and manage the draft roadmap
 * in Redux, keeping UI state in sync without extra refetches. Above "*QueryStarted" functions
 * needs to be placed before the "injectEndpoints" call to make sure they are defined
 * before it calls the actual opearation
 */

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps',
    }),
    createRoadmap: builder.mutation<RoadmapType, Partial<RoadmapType>>({
      query: (roadmap) => {
        return {
          url: `/roadmap`,
          method: 'POST',
          body: roadmap,
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
          url: `/roadmap/${roadmap_id}`,
          method: 'PATCH',
          body: roadmap,
        };
      },
      onQueryStarted: onUpdateRoadmapQueryStarted,
    }),
    deleteRoadmap: builder.mutation<string, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmap/${roadmap_id}`,
          method: 'DELETE',
        };
      },
      onQueryStarted: onDeleteRoadmapQueryStarted,
    }),
  }),
  overrideExisting: true,
});
