import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AiRoadmapCreationLoader } from '@/components/roadmap/ai-roamap/AiRoadmapCreationLoader';
import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { useCreateAIRoadmapMutation } from '@/hooks/roadmap';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  addMessageAction,
  completeRoadmapCreationAction,
  incrementPromptIndexAction,
  MessageItem,
  resetCreationStateAction,
  selectAIRoadmapCreationStatus,
  selectAIRoadmapFormData,
  selectCurrentPromptIndex,
  selectIsConversationRunning,
  selectIsTyping,
  setCreationErrorAction,
  setIsTypingAction,
  startCreationSessionAction,
  startRoadmapCreationAction,
  stopConversationAction,
  updateFormDataAction,
  updateMessageAction,
} from '@/store/slices/aiRoadmapCreationSlice';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { FlatList, Keyboard, StyleSheet } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';
import { Colors } from 'react-native-ui-lib';

const getSystemPrompts = (t: (_key: TranslationKeysType) => string) => {
  return [
    {
      id: 'goalName',
      question: t('ai_roadmap.prompts.goal_name'),
    },
    {
      id: 'goalDescription',
      question: t('ai_roadmap.prompts.goal_description'),
    },
    {
      id: 'goalImportance',
      question: t('ai_roadmap.prompts.goal_importance'),
    },
    {
      id: 'targetCompletionDate',
      question: t('ai_roadmap.prompts.target_date'),
    },
    {
      id: 'weeklyTimeCommitment',
      question: t('ai_roadmap.prompts.weekly_commitment'),
    },
    {
      id: 'workFrequency',
      question: t('ai_roadmap.prompts.frequency'),
    },
    {
      id: 'constraints',
      question: t('ai_roadmap.prompts.constraints'),
    },
    {
      id: 'currentSkillLevel',
      question: t('ai_roadmap.prompts.skill_level'),
    },
  ];
};

