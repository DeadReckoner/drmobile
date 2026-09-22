import { api } from '@/store/apis/api';
import {
  SubmitReportParamsType,
  SubmitReportResponseType,
} from '@/store/apis/types/reportApi.types';

export const reportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    submitReport: builder.mutation<
      SubmitReportResponseType,
      SubmitReportParamsType
    >({
      query: (report) => ({
        url: '/reports',
        method: 'POST',
        body: report,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useSubmitReportMutation } = reportApi;
