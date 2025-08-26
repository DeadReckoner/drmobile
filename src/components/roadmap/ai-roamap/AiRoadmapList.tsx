import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { AppView } from '@/components/ui';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';

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

const SYSTEM_PROMPTS = [
  {
    id: 'goal_name',
    question: "Let's get started! What's your goal name?",
  },
  {
    id: 'goal_description',
    question: 'Can you describe your goal in a few sentences?',
  },
  {
    id: 'goal_importance',
    question: 'Why does this goal matter to you?',
  },
  {
    id: 'target_date',
    question: "What's your target completion date?",
  },
  {
    id: 'weekly_commitment',
    question: 'How much time can you commit to this goal weekly?',
  },
  {
    id: 'frequency',
    question:
      'How frequently would you like to work on this? (e.g. Daily, Weekly)',
  },
  {
    id: 'constraints',
    question: 'Are there any constraints or blockers we should be aware of?',
  },
  {
    id: 'skill_level',
    question: "What's your current skill level or starting point?",
  },
];

export const AiRoadmapList = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isConversationRunning, setIsConversationRunning] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const formData: FormData[] = [];

  useEffect(() => {
    if (currentPromptIndex < SYSTEM_PROMPTS.length) {
      // Add delay before starting to type the next system message
      setTimeout(() => {
        startTypingSystemMessage();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex]);

  // Handle smooth scrolling when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeoutId);
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
    if (!message.trim() || isTyping) return;

    const userMessage: MessageItem = {
      id: `user-${currentPromptIndex}`,
      type: 'user',
      content: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Store the input value before clearing
    const inputValue = message.trim();

    // Store form data
    const currentPrompt = SYSTEM_PROMPTS[currentPromptIndex];
    formData.push({
      id: currentPrompt.id,
      question: currentPrompt.question,
      answer: inputValue,
    });

    // Move to next prompt or complete conversation
    if (currentPromptIndex + 1 < SYSTEM_PROMPTS.length) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      // Add final thank you message
      setIsConversationRunning(false);

      setTimeout(() => {
        const thankYouMessage: MessageItem = {
          id: 'thank-you',
          type: 'system',
          content: "Thanks! I'm building your personalized roadmap now.",
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
    );
  };

  return (
    <KeyboardGestureArea style={styles.container} interpolator="ios">
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <AppView flex-1>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => renderMessage(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            onLayout={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            ListFooterComponent={() => <AppView height={16} />}
          />

          <Composer
            disabled={!isConversationRunning || isTyping}
            onSend={(message) => handleUserSubmit(message)}
          />
        </AppView>
      </KeyboardAvoidingView>
    </KeyboardGestureArea>
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
    paddingTop: 90,
    paddingBottom: 60,
  },
});