export const AiRoadmapCreationList = () => {
  const { t } = useLocalization();
  const SYSTEM_PROMPTS = getSystemPrompts(t);
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectAIRoadmapCreationStatus);
  const messages = useAppSelector((state) => state.aiRoadmapCreation.messages);
  const currentPromptIndex = useAppSelector(selectCurrentPromptIndex);
  const isConversationRunning = useAppSelector(selectIsConversationRunning);
  const isTyping = useAppSelector(selectIsTyping);
  const formData = useAppSelector(selectAIRoadmapFormData);

  const [createAIRoadmap] = useCreateAIRoadmapMutation();

  const flatListRef = useRef<FlatList>(null);
  const thankYouTimeout = useRef<NodeJS.Timeout | null>(null);
  const createAIRoadmapApiTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasStartedPrompt = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (status === 'idle') {
      hasStartedPrompt.current.clear();
      dispatch(startCreationSessionAction());
    } else if (status === 'collecting') {
      messages.forEach((msg) => {
        if (msg.id.startsWith('system-')) {
          const index = parseInt(msg.id.split('-')[1], 10);
          if (!isNaN(index)) {
            hasStartedPrompt.current.add(index);
          }
        }
      });
    }
    // If status is 'creating', just show the loader - don't make new API calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (
      status === 'collecting' &&
      currentPromptIndex < SYSTEM_PROMPTS.length &&
      !isTyping &&
      !hasStartedPrompt.current.has(currentPromptIndex)
    ) {
      hasStartedPrompt.current.add(currentPromptIndex);
      const timeout = setTimeout(() => {
        startTypingSystemMessage();
      }, 300);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex, status, isTyping]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (thankYouTimeout.current) {
        clearTimeout(thankYouTimeout.current);
      }
      if (createAIRoadmapApiTimeout.current) {
        clearTimeout(createAIRoadmapApiTimeout.current);
      }
    };
  }, []);

  const startTypingSystemMessage = () => {
    if (currentPromptIndex >= SYSTEM_PROMPTS.length) return;

    const prompt = SYSTEM_PROMPTS[currentPromptIndex];
    dispatch(setIsTypingAction(true));

    const systemMessage: MessageItem = {
      id: `system-${currentPromptIndex}`,
      type: 'system',
      content: prompt.question,
      isTyping: true,
    };

    dispatch(addMessageAction(systemMessage));
  };

  const handleAiRoadmapCreation = (formData: Record<string, string>) => {
    createAIRoadmapApiTimeout.current = setTimeout(async () => {
      try {
        dispatch(startRoadmapCreationAction());
        const roadmap = await createAIRoadmap(formData).unwrap();
        dispatch(setDraftRoadmapAction(roadmap));
        dispatch(completeRoadmapCreationAction(roadmap));
      } catch (error) {
        const errorMessage = getApiErrorMessage(error) || 'Unknown error';
        dispatch(setCreationErrorAction(errorMessage));
      } finally {
        if (createAIRoadmapApiTimeout.current) {
          clearTimeout(createAIRoadmapApiTimeout.current);
        }
      }
    }, 1200);
  };

  const handleNavigateToRoadmap = () => {
    router.push('/roadmap/roadmap-details');
  };

  const handleRetry = () => {
    handleAiRoadmapCreation(formData);
  };

  const handleUserSubmit = (message: string) => {
    if (!message.trim() || isTyping) return;

    const prompt = SYSTEM_PROMPTS[currentPromptIndex];
    const userMessage: MessageItem = {
      id: prompt.id,
      type: 'user',
      content: message.trim(),
    };

    dispatch(addMessageAction(userMessage));
    dispatch(updateFormDataAction({ key: prompt.id, value: message.trim() }));

    if (currentPromptIndex + 1 < SYSTEM_PROMPTS.length) {
      dispatch(incrementPromptIndexAction());
    } else {
      dispatch(stopConversationAction());
      thankYouTimeout.current = setTimeout(async () => {
        const thankYouMessage: MessageItem = {
          id: 'thank-you',
          type: 'system',
          content: t('ai_roadmap.prompts.thank_you'),
          isTyping: true,
        };
        dispatch(addMessageAction(thankYouMessage));
        Keyboard.dismiss();

        const allFormData = {
          ...formData,
          [prompt.id]: message.trim(),
        };
        handleAiRoadmapCreation(allFormData);
      }, 500);
    }
  };

  const renderMessage = ({
    id,
    type,
    content,
    isTyping: messageIsTyping,
  }: MessageItem) => {
    return (
      <AppView
        key={id}
        reanimated
        entering={Animations.Entry.FadeInDownWithSpring()}>
        <Message
          key={id}
          id={id}
          type={type}
          content={content}
          isTyping={messageIsTyping}
          onTypingComplete={() => {
            if (type === 'system') {
              dispatch(
                updateMessageAction({
                  id,
                  updates: { isTyping: false },
                }),
              );
              dispatch(setIsTypingAction(false));
            }
          }}
        />
      </AppView>
    );
  };

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
            <TranslatedText
              translationKey="ai_roadmap.retry_creation"
              color={Colors.white}
            />
          </AppButton>
        </AppView>
      )}
      <AppView height={32} />
    </>
  );

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
                <AppButton
                  onPress={() => {
                    hasStartedPrompt.current.clear();
                    dispatch(resetCreationStateAction());
                    // After reset, the status will become 'idle', and the useEffect will trigger
                    // which will call startCreationSessionAction and start the first message
                  }}>
                  <AppIcon set="Feather" name="rotate-cw" size={20} />
                </AppButton>
              </AppView>
            </AppView>
          </AppView>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => renderMessage(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            onLayout={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            ListFooterComponent={renderFooter}
          />
        </AppView>
      </KeyboardGestureArea>

      {status === 'completed' ? (
        <AppButton
          style={{ position: 'absolute', bottom: 40, left: 0, right: 0 }}
          center
          onPress={handleNavigateToRoadmap}>
          <AppView
            row
            gap-8
            center
            bg-success
            br100
            padding-10
            paddingH-16
            style={{
              borderColor: Colors.success,
            }}>
            <TranslatedText
              caption
              translationKey="ai_roadmap.draft_dialog.view_button"
            />
            <AppIcon
              set="Ionicons"
              name="arrow-forward-circle-outline"
              size={20}
              color={Colors.white}
            />
          </AppView>
        </AppButton>
      ) : (
        <KeyboardAvoidingView behavior="padding">
          <Composer
            disabled={!isConversationRunning || isTyping}
            onSend={(message) => handleUserSubmit(message)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
});
