import {
  CompletionAutoCloser,
  createCompletionAutoCloser,
  StepToggleOutcome,
} from '@/hooks/habits/stepCompletion';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Binds the completion auto-closer to expo-router, real timers, and the app's
 * existing haptics.
 *
 * All of the decision-making lives in stepCompletion.ts, which is React-free
 * and directly tested; this hook is only the wiring, so the rules cannot drift
 * apart from their tests.
 */
export const useStepCompletionAutoClose = () => {
  const closerRef = useRef<CompletionAutoCloser | null>(null);

  if (closerRef.current === null) {
    closerRef.current = createCompletionAutoCloser({
      navigateBack: () => {
        // Return to wherever the user came from. Deep links and notification
        // taps can open this screen with nothing behind it, so fall back to
        // Today rather than popping off the end of the stack.
        if (router.canGoBack()) {
          router.back();
          return;
        }
        router.replace('/');
      },
      setTimer: (run, ms) => setTimeout(run, ms),
      clearTimer: (handle) => clearTimeout(handle),
      onCelebrate: () => {
        // expo-haptics is already a dependency (AppButton, HapticTab); nothing
        // new is introduced for this. Failures are ignored: a device without a
        // haptic motor must not turn a finished checklist into an error.
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
      },
    });
  }

  // Cancels a close still waiting out its delay when the screen goes away,
  // whether that is the auto-close itself or the user leaving first.
  useEffect(() => {
    const closer = closerRef.current;
    return () => closer?.cancel();
  }, []);

  return useCallback(
    (outcome: StepToggleOutcome) => closerRef.current?.handle(outcome) ?? false,
    [],
  );
};
