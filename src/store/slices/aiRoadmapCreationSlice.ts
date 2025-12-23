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
};

const aiRoadmapCreationSlice = createSlice({
  name: 'aiRoadmapCreation',
  initialState,
  reducers: {
    // Start a new AI roadmap creation session
    startCreationSessionAction: (state) => {
      state.status = 'collecting';
      state.messages = [];
      state.currentPromptIndex = 0;
      state.isTyping = false;
      state.isConversationRunning = true;
      state.error = null;
      state.formData = {};
      state.createdAt = Date.now();
    },

    // Add a message to the conversation
    addMessageAction: (state, action: PayloadAction<MessageItem>) => {
      state.messages.push(action.payload);
    },

    // Update a message (e.g., to stop typing animation)
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

    // Set typing state
    setIsTypingAction: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    // Move to next prompt
    incrementPromptIndexAction: (state) => {
      state.currentPromptIndex += 1;
    },

    // Stop conversation
    stopConversationAction: (state) => {
      state.isConversationRunning = false;
    },

    // Update form data with user responses
    updateFormDataAction: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.formData[action.payload.key] = action.payload.value;
    },

    // Set status to creating when API call starts
    startRoadmapCreationAction: (state) => {
      state.status = 'creating';
      state.error = null;
    },

    // Set status to completed when API call succeeds
    completeRoadmapCreationAction: (
      state,
      action: PayloadAction<RoadmapType>,
    ) => {
      state.status = 'completed';
      state.createdRoadmap = action.payload;
      state.error = null;
    },

    // Set error when API call fails
    setCreationErrorAction: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.createdRoadmap = null;
      state.error = action.payload;
    },

    setAIRoadmapJobCreationResponseAction: (
      state,
      action: PayloadAction<RoadmapCreationJobResponse>,
    ) => {
      state.aiRoadmapCreationJobResponse = action.payload;
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
    (status === 'collecting' && hasUserMessage)
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
