import { useLocalization } from '@/hooks/useLocalization';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  markRoadmapHighlightSeenAction,
  selectHasSeenRoadmapHighlight,
} from '@/store/slices/onboardingSlice';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageSourcePropType, View } from 'react-native';

const TOTAL_STEPS = 6;
const TOTAL_STEPS_CUSTOM = TOTAL_STEPS - 1;

// Maps each onboarding step index to the registered target ref index.
// null means no element is highlighted for that step.
const STEP_TARGET_INDEX: Record<number, number | null> = {
  0: null, // intro – full-screen overlay, nothing highlighted
  1: 0, // overview card
  2: 2, // phase card
  3: 3, // milestone card
  4: 1, // anchor card
  5: 4,
};

// For custom roadmaps: phase step is omitted
const STEP_TARGET_INDEX_CUSTOM: Record<number, number | null> = {
  0: null, // intro – full-screen overlay, nothing highlighted
  1: 0, // overview card
  2: 3, // milestone card
  3: 1, // anchor card
  4: 4,
};

interface HighlightStep {
  title: string;
  message: string;
  image?: ImageSourcePropType;
}

export const useRoadmapFeatureHighlight = (
  isCustomRoadmap?: boolean,
  isLoading?: boolean,
) => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const hasSeenHighlight = useAppSelector(selectHasSeenRoadmapHighlight);

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPendingHighlightStart, setIsPendingHighlightStart] = useState(false);

  const targets = useRef<Record<number, View | null>>({});

  const stepTargetIndex = isCustomRoadmap
    ? STEP_TARGET_INDEX_CUSTOM
    : STEP_TARGET_INDEX;
  const totalSteps = isCustomRoadmap ? TOTAL_STEPS_CUSTOM : TOTAL_STEPS;

  const setTargetRef = useCallback((index: number, ref: View | null) => {
    targets.current[index] = ref;
  }, []);

  const getTarget = useCallback(() => {
    const targetIndex = stepTargetIndex[currentStep];
    if (targetIndex === null || targetIndex === undefined) return undefined;
    return targets.current[targetIndex] ?? undefined;
  }, [currentStep, stepTargetIndex]);

  const allSteps: HighlightStep[] = [
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
    {
      title: t('feature_highlight.manage_roadmap_title'),
      message: t('feature_highlight.manage_roadmap_message'),
      image: require('assets/images/manage_roadmap.png') as ImageSourcePropType,
    },
  ];

  const steps = isCustomRoadmap
    ? allSteps.filter((_, i) => i !== 2) // remove phase step
    : allSteps;

  const startHighlight = useCallback(() => {
    if (!hasSeenHighlight) {
      setCurrentStep(0);
      if (isLoading) {
        setIsPendingHighlightStart(true);
      } else {
        setIsVisible(true);
      }
    }
  }, [hasSeenHighlight, isLoading]);

  useEffect(() => {
    if (!isLoading && isPendingHighlightStart) {
      setIsPendingHighlightStart(false);
      setIsVisible(true);
    }
  }, [isLoading, isPendingHighlightStart]);

  const closeHighlight = useCallback(() => {
    setIsVisible(false);
    dispatch(markRoadmapHighlightSeenAction());
  }, [dispatch]);

  const moveNext = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep < totalSteps) {
      setCurrentStep(nextStep);
    } else {
      closeHighlight();
    }
  }, [currentStep, totalSteps, closeHighlight]);

  return {
    isVisible,
    currentStep,
    steps,
    totalSteps,
    hasSeenHighlight,
    isPendingHighlightStart,
    setTargetRef,
    getTarget,
    startHighlight,
    moveNext,
    closeHighlight,
  };
};
