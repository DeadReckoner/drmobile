/**
 * When checking off a step should close the occurrence detail screen.
 *
 * The screen exists so the user can work through a checklist. Once the last
 * step lands, staying open makes them press back to get on with their day, so
 * the screen shows the completed state briefly and then leaves by itself.
 *
 * Getting that right is entirely about deciding WHICH state change earns a
 * close, and the naive readings are all wrong:
 *
 *   - "the occurrence is complete"      → fires when you merely open a finished
 *                                         item, or when a background refetch
 *                                         reports one somebody else completed.
 *   - "the last step in the array"      → the parent's completion rule is the
 *                                         server's, not the array index's;
 *                                         skipped steps count, and steps can
 *                                         be checked in any order.
 *   - "the optimistic cache says done"  → the toggle mutation patches the cache
 *                                         BEFORE the request resolves, so by
 *                                         the time the await returns, the
 *                                         "before" value is already gone.
 *
 * So the only thing that closes the screen is a THIS-INTERACTION transition:
 * the user checked a step, the parent was incomplete when they tapped, and the
 * SERVER confirmed it is complete now.
 *
 * This module is deliberately free of React, expo-router and RTK Query so every
 * one of those rules can be tested directly.
 */

/** The facts about one user-initiated step toggle. */
export interface StepToggleOutcome {
  /** True when the user CHECKED a step; false when they unchecked one. */
  isChecking: boolean;
  /**
   * The parent occurrence's completed state at the moment of the tap.
   *
   * Must be read synchronously, BEFORE the optimistic cache patch is applied —
   * reading it after the await would always report the post-toggle value and
   * make every transition look like a no-op.
   */
  wasCompleteBefore: boolean;
  /**
   * The parent occurrence's completed state the SERVER returned. Authoritative:
   * the completion rule belongs to the backend, so the client never recomputes
   * it from the step array.
   */
  isCompleteAfter: boolean;
}

/**
 * Whether this toggle is the one that finished the occurrence.
 *
 * All three conditions are load-bearing:
 *   isChecking          — unchecking a step never closes the screen.
 *   !wasCompleteBefore  — opening an already-finished item, or a background
 *                         refresh, must not close anything.
 *   isCompleteAfter     — checking a non-final step leaves the screen open.
 */
export const shouldAutoCloseOnCompletion = ({
  isChecking,
  wasCompleteBefore,
  isCompleteAfter,
}: StepToggleOutcome): boolean =>
  isChecking && !wasCompleteBefore && isCompleteAfter;

/**
 * How long the finished checklist stays on screen before it closes.
 *
 * Long enough to see the final box tick and the counter land, short enough that
 * it reads as a confirmation rather than a pause.
 */
export const COMPLETION_CLOSE_DELAY_MS = 600;

/** Whatever the host's timer function hands back. */
export type AutoCloseTimerHandle = ReturnType<typeof setTimeout>;

export interface CompletionAutoCloserDeps {
  /** Returns to wherever the detail screen was opened from. */
  navigateBack: () => void;
  setTimer: (_run: () => void, _ms: number) => AutoCloseTimerHandle;
  clearTimer: (_handle: AutoCloseTimerHandle) => void;
  /** Fired the instant a close is scheduled, for the success haptic. */
  onCelebrate?: () => void;
  delayMs?: number;
}

export interface CompletionAutoCloser {
  /**
   * Consider one toggle outcome. Returns true when this call is what scheduled
   * the close, so a caller can tell "I closed it" from "nothing happened".
   */
  handle: (_outcome: StepToggleOutcome) => boolean;
  /**
   * Abandon any pending close. Idempotent, and permanent — used on unmount and
   * when the user leaves under their own steam, after which this closer must
   * never navigate.
   */
  cancel: () => void;
}

/**
 * Builds the one-shot closer.
 *
 * Two guards, for two different hazards:
 *
 *   `hasScheduled` is claimed synchronously, before the timer is even created,
 *   so a burst of taps that each resolve into a completing transition (a double
 *   tap, a retry landing late) can only ever produce ONE navigation. Without
 *   it, expo-router would be asked to pop twice and would take the user a
 *   screen further back than they came from.
 *
 *   `isCancelled` survives the timer callback, so a screen that unmounts during
 *   the delay never navigates afterwards — the classic "setState/navigate after
 *   unmount" bug, which here would yank the user off whatever they had already
 *   moved on to.
 */
export const createCompletionAutoCloser = (
  deps: CompletionAutoCloserDeps,
): CompletionAutoCloser => {
  let pending: AutoCloseTimerHandle | null = null;
  let hasScheduled = false;
  let isCancelled = false;

  return {
    handle: (outcome) => {
      if (isCancelled || hasScheduled) return false;
      if (!shouldAutoCloseOnCompletion(outcome)) return false;

      // Claimed before the timer exists: a synchronous second call in the same
      // tick must not get past this line.
      hasScheduled = true;
      deps.onCelebrate?.();

      pending = deps.setTimer(() => {
        pending = null;
        if (isCancelled) return;
        deps.navigateBack();
      }, deps.delayMs ?? COMPLETION_CLOSE_DELAY_MS);

      return true;
    },

    cancel: () => {
      isCancelled = true;
      if (pending !== null) {
        deps.clearTimer(pending);
        pending = null;
      }
    },
  };
};
