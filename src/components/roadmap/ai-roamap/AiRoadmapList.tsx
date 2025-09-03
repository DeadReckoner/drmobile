import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { AppView } from '@/components/ui';
import { useAppKeyboardAnimation } from '@/hooks/useAppKeyboardAnimation';
import { useLocalization } from '@/hooks/useLocalization';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Animations } from '@/utils/animation.utils';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { KeyboardGestureArea } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface MessageItem {
  id: string;
  type: 'system' | 'user';
  content: string;
  isTyping?: boolean;
}

interface FormData {
  id: string;
  question: string;
  answer: string;
}

const getSystemPrompts = (t: (_key: TranslationKeysType) => string) => {
  return [
    {
      id: 'goal_name',
      question: t('ai_roadmap.prompts.goal_name'),
    },
    {
      id: 'goal_description',
      question: t('ai_roadmap.prompts.goal_description'),
    },
    {
      id: 'goal_importance',
      question: t('ai_roadmap.prompts.goal_importance'),
    },
    {
      id: 'target_date',
      question: t('ai_roadmap.prompts.target_date'),
    },
    {
      id: 'weekly_commitment',
      question: t('ai_roadmap.prompts.weekly_commitment'),
    },
    {
      id: 'frequency',
      question: t('ai_roadmap.prompts.frequency'),
    },
    {
      id: 'constraints',
      question: t('ai_roadmap.prompts.constraints'),
    },
    {
      id: 'skill_level',
      question: t('ai_roadmap.prompts.skill_level'),
    },
  ];
};

export const AiRoadmapList = () => {
  const { t } = useLocalization();
  const SYSTEM_PROMPTS = getSystemPrompts(t);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isConversationRunning, setIsConversationRunning] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const formData: FormData[] = [];
  const { height } = useAppKeyboardAnimation();
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  useEffect(() => {
    if (currentPromptIndex < SYSTEM_PROMPTS.length) {
      setTimeout(() => {
        startTypingSystemMessage();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

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

  const handleUserSubmit = (message: string) => {
    setIsTyping(true);
    if (!message.trim() || isTyping) return;

    const userMessage: MessageItem = {
      id: `user-${currentPromptIndex}`,
      type: 'user',
      content: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const inputValue = message.trim();

    const currentPrompt = SYSTEM_PROMPTS[currentPromptIndex];
    formData.push({
      id: currentPrompt.id,
      question: currentPrompt.question,
      answer: inputValue,
    });

    if (currentPromptIndex + 1 < SYSTEM_PROMPTS.length) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setIsConversationRunning(false);
      setTimeout(() => {
        const thankYouMessage: MessageItem = {
          id: 'thank-you',
          type: 'system',
          content: t('ai_roadmap.prompts.thank_you'),
          isTyping: true,
        };
        setMessages((prev) => [...prev, thankYouMessage]);
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
