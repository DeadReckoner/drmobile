import {
  AutoCloseTimerHandle,
  COMPLETION_CLOSE_DELAY_MS,
  createCompletionAutoCloser,
  shouldAutoCloseOnCompletion,
  StepToggleOutcome,
} from '@/hooks/habits/stepCompletion';

/**
 * The rules that decide whether finishing a step closes the detail screen.
 *
 * Every case here is one the naive implementations get wrong: opening a
 * finished item, a background refetch, unchecking, a failed request, or a
 * double tap. Getting any of them wrong takes the user off a screen they did
 * not ask to leave, so they are pinned rather than eyeballed.
 */

const outcome = (over: Partial<StepToggleOutcome> = {}): StepToggleOutcome => ({
  isChecking: true,
  wasCompleteBefore: false,
  isCompleteAfter: true,
  ...over,
});

// ─── the predicate ───────────────────────────────────────────────────────────

describe('shouldAutoCloseOnCompletion', () => {
  it('closes when the user checks the step that finishes the occurrence', () => {
    expect(shouldAutoCloseOnCompletion(outcome())).toBe(true);
  });

  // The parent is still incomplete, so there is more to do on this screen.
  it('stays open when a checked step leaves the occurrence incomplete', () => {
    expect(
      shouldAutoCloseOnCompletion(outcome({ isCompleteAfter: false })),
    ).toBe(false);
  });

  // Unchecking reopens the occurrence; leaving would strand the user.
  it('stays open when a step is unchecked', () => {
    expect(
      shouldAutoCloseOnCompletion(
        outcome({ isChecking: false, isCompleteAfter: false }),
      ),
    ).toBe(false);
  });

  // Toggling a step on an already-finished occurrence (e.g. re-checking a
  // skipped one) is not the moment of completion.
  it('stays open when the occurrence was already complete', () => {
    expect(
      shouldAutoCloseOnCompletion(outcome({ wasCompleteBefore: true })),
    ).toBe(false);
  });

  // The dangerous combination: complete before AND after. Opening a finished
  // item, or a refetch reporting one, must never look like a transition.
  it('stays open when complete on both sides of the toggle', () => {
    expect(
      shouldAutoCloseOnCompletion(
        outcome({ wasCompleteBefore: true, isCompleteAfter: true }),
      ),
    ).toBe(false);
  });
});

// ─── the closer ──────────────────────────────────────────────────────────────

/** A controllable clock, so the delay is asserted rather than waited on. */
const makeHarness = (delayMs?: number) => {
  const navigations: number[] = [];
  const celebrations: number[] = [];
  const timers = new Map<number, { run: () => void; ms: number }>();
  let nextHandle = 1;

  const closer = createCompletionAutoCloser({
    navigateBack: () => navigations.push(Date.now()),
    onCelebrate: () => celebrations.push(Date.now()),
    setTimer: (run, ms) => {
      const handle = nextHandle++;
      timers.set(handle, { run, ms });
      return handle as unknown as AutoCloseTimerHandle;
    },
    clearTimer: (handle) => {
      timers.delete(handle as unknown as number);
    },
    delayMs,
  });

  return {
    closer,
    navigations,
    celebrations,
    /** Timers still waiting to fire. */
    pending: () => [...timers.values()],
    /** Fire every scheduled timer, as the runtime eventually would. */
    flush: () => {
      const due = [...timers.values()];
      timers.clear();
      due.forEach((timer) => timer.run());
    },
  };
};

