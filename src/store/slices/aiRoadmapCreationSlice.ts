import {
  RoadmapCreationJobResponse,
  RoadmapType,
} from '@/hooks/roadmap/types/roadmap.types';
import { createAppSelector } from '@/store/hooks/store.hooks';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MessageItem {
  id: string;
  type: 'system' | 'user';
  content: string;
  isTyping?: boolean;
}

export type AIRoadmapCreationStatus =
  | 'idle'
  | 'collecting'
  | 'creating'
  | 'completed'
  | 'error';

/**
 * Which creation flow started the roadmap this slice is tracking.
 *
 * This slice is SHARED: goal discovery hands its final roadmap to the same
 * pending/result machinery the chat flow uses, which is what lets it reuse the
 * Progress banner, the websocket reconnect, the app-resume refetch, and the
 * completion navigation instead of growing a parallel copy of all of it.
 *
 * The cost of sharing is that `status === 'creating'` alone no longer tells you
 * where the user came from — and every "Continue" affordance built on it used
 * to send them to the chat screen. A user who never saw a chat would be dropped
 * into one, looking at a loader for a conversation they never had.
 *
 * So the source travels with the job. Every consumer that routes on this
 * slice's status must branch on it.
 */
export type RoadmapCreationSource = 'known_goal_chat' | 'goal_discovery_form';

/** What an unlabelled roadmap creation means. */
export const DEFAULT_ROADMAP_CREATION_SOURCE: RoadmapCreationSource =
  'known_goal_chat';

export type JobStatusResponseType = {
  type: 'status';
  job_id: string;
  progress: number;
  status: string;
  message: string;
};

interface AIRoadmapCreationState {
  status: AIRoadmapCreationStatus;
  messages: MessageItem[];
  currentPromptIndex: number;
  isTyping: boolean;
  isConversationRunning: boolean;
  error: string | null;
  formData: Record<string, string>;
  createdAt: number | null;
  createdRoadmap: RoadmapType | null;
  aiRoadmapCreationJobResponse: RoadmapCreationJobResponse | null;
  jobStatusResponse?: JobStatusResponseType | null;
  /**
   * Which flow started the roadmap currently being tracked. Persisted with the
   * rest of the slice, so a source-aware Continue survives an app restart.
   *
   * Optional in the type because a draft persisted by an older build has no
   * such field; every read goes through `selectRoadmapCreationSource`, which
   * substitutes the chat default so restored state behaves exactly as it did
   * before.
   */
  pendingSource?: RoadmapCreationSource;
}

const initialState: AIRoadmapCreationState = {
  status: 'idle',
  messages: [],
  currentPromptIndex: 0,
  isTyping: false,
  isConversationRunning: true,
  error: null,
  formData: {},
  createdAt: null,
  createdRoadmap: null,
  aiRoadmapCreationJobResponse: null,
  pendingSource: DEFAULT_ROADMAP_CREATION_SOURCE,
};

const aiRoadmapCreationSlice = createSlice({
  name: 'aiRoadmapCreation',
  initialState,
  reducers: {
    startCreationSessionAction: (state) => {
      state.status = 'collecting';
      // Opening the chat flow claims the slice for chat. Without this, a draft
      // left over from a goal-discovery roadmap would keep routing the chat
      // user's own Continue back into goal discovery.
      state.pendingSource = 'known_goal_chat';
      state.messages = [];
      state.currentPromptIndex = 0;
      state.isTyping = false;
      state.isConversationRunning = true;
      state.error = null;
      state.formData = {};
      state.createdAt = Date.now();
    },

    addMessageAction: (state, action: PayloadAction<MessageItem>) => {
      state.messages.push(action.payload);
    },

    updateMessageAction: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<MessageItem> }>,
    ) => {
      const messageIndex = state.messages.findIndex(
        (msg) => msg.id === action.payload.id,
      );
      if (messageIndex !== -1) {
        state.messages[messageIndex] = {
          ...state.messages[messageIndex],
          ...action.payload.updates,
        };
      }
    },

    setIsTypingAction: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    incrementPromptIndexAction: (state) => {
      state.currentPromptIndex += 1;
    },

    stopConversationAction: (state) => {
      state.isConversationRunning = false;
    },

    updateFormDataAction: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.formData[action.payload.key] = action.payload.value;
    },

    /**
     * Begin tracking a roadmap generation.
     *
     * The payload names the flow that started it. It is optional so the
     * existing chat call sites keep working untouched and keep meaning
     * "known_goal_chat".
     */
    startRoadmapCreationAction: (
      state,
      action: PayloadAction<RoadmapCreationSource | undefined>,
    ) => {
      state.status = 'creating';
      state.error = null;
      state.aiRoadmapCreationJobResponse = null;
      state.jobStatusResponse = null;
      state.pendingSource = action.payload ?? DEFAULT_ROADMAP_CREATION_SOURCE;
    },

    completeRoadmapCreationAction: (
      state,
      action: PayloadAction<RoadmapType>,
    ) => {
      state.status = 'completed';
      state.createdRoadmap = action.payload;
      state.error = null;
    },

    setCreationErrorAction: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.createdRoadmap = null;
      state.error = action.payload;
      state.aiRoadmapCreationJobResponse = null;
      state.jobStatusResponse = null;
    },

    setAIRoadmapJobCreationResponseAction: (
      state,
      action: PayloadAction<RoadmapCreationJobResponse>,
    ) => {
      state.aiRoadmapCreationJobResponse = action.payload;
    },
    setAiJobStatusAction: (
      state,
      action: PayloadAction<JobStatusResponseType | null>,
    ) => {
      state.jobStatusResponse = action.payload;
    },

    // Reset the entire state
    resetCreationStateAction: () => initialState,
  },
});

