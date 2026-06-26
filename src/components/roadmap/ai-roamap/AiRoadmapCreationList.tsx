import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { GradientBackdrop } from '@/components/GradientBackdrop';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AiRoadmapCreationLoader } from '@/components/roadmap/ai-roamap/AiRoadmapCreationLoader';
import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useCreateAIRoadmapMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { roadmapApi } from '@/store/apis/roadmapApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addMessageAction,
  incrementPromptIndexAction,
  MessageItem,
  resetCreationStateAction,
  selectAIRoadmapCreationState,
  selectAIRoadmapFormData,
  selectCanUndoAIRoadmap,
  selectCurrentPromptIndex,
  selectIsConversationRunning,
  selectIsTyping,
  setAIRoadmapJobCreationResponseAction,
  setCreationErrorAction,
  setIsTypingAction,
  startCreationSessionAction,
  startRoadmapCreationAction,
  stopConversationAction,
  undoLastStepAction,
  updateFormDataAction,
  updateMessageAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import { Animations } from '@/utils/animation.utils';
import { router } from 'expo-router';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from 'react-native-ui-lib';

// --- Timing constants (single source of truth for the animation feel) ---
const SYSTEM_PROMPT_DELAY = 300; // pause before a system prompt starts typing
const THANK_YOU_DELAY = 500; // pause before the closing "thank you" message
const CREATE_API_DELAY = 5200; // let the thank-you finish before hitting the API
const EXIT_DURATION = 250; // undo fade + collapse duration
const ROW_GAP = 8; // vertical gap between message rows

/**
 * A single chat row.
 *
 * - Enters with a simple fade/slide (transform + opacity only, so it never
 *   changes the list's content height and therefore never fights the scroll).
 * - When `isExiting` (undo), it collapses its height, margin and opacity to
 *   zero in one coordinated pass. Because the row is still part of the list
 *   data while it collapses, the rows below slide up smoothly via the
 *   FlatList's `itemLayoutAnimation` instead of snapping.
 *
 * The entering layout-animation lives on the outer wrapper while the custom
 * style lives on the inner wrapper — Reanimated warns if a layout animation
 * and an animated `opacity`/`height` share the same node.
 */