describe('createCompletionAutoCloser', () => {
  it('does not navigate before the delay elapses', () => {
    const h = makeHarness();

    expect(h.closer.handle(outcome())).toBe(true);

    // Scheduled, but the completed checklist is still on screen.
    expect(h.navigations).toHaveLength(0);
    expect(h.pending()).toHaveLength(1);
    expect(h.pending()[0].ms).toBe(COMPLETION_CLOSE_DELAY_MS);

    h.flush();
    expect(h.navigations).toHaveLength(1);
  });

  it('uses the ~600ms confirmation delay by default', () => {
    expect(COMPLETION_CLOSE_DELAY_MS).toBe(600);
  });

  it('schedules exactly one close for a completing toggle', () => {
    const h = makeHarness();

    h.closer.handle(outcome());
    h.flush();

    expect(h.navigations).toHaveLength(1);
  });

  it('does not schedule anything for a non-completing toggle', () => {
    const h = makeHarness();

    expect(h.closer.handle(outcome({ isCompleteAfter: false }))).toBe(false);

    expect(h.pending()).toHaveLength(0);
    h.flush();
    expect(h.navigations).toHaveLength(0);
  });

  it('does not schedule anything when a step is unchecked', () => {
    const h = makeHarness();

    h.closer.handle(outcome({ isChecking: false, isCompleteAfter: false }));

    h.flush();
    expect(h.navigations).toHaveLength(0);
  });

  it('does not schedule anything for an already-complete occurrence', () => {
    const h = makeHarness();

    h.closer.handle(outcome({ wasCompleteBefore: true }));

    h.flush();
    expect(h.navigations).toHaveLength(0);
  });

  // A failed mutation never reports an outcome (the checklist only calls
  // through on success), so the closer is simply never invoked.
  it('never navigates when no outcome is reported', () => {
    const h = makeHarness();

    h.flush();

    expect(h.navigations).toHaveLength(0);
    expect(h.celebrations).toHaveLength(0);
  });

  // Rapid taps: each resolves into a completing transition, but only the first
  // may schedule. A second pop would take the user a screen too far back.
  it('collapses repeated completing toggles into a single navigation', () => {
    const h = makeHarness();

    const results = [
      h.closer.handle(outcome()),
      h.closer.handle(outcome()),
      h.closer.handle(outcome()),
    ];

    expect(results).toEqual([true, false, false]);
    expect(h.pending()).toHaveLength(1);

    h.flush();
    expect(h.navigations).toHaveLength(1);
  });

  // The guard is claimed synchronously, so it holds even if several handlers
  // resolve in the same tick before any timer runs.
  it('holds the single-fire guard across a synchronous burst', () => {
    const h = makeHarness();

    const scheduled = Array.from({ length: 10 }, () =>
      h.closer.handle(outcome()),
    ).filter(Boolean);

    expect(scheduled).toHaveLength(1);
  });

  it('cancels a pending close on unmount, and never navigates afterwards', () => {
    const h = makeHarness();

    h.closer.handle(outcome());
    expect(h.pending()).toHaveLength(1);

    h.closer.cancel();

    expect(h.pending()).toHaveLength(0);
    h.flush();
    expect(h.navigations).toHaveLength(0);
  });

  // Even if a timer somehow survives cancellation, the callback re-checks.
  it('does not navigate when a timer fires after cancellation', () => {
    const captured: (() => void)[] = [];
    const navigations: string[] = [];
    const closer = createCompletionAutoCloser({
      navigateBack: () => navigations.push('back'),
      setTimer: (run) => {
        captured.push(run);
        return 1 as unknown as AutoCloseTimerHandle;
      },
      // A clearTimer that does nothing, standing in for a timer already queued.
      clearTimer: () => {},
    });

    closer.handle(outcome());
    closer.cancel();
    captured.forEach((run) => run());

    expect(navigations).toHaveLength(0);
  });

  it('refuses to schedule after cancellation', () => {
    const h = makeHarness();

    h.closer.cancel();

    expect(h.closer.handle(outcome())).toBe(false);
    h.flush();
    expect(h.navigations).toHaveLength(0);
  });

  it('is safe to cancel more than once', () => {
    const h = makeHarness();

    h.closer.handle(outcome());
    h.closer.cancel();
    h.closer.cancel();

    expect(h.navigations).toHaveLength(0);
  });

  // The haptic fires with the completed state, not with the navigation.
  it('celebrates once, at schedule time', () => {
    const h = makeHarness();

    h.closer.handle(outcome());
    h.closer.handle(outcome());

    expect(h.celebrations).toHaveLength(1);
    expect(h.navigations).toHaveLength(0);
  });

  it('does not celebrate a non-completing toggle', () => {
    const h = makeHarness();

    h.closer.handle(outcome({ isCompleteAfter: false }));

    expect(h.celebrations).toHaveLength(0);
  });

  it('honours a custom delay', () => {
    const h = makeHarness(1200);

    h.closer.handle(outcome());

    expect(h.pending()[0].ms).toBe(1200);
  });
});
