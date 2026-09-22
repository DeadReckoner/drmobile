import {
  ImportNotesType,
  ImportPlanContextType,
  RoadmapCreationJobResponse,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { JobStatusResponseType } from '@/store/slices/aiRoadmapCreationSlice';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PlanImportStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error';

interface SelectedFileType {
  uri: string;
  name: string;
  size: number;
}

interface PlanImportState {
  status: PlanImportStatus;
  selectedFile: SelectedFileType | null;
  context: ImportPlanContextType;
  jobResponse: RoadmapCreationJobResponse | null;
  jobStatusResponse: JobStatusResponseType | null;
  importNotes: ImportNotesType | null;
  importNotesShown: boolean;
  createdRoadmap: RoadmapType | null;
  error: string | null;
}

const initialState: PlanImportState = {
  status: 'idle',
  selectedFile: null,
  context: {},
  jobResponse: null,
  jobStatusResponse: null,
  importNotes: null,
  importNotesShown: false,
  createdRoadmap: null,
  error: null,
};

const planImportSlice = createSlice({
  name: 'planImport',
  initialState,
  reducers: {
    setSelectedFileAction: (state, action: PayloadAction<SelectedFileType>) => {
      state.selectedFile = action.payload;
    },

    clearSelectedFileAction: (state) => {
      state.selectedFile = null;
    },

    updateContextAction: (
      state,
      action: PayloadAction<{
        key: keyof ImportPlanContextType;
        value: string;
      }>,
    ) => {
      state.context[action.payload.key] = action.payload.value;
    },

    startUploadAction: (state) => {
      state.status = 'uploading';
      state.error = null;
      state.jobResponse = null;
      state.jobStatusResponse = null;
      state.importNotes = null;
      state.importNotesShown = false;
      state.createdRoadmap = null;
    },

    setJobResponseAction: (
      state,
      action: PayloadAction<RoadmapCreationJobResponse>,
    ) => {
      state.status = 'processing';
      state.jobResponse = action.payload;
      state.error = null;
    },

    setJobStatusAction: (
      state,
      action: PayloadAction<JobStatusResponseType | null>,
    ) => {
      state.jobStatusResponse = action.payload;
    },

    completeImportAction: (
      state,
      action: PayloadAction<{
        roadmap: RoadmapType;
        importNotes: ImportNotesType | null;
      }>,
    ) => {
      state.status = 'completed';
      state.createdRoadmap = action.payload.roadmap;
      state.importNotes = action.payload.importNotes;
      state.error = null;
    },

    setImportErrorAction: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.jobResponse = null;
      state.jobStatusResponse = null;
    },

    markImportNotesShownAction: (state) => {
      state.importNotesShown = true;
    },

    resetPlanImportAction: () => initialState,
  },
});

export const {
  setSelectedFileAction,
  clearSelectedFileAction,
  updateContextAction,
  startUploadAction,
  setJobResponseAction,
  setJobStatusAction,
  completeImportAction,
  setImportErrorAction,
  markImportNotesShownAction,
  resetPlanImportAction,
} = planImportSlice.actions;

export const selectPlanImportState = createAppSelector(
  (state) => state.planImport,
);

export const selectPlanImportStatus = createAppSelector(
  (state) => state.planImport.status,
);

export const selectPlanImportJobResponse = createAppSelector(
  (state) => state.planImport.jobResponse,
);

export const selectPlanImportJobStatus = createAppSelector(
  (state) => state.planImport.jobStatusResponse,
);

export const selectPlanImportFile = createAppSelector(
  (state) => state.planImport.selectedFile,
);

export const selectPlanImportContext = createAppSelector(
  (state) => state.planImport.context,
);

export const selectImportNotes = createAppSelector(
  (state) => state.planImport.importNotes,
);

export const selectShouldShowImportNotes = createAppSelector(
  (state) =>
    state.planImport.importNotes !== null && !state.planImport.importNotesShown,
);

export const selectShouldShowPlanImportBanner = createAppSelector((state) => {
  const { status } = state.planImport;
  return (
    status === 'uploading' ||
    status === 'processing' ||
    status === 'completed' ||
    status === 'error'
  );
});

export const selectIsPlanImporting = createAppSelector(
  (state) =>
    state.planImport.status === 'uploading' ||
    state.planImport.status === 'processing',
);

export const selectPlanImportCreatedRoadmap = createAppSelector(
  (state) => state.planImport.createdRoadmap,
);

export const planImportReducer = planImportSlice.reducer;