const MessageRow = memo(
  ({
    item,
    isExiting,
    onTypingComplete,
  }: {
    item: MessageItem;
    isExiting: boolean;
    onTypingComplete: (_item: MessageItem) => void;
  }) => {
    // 0 = fully expanded/visible, 1 = fully collapsed/hidden.
    const collapse = useSharedValue(0);
    const contentHeight = useSharedValue(0);

    const handleLayout = (event: LayoutChangeEvent) => {
      contentHeight.value = event.nativeEvent.layout.height;
    };

    useEffect(() => {
      if (isExiting) {
        collapse.value = withTiming(1, { duration: EXIT_DURATION });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isExiting]);

    const animatedStyle = useAnimatedStyle(() => {
      // While expanded, let the content drive its own height (auto layout).
      if (collapse.value === 0) {
        return { opacity: 1, marginBottom: ROW_GAP };
      }
      const visible = 1 - collapse.value;
      return {
        opacity: visible,
        height: contentHeight.value * visible,
        marginBottom: ROW_GAP * visible,
        overflow: 'hidden',
      };
    });

    return (
      <Animated.View entering={Animations.Entry.FadeInDown()}>
        <Animated.View style={animatedStyle}>
          <View onLayout={handleLayout}>
            <Message
              id={item.id}
              type={item.type}
              content={item.content}
              isTyping={item.isTyping}
              onTypingComplete={() => onTypingComplete(item)}
            />
          </View>
        </Animated.View>
      </Animated.View>
    );
  },
);
MessageRow.displayName = 'MessageRow';

const getSystemPrompts = (t: (_key: TranslationKeysType) => string) => {
  return [
    { id: 'welcome', question: t('ai_roadmap.prompts.welcome') },
    { id: 'goalName', question: t('ai_roadmap.prompts.goal_name') },
    {
      id: 'goalDescription',
      question: t('ai_roadmap.prompts.goal_description'),
    },
    { id: 'goalImportance', question: t('ai_roadmap.prompts.goal_importance') },
    {
      id: 'targetCompletionDate',
      question: t('ai_roadmap.prompts.target_date'),
    },
    {
      id: 'weeklyTimeCommitment',
      question: t('ai_roadmap.prompts.weekly_commitment'),
    },
    { id: 'workFrequency', question: t('ai_roadmap.prompts.frequency') },
    { id: 'constraints', question: t('ai_roadmap.prompts.constraints') },
    { id: 'currentSkillLevel', question: t('ai_roadmap.prompts.skill_level') },
    {
      id: 'additionalContext',
      question: t('ai_roadmap.prompts.additional_context'),
    },
  ];
};

export const AiRoadmapCreationList = () => {
  const { t } = useLocalization();
  const SYSTEM_PROMPTS = getSystemPrompts(t);
  const dispatch = useAppDispatch();

  const { error, status } = useAppSelector(selectAIRoadmapCreationState);
  const messages = useAppSelector((state) => state.aiRoadmapCreation.messages);
  const currentPromptIndex = useAppSelector(selectCurrentPromptIndex);
  const isConversationRunning = useAppSelector(selectIsConversationRunning);
  const isTyping = useAppSelector(selectIsTyping);
  const formData = useAppSelector(selectAIRoadmapFormData);
  const canUndo = useAppSelector(selectCanUndoAIRoadmap);

  const [createAIRoadmap] = useCreateAIRoadmapMutation();

  const flatListRef = useRef<FlatList>(null);
  const thankYouTimeout = useRef<NodeJS.Timeout | null>(null);
  const createAIRoadmapApiTimeout = useRef<NodeJS.Timeout | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasStartedPrompt = useRef<Set<number>>(new Set());
  // Tracks the FlatList content height so we only auto-scroll when content
  // GROWS (new message / typing), never when it shrinks (undo collapse).
  const prevContentHeight = useRef(0);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const isUndoing = exitingIds.size > 0;

  const scrollToEnd = useCallback((animated = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  // --- Conversation orchestration -----------------------------------------

  useEffect(() => {
    if (status === 'idle') {
      hasStartedPrompt.current.clear();
      dispatch(startCreationSessionAction());
    } else if (status === 'collecting') {
      // Re-hydrate which prompts already exist (e.g. returning to a draft) so
      // the effect below doesn't re-add them.
      messages.forEach((msg) => {
        if (msg.id.startsWith('system-')) {
          const index = parseInt(msg.id.split('-')[1], 10);
          if (!isNaN(index)) hasStartedPrompt.current.add(index);
        }
      });
    }
    // 'creating' just shows the loader — no new prompts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Drive the next system prompt once it's this prompt's turn.
  useEffect(() => {
    const shouldStartPrompt =
      status === 'collecting' &&
      currentPromptIndex < SYSTEM_PROMPTS.length &&
      !isTyping &&
      !hasStartedPrompt.current.has(currentPromptIndex);

    if (!shouldStartPrompt) return;

    hasStartedPrompt.current.add(currentPromptIndex);
    const timeout = setTimeout(addSystemPrompt, SYSTEM_PROMPT_DELAY);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex, status, isTyping]);

  // Keep the latest message visible when the keyboard opens (content height
  // doesn't change here, so onContentSizeChange won't cover it).
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () =>
      scrollToEnd(),
    );
    return () => {
      keyboardDidShow.remove();
      [thankYouTimeout, createAIRoadmapApiTimeout, undoTimeout].forEach(
        (ref) => {
          if (ref.current) {
            clearTimeout(ref.current);
            ref.current = null;
          }
        },
      );
    };
  }, [scrollToEnd]);

  const addSystemPrompt = () => {
    if (currentPromptIndex >= SYSTEM_PROMPTS.length) return;

    dispatch(setIsTypingAction(true));
    dispatch(
      addMessageAction({
        id: `system-${currentPromptIndex}`,
        type: 'system',
        content: SYSTEM_PROMPTS[currentPromptIndex].question,
        isTyping: true,
      }),
    );
  };

  // Single auto-scroll authority: scroll to the bottom only when the content
  // grew. This replaces the previous stack of competing timeouts/intervals
  // and removes the flicker they caused on submit.
  const handleContentSizeChange = (_width: number, height: number) => {
    if (height > prevContentHeight.current) scrollToEnd();
    prevContentHeight.current = height;
  };

  const handleTypingComplete = useCallback(
    (item: MessageItem) => {
      if (item.type !== 'system') return;
      dispatch(
        updateMessageAction({ id: item.id, updates: { isTyping: false } }),
      );
      dispatch(setIsTypingAction(false));
      // The welcome prompt has no user answer, so advance automatically.
      if (item.id === 'system-0') dispatch(incrementPromptIndexAction());
    },
    [dispatch],
  );

  // --- Roadmap creation ----------------------------------------------------

  const handleAiRoadmapCreation = async (
    data: Record<string, string>,
    timeout: number = CREATE_API_DELAY,
  ) => {
    if (createAIRoadmapApiTimeout.current) {
      clearTimeout(createAIRoadmapApiTimeout.current);
      createAIRoadmapApiTimeout.current = null;
    }

    const executeCreation = async () => {
      try {
        dispatch(startRoadmapCreationAction());
        const creationJobResponse = await createAIRoadmap(data).unwrap();
        dispatch(setAIRoadmapJobCreationResponseAction(creationJobResponse));
        if (creationJobResponse?.status === 'failed') {
          dispatch(setCreationErrorAction(t('common.something_went_wrong')));
        }
      } catch (error: unknown) {
        let errorMessage = t('common.something_went_wrong');
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'error' in error &&
          typeof (error as Record<string, unknown>).error === 'string'
        ) {
          errorMessage = (error as { error: string }).error;
        }
        dispatch(setCreationErrorAction(errorMessage));
      } finally {
        createAIRoadmapApiTimeout.current = null;
      }
    };

    if (timeout === 0) {
      await executeCreation();
    } else {
      createAIRoadmapApiTimeout.current = setTimeout(executeCreation, timeout);
    }
  };

  const handleNavigateToRoadmap = () => {
    clearPendingTimeouts();
    dispatch(
      roadmapApi.endpoints.getRoadmaps.initiate(undefined, {
        forceRefetch: true,
      }),
    );
    dispatch(resetCreationStateAction());
    router.replace('/roadmap/roadmap-execution');
  };

  const handleRetry = () => handleAiRoadmapCreation(formData, 0);

  const clearPendingTimeouts = () => {
    if (thankYouTimeout.current) {
      clearTimeout(thankYouTimeout.current);
      thankYouTimeout.current = null;
    }
    if (createAIRoadmapApiTimeout.current) {
      clearTimeout(createAIRoadmapApiTimeout.current);
      createAIRoadmapApiTimeout.current = null;
    }
  };

  // --- Undo ----------------------------------------------------------------

  const handleUndo = () => {
    if (!canUndo || isUndoing) return;
    clearPendingTimeouts();

    // Find the last user message — undo drops it and everything after it.
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        lastUserIndex = i;
        break;
      }
    }
    if (lastUserIndex === -1) return;

    // Mirror the reducer's prompt reset so the typing effect re-adds the
    // prompts that get removed instead of thinking they were already shown.
    const precedingMessage = messages[lastUserIndex - 1];
    if (precedingMessage?.id.startsWith('system-')) {
      const newIndex = parseInt(precedingMessage.id.split('-')[1], 10);
      if (!isNaN(newIndex)) {
        for (let i = newIndex + 1; i < SYSTEM_PROMPTS.length; i++) {
          hasStartedPrompt.current.delete(i);
        }
      }
    }

    // Collapse the doomed rows first (they stay in the data so nothing
    // reflows), then drop them from state once the animation has finished.
    setExitingIds(new Set(messages.slice(lastUserIndex).map((m) => m.id)));
    undoTimeout.current = setTimeout(() => {
      dispatch(undoLastStepAction());
      setExitingIds(new Set());
      undoTimeout.current = null;
    }, EXIT_DURATION);
  };

  // --- User input ----------------------------------------------------------

  const handleUserSubmit = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isTyping) return;

    const prompt = SYSTEM_PROMPTS[currentPromptIndex];
    dispatch(
      addMessageAction({ id: prompt.id, type: 'user', content: trimmed }),
    );
    dispatch(updateFormDataAction({ key: prompt.id, value: trimmed }));

    const isLastPrompt = currentPromptIndex + 1 >= SYSTEM_PROMPTS.length;
    if (!isLastPrompt) {
      dispatch(incrementPromptIndexAction());
      return;
    }

    // Final answer collected — close the conversation and kick off creation.
    dispatch(stopConversationAction());
    thankYouTimeout.current = setTimeout(() => {
      dispatch(
        addMessageAction({
          id: 'thank-you',
          type: 'system',
          content: t('ai_roadmap.prompts.thank_you'),
          isTyping: true,
        }),
      );
      Keyboard.dismiss();
      handleAiRoadmapCreation({ ...formData, [prompt.id]: trimmed });
    }, THANK_YOU_DELAY);
  };

  // --- Render --------------------------------------------------------------

  const renderItem = useCallback(
    ({ item }: { item: MessageItem }) => (
      <MessageRow
        item={item}
        isExiting={exitingIds.has(item.id)}
        onTypingComplete={handleTypingComplete}
      />
    ),
    [exitingIds, handleTypingComplete],
  );

  const renderFooter = () => (
    <>
      {status === 'error' && (
        <AppView
          marginT-16
          reanimated
          entering={Animations.Entry.FadeInDownWithSpring()}
          exiting={Animations.Exit.FadeOutDown()}>
          <AppButton
            onPress={handleRetry}
            backgroundColor={Colors.error}
            paddingH-20
            paddingV-12
            br40
            row
            centerV
            gap-8>
            <AppIcon
              set="Feather"
              name="refresh-cw"
              size={16}
              color={Colors.white}
            />
            <Divider />
            <AppView flex>
              <AppText body2 light lightregular white>
                {error}
              </AppText>
              <TranslatedText
                body2
                light
                translationKey="ai_roadmap.retry_creation"
                color={Colors.white}
              />
            </AppView>
          </AppButton>
        </AppView>
      )}
      <AppView width={10} height={24} />
    </>
  );

  const undoDisabled = !canUndo || isUndoing;

  return (
    <>
      {status === 'creating' && <AiRoadmapCreationLoader />}
      <KeyboardGestureArea style={styles.container} interpolator="ios">
        <AppView style={styles.container}>
          <AppView paddingH-16 paddingB-16>
            <AppView row spread centerV>
              <AppView flex>
                <HeaderWithBack headerKey="tabs.create_tab.ai_roadmap" />
              </AppView>

              <AppView
                reanimated
                entering={Animations.Entry.FadeIn()}
                exiting={Animations.Exit.FadeOut()}>
                <AppButton onPress={handleUndo} disabled={undoDisabled}>
                  <AppIcon
                    set="Feather"
                    name="rotate-cw"
                    size={20}
                    color={undoDisabled ? Colors.outline : undefined}
                  />
                </AppButton>
              </AppView>
            </AppView>
          </AppView>

          <Animated.FlatList
            itemLayoutAnimation={LinearTransition.duration(EXIT_DURATION)}
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={handleContentSizeChange}
            ListFooterComponent={renderFooter}
          />
        </AppView>
      </KeyboardGestureArea>

      {status === 'completed' ? (
        <AppView bg-transparent pointerEvents="box-none">
          <GradientBackdrop />
          <AppButton
            style={{ position: 'absolute', bottom: 80, width: '100%' }}
            center
            onPress={handleNavigateToRoadmap}>
            <AppView
              row
              gap-8
              center
              bg-success
              br100
              padding-12
              paddingH-24
              style={{ borderColor: Colors.success }}>
              <TranslatedText
                body2
                translationKey="ai_roadmap.draft_dialog.view_button"
              />
              <AppIcon
                set="Ionicons"
                name="arrow-forward-circle-outline"
                size={24}
                color={Colors.white}
              />
            </AppView>
          </AppButton>
        </AppView>
      ) : (
        <KeyboardAvoidingView behavior="padding">
          <Composer
            disabled={
              !isConversationRunning || isTyping || currentPromptIndex === 0
            }
            onSend={handleUserSubmit}
          />
        </KeyboardAvoidingView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
