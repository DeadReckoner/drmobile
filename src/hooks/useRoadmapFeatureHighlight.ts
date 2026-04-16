import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  markRoadmapHighlightSeenAction,
  selectHasSeenRoadmapHighlight,
} from '@/store/slices/onboardingSlice';
import { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

const TOTAL_STEPS = 5;

// Maps each onboarding step index to the registered target ref index.
// null means no element is highlighted for that step.
const STEP_TARGET_INDEX: Record<number, number | null> = {
  0: null, // intro – full-screen overlay, nothing highlighted
  1: 0, // overview card
  2: 2, // phase card
  3: 3, // milestone card
  4: 1, // anchor card
};

interface HighlightStep {
  title: string;
  message: string;
}

export const useRoadmapFeatureHighlight = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const hasSeenHighlight = useAppSelector(selectHasSeenRoadmapHighlight);

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const targets = useRef<Record<number, View | null>>({});

  const setTargetRef = useCallback((index: number, ref: View | null) => {
    targets.current[index] = ref;
  }, []);

  const getTarget = useCallback(() => {
    const targetIndex = STEP_TARGET_INDEX[currentStep];
    if (targetIndex === null || targetIndex === undefined) return undefined;
    return targets.current[targetIndex] ?? undefined;
  }, [currentStep]);

  const steps: HighlightStep[] = [
    {
      title: t('feature_highlight.roadmap_intro_title'),
      message: t('feature_highlight.roadmap_intro_message'),
    },
    {
      title: t('feature_highlight.roadmap_overview_title'),
      message: t('feature_highlight.roadmap_overview_message'),
    },
    {
      title: t('feature_highlight.phase_title'),
      message: t('feature_highlight.phase_message'),
    },
    {
      title: t('feature_highlight.milestone_title'),
      message: t('feature_highlight.milestone_message'),
    },
    {
      title: t('feature_highlight.anchor_title'),
      message: t('feature_highlight.anchor_message'),
    },
  ];

  const startHighlight = useCallback(() => {
    if (!hasSeenHighlight) {
      setCurrentStep(0);
      setIsVisible(true);
    }
  }, [hasSeenHighlight]);

  const closeHighlight = useCallback(() => {
    setIsVisible(false);
    dispatch(markRoadmapHighlightSeenAction());
  }, [dispatch]);

  const moveNext = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep < TOTAL_STEPS) {
      setCurrentStep(nextStep);
    } else {
      closeHighlight();
    }
  }, [currentStep, closeHighlight]);

  return {
    isVisible,
    currentStep,
    steps,
    totalSteps: TOTAL_STEPS,
    hasSeenHighlight,
    setTargetRef,
    getTarget,
    startHighlight,
    moveNext,
    closeHighlight,
  };
};
