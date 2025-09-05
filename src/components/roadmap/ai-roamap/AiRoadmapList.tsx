import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AiRoadmapCreationLoader } from '@/components/roadmap/ai-roamap/AiRoadmapCreationLoader';
import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { AppView } from '@/components/ui';
import { useCreateAIRoadmapMutation } from '@/hooks/roadmap';
import { useAppKeyboardAnimation } from '@/hooks/useAppKeyboardAnimation';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch } from '@/store/hooks/store.hooks';
import { setDraftRoadmapAction } from '@/store/slices/roadmapDraftSlice';
import { Animations } from '@/utils/animation.utils';
import { getApiErrorMessage } from '@/utils/apiErrors.utils';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet } from 'react-native';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface MessageItem {
  id: string;
  type: 'system' | 'user';
  content: string;
  isTyping?: boolean;
}

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

const getFormSubmissionData = (
  messages: MessageItem[],
): Record<string, string> => {
  const formData: Record<string, string> = {};
  messages.forEach((message) => {
    if (message.type === 'user') {
      formData[message.id] = message.content;
    }
  });
  return formData;
};

export const AiRoadmapList = () => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const SYSTEM_PROMPTS = getSystemPrompts(t);
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isConversationRunning, setIsConversationRunning] = useState(true);
  const [createAIRoadmap, { isLoading: isAiRoadmapCreating }] =
    useCreateAIRoadmapMutation();
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const thankYouTimeout = useRef<NodeJS.Timeout | null>(null);
  const createAIRoadmapApiTimeout = useRef<NodeJS.Timeout | null>(null);

  const { height } = useAppKeyboardAnimation();
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  useEffect(() => {
    if (currentPromptIndex < SYSTEM_PROMPTS.length) {
      const timeout = setTimeout(() => {
        startTypingSystemMessage();
      }, 300);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex]);

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
    };
  }, []);

  const startTypingSystemMessage = () => {
    if (currentPromptIndex >= SYSTEM_PROMPTS.length) return;

    const prompt = SYSTEM_PROMPTS[currentPromptIndex];
    setIsTyping(true);

    const systemMessage: MessageItem = {
      id: `system-${currentPromptIndex}`,
      type: 'system',
      content: prompt.question,
      isTyping: true,
    };

    setMessages((prev) => [...prev, systemMessage]);
  };

  const handleAiRoadmapCreation = (messages: MessageItem[]) => {
    createAIRoadmapApiTimeout.current = setTimeout(async () => {
      try {
        const formData = getFormSubmissionData(messages);
        const roadmap = await createAIRoadmap(formData).unwrap();
        dispatch(setDraftRoadmapAction(roadmap));
        router.replace('/roadmap/roadmap-details');
      } catch (error) {
        showToast({
          type: 'failure',
          message: getApiErrorMessage(error),
        });
      } finally {
        if (createAIRoadmapApiTimeout.current) {
          clearTimeout(createAIRoadmapApiTimeout.current);
        }
      }
    }, 1200);
  };

  const handleUserSubmit = (message: string) => {
    setIsTyping(true);
    if (!message.trim() || isTyping) return;

    const userMessage: MessageItem = {
      id: SYSTEM_PROMPTS[currentPromptIndex].id,
      type: 'user',
      content: message.trim(),
    };
    const allMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, userMessage]);
    if (currentPromptIndex + 1 < SYSTEM_PROMPTS.length) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setIsConversationRunning(false);
      thankYouTimeout.current = setTimeout(async () => {
        const thankYouMessage: MessageItem = {
          id: 'thank-you',
          type: 'system',
          content: t('ai_roadmap.prompts.thank_you'),
          isTyping: true,
        };
        setMessages((prev) => [...prev, thankYouMessage]);
        Keyboard.dismiss();
        handleAiRoadmapCreation(allMessages);
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
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === id ? { ...msg, isTyping: false } : msg,
                ),
              );
              setIsTyping(false);
            }
          }}
        />
      </AppView>
    );
  };

  return (
    <>
      {isAiRoadmapCreating && <AiRoadmapCreationLoader />}
      <KeyboardGestureArea style={styles.container} interpolator="ios">
        <AppView style={styles.container}>
          <AppView paddingH-16 paddingB-16>
            <HeaderWithBack headerKey="tabs.create_tab.ai_roadmap" />
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
            ListFooterComponent={() => <AppView height={32} />}
          />

          <Composer
            disabled={!isConversationRunning || isTyping}
            onSend={(message) => handleUserSubmit(message)}
          />
          <Animated.View style={fakeView} />
        </AppView>
      </KeyboardGestureArea>
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
