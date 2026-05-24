import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { Composer } from '@/components/roadmap/ai-roamap/Composer';
import { Message } from '@/components/roadmap/ai-roamap/Message';
import { NextMilestoneGenerationLoader } from '@/components/roadmap/ai-roamap/NextMilestoneGenerationLoader';
import { AppView } from '@/components/ui';
import { useGenerateNextMilestoneMutation } from '@/hooks/roadmap';
import { MilestoneReviewAnswers } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import { MessageItem } from '@/store/slices/aiRoadmapCreationSlice';
import {
  resetMilestoneGenerationAction,
  selectIsNextMilestoneCompleted,
  selectIsNextMilestoneGenerating,
  selectNextMilestoneGenerationStatus,
  startGeneratingAction,
  startSubmittingAction,
} from '@/store/slices/nextMilestoneGenerationSlice';
import { Animations } from '@/utils/animation.utils';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardGestureArea,
} from 'react-native-keyboard-controller';
import { Colors } from 'react-native-ui-lib';

const getReviewPrompts = (t: (_key: TranslationKeysType) => string) => [
  {
    id: 'completionStatus',
    question: t('ai_roadmap.milestone_review.q1_label'),
  },
  { id: 'whatWorked', question: t('ai_roadmap.milestone_review.q2_label') },
  {
    id: 'whatDidntWork',
    question: t('ai_roadmap.milestone_review.q3_label'),
  },
  { id: 'obstacles', question: t('ai_roadmap.milestone_review.q4_label') },
  {
    id: 'paceFeedback',
    question: t('ai_roadmap.milestone_review.q5_label'),
  },
  {
    id: 'clarityFeedback',
    question: t('ai_roadmap.milestone_review.q6_label'),
  },
  { id: 'goingForward', question: t('ai_roadmap.milestone_review.q7_label') },
];

const GenerateNextMilestone = () => {
  const { t } = useLocalization();
  const PROMPTS = getReviewPrompts(t);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const params = useLocalSearchParams<{ milestoneId: string }>();

  const roadmap = useAppSelector((state) => state.roadmapDraft.roadmap);
  const generationStatus = useAppSelector(selectNextMilestoneGenerationStatus);
  const isGenerating = useAppSelector(
    selectIsNextMilestoneGenerating(params.milestoneId),
  );
  const isCompleted = useAppSelector(
    selectIsNextMilestoneCompleted(params.milestoneId),
  );

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationRunning, setIsConversationRunning] = useState(true);
  const [formData, setFormData] = useState<Partial<MilestoneReviewAnswers>>({});

  const flatListRef = useRef<FlatList>(null);
  const hasStartedPrompt = useRef<Set<number>>(new Set());
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [generateNextMilestone] = useGenerateNextMilestoneMutation();

  useEffect(() => {
    if (
      !isGenerating &&
      (generationStatus === 'error' || generationStatus === 'completed')
    ) {
      dispatch(resetMilestoneGenerationAction());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCompleted) {
      showToast({
        type: 'success',
        message: t('ai_roadmap.milestone_generation.ready_title'),
      });
      router.back();
    }
  }, [isCompleted, showToast, t]);

  useEffect(() => {
    if (
      isGenerating ||
      currentPromptIndex >= PROMPTS.length ||
      isTyping ||
      hasStartedPrompt.current.has(currentPromptIndex)
    )
      return;

    hasStartedPrompt.current.add(currentPromptIndex);
    const timeout = setTimeout(() => {
      const prompt = PROMPTS[currentPromptIndex];
      setIsTyping(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${currentPromptIndex}`,
          type: 'system',
          content: prompt.question,
          isTyping: true,
        },
      ]);
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPromptIndex, isTyping, isGenerating]);

  useEffect(() => {
    if (messages.length >= 2) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 250);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!messages.length) return;
    flatListRef.current?.scrollToEnd({ animated: true });
    if (isTyping) {
      const interval = setInterval(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isTyping, messages.length]);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  const handleUserSubmit = (message: string) => {
    if (!message.trim() || isTyping || !isConversationRunning) return;

    const prompt = PROMPTS[currentPromptIndex];

    setMessages((prev) => [
      ...prev,
      { id: `user-${prompt.id}`, type: 'user', content: message.trim() },
    ]);
    setFormData((prev) => ({ ...prev, [prompt.id]: message.trim() }));

    if (currentPromptIndex + 1 < PROMPTS.length) {
      setCurrentPromptIndex((prev) => prev + 1);
    } else {
      setIsConversationRunning(false);
      submitTimeoutRef.current = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'thank-you',
            type: 'system',
            content: t('ai_roadmap.milestone_review.thank_you'),
            isTyping: true,
          },
        ]);
        Keyboard.dismiss();

        const allFormData: MilestoneReviewAnswers = {
          ...formData,
          [prompt.id]: message.trim(),
        };
        handleApiCall(allFormData);
      }, 500);
    }
  };

  const handleApiCall = async (review: MilestoneReviewAnswers) => {
    if (!params.milestoneId || !roadmap.roadmap_id) return;

    dispatch(
      startSubmittingAction({
        milestoneId: params.milestoneId,
        roadmapId: roadmap.roadmap_id,
      }),
    );

    try {
      const jobResponse = await generateNextMilestone({
        milestoneId: params.milestoneId,
        body: {
          goalName: roadmap.goal || '',
          goalDescription: roadmap.description || '',
          goalImportance: '',
          targetCompletionDate: '',
          weeklyTimeCommitment: '',
          workFrequency: '',
          constraints: '',
          currentSkillLevel: '',
          additionalContext: '',
          review,
        },
      }).unwrap();

      dispatch(startGeneratingAction(jobResponse));
    } catch {
      dispatch(resetMilestoneGenerationAction());
      setIsConversationRunning(true);
      showToast({
        type: 'failure',
        message: t('ai_roadmap.milestone_generation.error_description'),
      });
    }
  };

  const renderMessage = ({
    id,
    type,
    content,
    isTyping: messageIsTyping,
  }: MessageItem) => (
    <AppView
      key={id}
      reanimated
      marginB-8
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
              prev.map((m) => (m.id === id ? { ...m, isTyping: false } : m)),
            );
            setIsTyping(false);
          }
        }}
      />
    </AppView>
  );

  return (
    <AppScreen paddingH-0 safeArea>
      {isGenerating && <NextMilestoneGenerationLoader />}
      <KeyboardGestureArea style={styles.container} interpolator="ios">
        <AppView style={styles.container}>
          <AppView paddingH-16 paddingB-8 row spread centerV>
            <AppView flex>
              <HeaderWithBack headerKey="feedback.title" />
            </AppView>
            <AppButton onPress={() => router.back()}>
              <AppIcon
                set="Feather"
                name="x"
                size={20}
                color={Colors.textColor}
              />
            </AppButton>
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
          />
        </AppView>
      </KeyboardGestureArea>
      <KeyboardAvoidingView behavior="padding">
        <Composer
          disabled={!isConversationRunning || isTyping}
          onSend={handleUserSubmit}
        />
      </KeyboardAvoidingView>
    </AppScreen>
  );
};

export default GenerateNextMilestone;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