export const {
  startCreationSessionAction,
  addMessageAction,
  updateMessageAction,
  setIsTypingAction,
  incrementPromptIndexAction,
  stopConversationAction,
  updateFormDataAction,
  startRoadmapCreationAction,
  completeRoadmapCreationAction,
  setCreationErrorAction,
  resetCreationStateAction,
  setAIRoadmapJobCreationResponseAction,
  setAiJobStatusAction,
} = aiRoadmapCreationSlice.actions;

// Selectors
export const selectAIRoadmapCreationState = createAppSelector(
  (state) => state.aiRoadmapCreation,
);

export const selectAIRoadmapCreationStatus = createAppSelector(
  (state) => state.aiRoadmapCreation.status,
);

export const selectAIRoadmapMessages = createAppSelector(
  (state) => state.aiRoadmapCreation.messages,
);

export const selectAIRoadmapFormData = createAppSelector(
  (state) => state.aiRoadmapCreation.formData,
);

export const selectIsRoadmapCreating = createAppSelector(
  (state) => state.aiRoadmapCreation.status === 'creating',
);

export const selectCurrentPromptIndex = createAppSelector(
  (state) => state.aiRoadmapCreation.currentPromptIndex,
);

export const selectIsTyping = createAppSelector(
  (state) => state.aiRoadmapCreation.isTyping,
);

export const selectIsConversationRunning = createAppSelector(
  (state) => state.aiRoadmapCreation.isConversationRunning,
);

export const selectIsAIRoadmapInProgress = createAppSelector(
  (state) => state.aiRoadmapCreation.status === 'creating',
);

export const selectCreatedRoadmapId = createAppSelector(
  (state) => state.aiRoadmapCreation.createdRoadmap?.roadmap_id || null,
);

export const selectCreatedRoadmap = createAppSelector(
  (state) => state.aiRoadmapCreation.createdRoadmap,
);

export const selectJobStatusResponse = createAppSelector(
  (state) => state.aiRoadmapCreation.jobStatusResponse,
);

/**
 * Which flow started the roadmap currently being tracked.
 *
 * Falls back to the chat source, so state persisted by a build without this
 * field — or any code path that never set it — behaves exactly as it did
 * before. Every routing decision made on this slice's status must consult this.
 */
export const selectRoadmapCreationSource = createAppSelector(
  (state) =>
    state.aiRoadmapCreation.pendingSource ?? DEFAULT_ROADMAP_CREATION_SOURCE,
);

/**
 * True when the roadmap being generated came from goal discovery.
 *
 * Consumers use this to keep a goal-discovery user out of the chat screen: a
 * roadmap they started from a form must never resume into a conversation.
 */
export const selectIsGoalDiscoveryRoadmapPending = createAppSelector(
  (state) =>
    (state.aiRoadmapCreation.pendingSource ??
      DEFAULT_ROADMAP_CREATION_SOURCE) === 'goal_discovery_form' &&
    (state.aiRoadmapCreation.status === 'creating' ||
      state.aiRoadmapCreation.status === 'error'),
);

export const selectShouldShowAIRoadmapBanner = createAppSelector((state) => {
  const { status, messages, createdRoadmap } = state.aiRoadmapCreation;
  const hasUserMessage = messages.some((msg) => msg.type === 'user');

  // Only show banner if:
  // 1. Status is 'completed' AND createdRoadmap exists, OR
  // 2. Status is 'creating', OR
  // 3. Status is 'collecting' AND at least one user message exists
  return (
    (status === 'completed' && createdRoadmap !== null) ||
    status === 'creating' ||
    (status === 'collecting' && hasUserMessage) ||
    status === 'error'
  );
});

export const selectIsAIRoadmapInDraft = createAppSelector((state) => {
  const { status, messages } = state.aiRoadmapCreation;
  const hasUserMessage = messages.some((msg) => msg.type === 'user');

  // Draft state: user has started answering but hasn't completed the form
  return status === 'collecting' && hasUserMessage;
});

export const aiRoadmapCreationReducer = aiRoadmapCreationSlice.reducer;
export const aiRoadmapCreationSlicePath = aiRoadmapCreationSlice.reducerPath;
