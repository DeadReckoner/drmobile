import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import { setSetupStepAction } from '@/store/slices/onboardingSlice';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { RootStateType } from '@/store/types/store.types';
import {
  structureRoadmapApiPayload,
  transformRoadmap,
} from '@/utils/roadmap.utils';
import { current } from '@reduxjs/toolkit';
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
    dispatch(setSetupStepAction({ key: 'createOrReviewRoadmap', value: true }));
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
        const roadmapIdx = draft.findIndex(
          (r) => r.roadmap_id === roadmap.roadmap_id,
        );

        if (roadmapIdx !== -1) {
          draft[roadmapIdx] = data;
        }
      }),
    );

    if (roadmap.roadmap_id) {
      dispatch(
        roadmapApi.util.updateQueryData(
          'getRoadmapById',
          roadmap.roadmap_id,
          (draft) => {
            Object.assign(draft, data);
          },
        ),
      );
    }

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
        if (idx !== -1) {
          draft.splice(idx, 1);
        }
      }),
    );

    dispatch(
      roadmapApi.util.invalidateTags([
        { type: 'Roadmaps', id: roadmap_id },
        'Tasks',
      ]),
    );

    dispatch(resetDraftAction());
  } catch {}
};

const onArchiveRoadmapQueryStarted: TypedMutationOnQueryStarted<
  { message: string },
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    await queryFulfilled;
    let archivedRoadmap: RoadmapType | null = null;

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          archivedRoadmap = current(draft[idx]);
          draft.splice(idx, 1);
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData(
        'getRoadmaps',
        { include_archived: true },
        (draft) => {
          if (archivedRoadmap) {
            draft.unshift({ ...archivedRoadmap, archived: true });
          }
        },
      ),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        draft.archived = true;
      }),
    );
  } catch {}
};

const onRestoreRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  { roadmap_id: string; start_from_today?: boolean },
  BaseQueryFunctionType
> = async ({ roadmap_id }, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        draft.push(data);
      }),
    );
    dispatch(
      roadmapApi.util.updateQueryData(
        'getRoadmaps',
        { include_archived: true },
        (draft) => {
          const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
          if (idx !== -1) draft.splice(idx, 1);
        },
      ),
    );
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );
  } catch {}
};

const onStartRoadmapQueryStarted: TypedMutationOnQueryStarted<
  RoadmapType,
  string,
  BaseQueryFunctionType
> = async (roadmap_id, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(
      roadmapApi.util.updateQueryData('getRoadmaps', undefined, (draft) => {
        const idx = draft.findIndex((r) => r.roadmap_id === roadmap_id);
        if (idx !== -1) {
          draft[idx] = data;
        }
      }),
    );

    dispatch(
      roadmapApi.util.updateQueryData('getRoadmapById', roadmap_id, (draft) => {
        Object.assign(draft, data);
      }),
    );
  } catch {}
};

export const roadmapApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoadmaps: builder.query<
      RoadmapType[],
      { include_archived?: boolean } | void
    >({
      query: ({ include_archived = false } = {}) =>
        `/roadmaps?include_archived=${include_archived}`,

      providesTags: ['Roadmaps'],
      transformResponse: (roadmaps: RoadmapType[]) => {
        try {
          return roadmaps.map(transformRoadmap);
        } catch {
          return roadmaps;
        }
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled, getState }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.length > 0) {
            const currentDraftRoadmap = (getState() as RootStateType)
              .roadmapDraft.roadmap;
            const roadmap = data.find(
              (r) => r.roadmap_id === currentDraftRoadmap?.roadmap_id,
            );
            if (roadmap) {
              dispatch(setDraftRoadmapAction(roadmap));
            }
          }
        } catch {}
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
    startRoadmap: builder.mutation<RoadmapType, string>({
      query: (roadmap_id) => {
        return {
          url: `/roadmaps/${roadmap_id}/start`,
          method: 'PUT',
        };
      },
      onQueryStarted: onStartRoadmapQueryStarted,
    }),

    getRoadmapById: builder.query<RoadmapType, string>({
      query: (roadmap_id) => `/roadmaps/${roadmap_id}`,
      transformResponse: (roadmap: RoadmapType) => {
        try {
          return transformRoadmap(roadmap);
        } catch {
          return roadmap;
        }
      },
      providesTags: (_result, _error, roadmap_id) => [
        { type: 'Roadmaps', id: roadmap_id },
      ],
    }),

    //TODO: This is a temporary endpoint to fetch anchor roadmaps.
    // We should remove this once we have a proper implementation for anchor roadmaps.
    getAnchorRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps/anchored',
      providesTags: ['Roadmaps'],
    }),

    nudgeRoadmap: builder.mutation<unknown, { roadmapId: string }>({
      query: ({ roadmapId }) => ({
        url: `/roadmaps/${roadmapId}/nudge`,
        method: 'POST',
      }),
    }),

    archiveRoadmap: builder.mutation<{ message: string }, string>({
      query: (roadmap_id) => ({
        url: `/roadmaps/${roadmap_id}/archive`,
        method: 'POST',
      }),
      onQueryStarted: onArchiveRoadmapQueryStarted,
    }),

    restoreRoadmap: builder.mutation<
      RoadmapType,
      { roadmap_id: string; start_from_today?: boolean }
    >({
      query: ({ roadmap_id, start_from_today }) => ({
        url: `/roadmaps/${roadmap_id}/restore`,
        method: 'POST',
        body: start_from_today !== undefined ? { start_from_today } : undefined,
      }),
      onQueryStarted: onRestoreRoadmapQueryStarted,
    }),
  }),
  overrideExisting: true,
});
