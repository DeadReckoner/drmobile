import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { api } from '@/store/apis/api';
import { taskApi } from '@/store/apis/taskApi';
import { BaseQueryFunctionType } from '@/store/apis/types/api.types';
import {
  resetDraftAction,
  setDraftRoadmapAction,
} from '@/store/slices/roadmapDraftSlice';
import { DateUtils } from '@/utils/date.utils';
import {
  structureRoadmapApiPayload,
  transformRoadmap,
} from '@/utils/roadmap.utils';
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
      roadmapApi.util.invalidateTags([{ type: 'Roadmaps', id: roadmap_id }]),
    );
    dispatch(
      taskApi.endpoints.getUserTasksByStartDate.initiate(
        DateUtils.formatDate(DateUtils.createDate(), 'YYYY-MM-DD'),
        { forceRefetch: true },
      ),
    );

    dispatch(resetDraftAction());
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
    getRoadmaps: builder.query<RoadmapType[], void>({
      query: () => '/roadmaps',
      providesTags: ['Roadmaps'],
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
  }),
  overrideExisting: true,
});
