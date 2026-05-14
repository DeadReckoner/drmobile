import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';

export type BaseQueryFunctionType = ReturnType<typeof fetchBaseQuery>;

export type ApiError = {
  message: string;
} & {
  data?: {
    error?: string;
    message?: string;
  };
};

export interface RealignRoadmapResponse {
  roadmap: RoadmapType;
  days_shifted: number;
}
