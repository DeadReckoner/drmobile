import {
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryStage1Values,
  GoalDiscoveryStage2Values,
  GoalOption,
} from '@/hooks/goalDiscovery/goalDiscovery.types';

/**
 * Goal Discovery draft state and the rules for restoring it.
 *
 * The draft is persisted through the app's existing redux-persist store, so it
 * survives a restart the same way the other slices do. What this file adds is
 * the two guarantees persistence alone does not give:
 *
 *   1. It belongs to ONE account. A draft is only restored for the user id that
 *      wrote it, so an account switch can never surface someone else's answers.
 *   2. It belongs to ONE schema. A draft written by an incompatible build is
 *      discarded rather than half-read into fields that have since changed.
 *
 * No auth token or secret is ever stored here — only the user id used for the
 * ownership check, and the user's own answers.
 */

/** Bump when the persisted shape changes incompatibly. */
export const GOAL_DISCOVERY_DRAFT_VERSION = 1;

export type GoalDiscoveryStage = 'stage1' | 'options' | 'stage2';

export type GoalOptionsJobStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface GoalDiscoveryDraft {
  draftVersion: number;
  /** The account this draft belongs to. Empty means "not yet claimed". */
  userId: string;
  stage: GoalDiscoveryStage;

  stage1: GoalDiscoveryStage1Values;
  /** The normalized answers actually submitted, for regeneration and stage 2. */
  submittedAnswers: GoalDiscoveryAnswersPayload | null;

  optionsJobId: string | null;
  optionsJobStatus: GoalOptionsJobStatus;
  /**
   * The last SUCCESSFUL set of options. A regeneration writes here only after
   * the replacement set arrives, so a failed regeneration leaves the user
   * looking at the three options they already had.
   */
  options: GoalOption[];
  /** Set when generation was refused on safety grounds instead of producing options. */
  safetyMessage: string | null;

  /** Job id of an in-flight REPLACEMENT generation, if any. */
  regenerationJobId: string | null;
  regenerationFailed: boolean;

  selectedOptionId: string | null;
  stage2: GoalDiscoveryStage2Values | null;

  roadmapJobId: string | null;
  roadmapId: string | null;

  /** Idempotency keys, minted once per submission and reused across retries. */
  optionsIdempotencyKey: string | null;
  roadmapIdempotencyKey: string | null;

  updatedAt: number | null;
}

export const emptyDraft = (
  stage1: GoalDiscoveryStage1Values,
): GoalDiscoveryDraft => ({
  draftVersion: GOAL_DISCOVERY_DRAFT_VERSION,
  userId: '',
  stage: 'stage1',
  stage1,
  submittedAnswers: null,
  optionsJobId: null,
  optionsJobStatus: 'idle',
  options: [],
  safetyMessage: null,
  regenerationJobId: null,
  regenerationFailed: false,
  selectedOptionId: null,
  stage2: null,
  roadmapJobId: null,
  roadmapId: null,
  optionsIdempotencyKey: null,
  roadmapIdempotencyKey: null,
  updatedAt: null,
});

/**
 * Whether a persisted draft may be shown to the signed-in user.
 *
 * A draft with no owner is claimable (it was written before the user id was
 * known). A draft owned by somebody else, or written by an incompatible build,
 * is not — the caller discards it.
 */
export const isDraftUsable = (
  draft: GoalDiscoveryDraft | null | undefined,
  userId: string,
): boolean => {
  if (!draft) return false;
  if (draft.draftVersion !== GOAL_DISCOVERY_DRAFT_VERSION) return false;
  if (!userId) return false;
  return draft.userId === '' || draft.userId === userId;
};

/** True when the draft holds nothing worth resuming. */
export const isDraftEmpty = (draft: GoalDiscoveryDraft): boolean =>
  draft.stage === 'stage1' &&
  !draft.optionsJobId &&
  draft.options.length === 0 &&
  !draft.submittedAnswers &&
  !hasStage1Input(draft.stage1);

export const hasStage1Input = (values: GoalDiscoveryStage1Values): boolean =>
  Boolean(
    values.trigger ||
      values.selfDescription ||
      values.targetType ||
      values.areas.length ||
      values.outcomes.length ||
      values.triggerNote.trim() ||
      values.customArea.trim() ||
      values.customOutcome.trim() ||
      values.recurringThought.trim() ||
      values.successDefinition.trim(),
  );

export type GoalDiscoveryEntry =
  | { route: 'stage1' }
  | { route: 'options' }
  | { route: 'stage2' }
  | { route: 'pending' };

/**
 * True once the final roadmap has been submitted for this draft.
 *
 * Both ids are required: the roadmap id is what the draft is cleared against on
 * completion, so a draft holding only a job id is not yet a submitted roadmap.
 */
export const hasSubmittedRoadmap = (draft: GoalDiscoveryDraft): boolean =>
  Boolean(draft.roadmapJobId && draft.roadmapId);

/**
 * Where tapping Goal Discovery should land.
 *
 * Resuming is only offered for a draft this user owns. Order matters:
 *
 *   1. A submitted roadmap goes to the goal discovery PENDING state. Without
 *      this branch the user is returned to the stage-2 form they already
 *      submitted, where the only visible action is to submit it again.
 *   2. An in-flight or completed options job goes to the options screen.
 *   3. A chosen goal goes to stage 2.
 *   4. Anything else starts at the form.
 *
 * Note the deliberate absence of any branch that starts a generation: opening
 * the feature must never spend a credit on its own. Note also that no branch
 * ever names a chat route — a goal reached through a form is never resumed as
 * a conversation.
 */
export const resolveEntry = (
  draft: GoalDiscoveryDraft | null | undefined,
  userId: string,
): GoalDiscoveryEntry => {
  if (!isDraftUsable(draft, userId) || !draft) return { route: 'stage1' };

  if (hasSubmittedRoadmap(draft)) {
    return { route: 'pending' };
  }
  if (draft.stage === 'stage2' && draft.selectedOptionId) {
    return { route: 'stage2' };
  }
  if (draft.optionsJobId || draft.options.length > 0 || draft.safetyMessage) {
    return { route: 'options' };
  }
  return { route: 'stage1' };
};

/** The expo-router path for an entry. Single source of truth for both the
 *  Create page and the shared AI-roadmap surfaces. */
export const GOAL_DISCOVERY_ROUTES = {
  stage1: '/goal-discovery',
  options: '/goal-discovery/options',
  stage2: '/goal-discovery/roadmap-details',
  pending: '/goal-discovery/pending',
} as const;

/** The literal union, so expo-router still type-checks every destination. */
export type GoalDiscoveryRoute =
  (typeof GOAL_DISCOVERY_ROUTES)[keyof typeof GOAL_DISCOVERY_ROUTES];

export const routeForEntry = (entry: GoalDiscoveryEntry): GoalDiscoveryRoute =>
  GOAL_DISCOVERY_ROUTES[entry.route];

/**
 * Whether the options screen should be polling.
 *
 * Polling continues for an unfinished job and stops once it settles. It is
 * driven by the STORED status rather than a live flag so returning to the screen
 * (or relaunching the app) resumes exactly where it left off.
 */
export const shouldPollOptions = (draft: GoalDiscoveryDraft): boolean => {
  const jobId = draft.regenerationJobId ?? draft.optionsJobId;
  if (!jobId) return false;
  if (draft.regenerationJobId) return true;
  return (
    draft.optionsJobStatus === 'pending' ||
    draft.optionsJobStatus === 'processing'
  );
};

/** The job the options screen is currently watching. */
export const activeOptionsJobId = (draft: GoalDiscoveryDraft): string | null =>
  draft.regenerationJobId ?? draft.optionsJobId;

/**
 * Apply a completed options result.
 *
 * This is the atomic swap: the previous three options are only replaced once a
 * new, non-empty set has arrived. A result carrying a safety block replaces the
 * options with nothing and surfaces the message instead.
 */
export const applyOptionsResult = (
  draft: GoalDiscoveryDraft,
  options: GoalOption[],
  safetyMessage: string | null,
): GoalDiscoveryDraft => {
  if (safetyMessage) {
    return {
      ...draft,
      stage: 'options',
      options: [],
      safetyMessage,
      optionsJobStatus: 'completed',
      regenerationJobId: null,
      regenerationFailed: false,
    };
  }

  if (options.length === 0) {
    // Nothing valid came back; keep whatever the user is already looking at.
    return { ...draft, regenerationJobId: null, regenerationFailed: true };
  }

  return {
    ...draft,
    stage: 'options',
    options: sortByRank(options),
    safetyMessage: null,
    optionsJobStatus: 'completed',
    // A replacement set becomes the current set, and the job it came from
    // becomes the one stage 2 cites as its provenance.
    optionsJobId: draft.regenerationJobId ?? draft.optionsJobId,
    regenerationJobId: null,
    regenerationFailed: false,
  };
};

/**
 * Apply a failed generation.
 *
 * A failed REGENERATION must not destroy the options already on screen — the
 * user asked for alternatives, not for their current three to disappear.
 */
export const applyOptionsFailure = (
  draft: GoalDiscoveryDraft,
): GoalDiscoveryDraft => {
  if (draft.regenerationJobId) {
    return { ...draft, regenerationJobId: null, regenerationFailed: true };
  }
  return { ...draft, optionsJobStatus: 'failed' };
};

export const sortByRank = (options: GoalOption[]): GoalOption[] =>
  [...options].sort((a, b) => a.rank - b.rank);

/**
 * Whether a status response may be applied to the draft.
 *
 * It must belong to the job currently being watched. This exists because
 * RTK Query's `data` holds the last successful response for a hook and survives
 * an argument change until the new request lands: right after a regeneration
 * starts, `data` is still the PREVIOUS job's completed response. Applying that
 * would re-install the very options the user asked to move on from, and end the
 * poll — so the set would silently never change.
 */
export const isStatusForActiveJob = (
  activeJobId: string | null,
  responseJobId: string | undefined,
): boolean => Boolean(activeJobId) && activeJobId === responseJobId;

/**
 * Whether a job-status error means the job is GONE rather than unreachable.
 *
 * The distinction decides whether the user waits or gets a way out, so it is
 * kept here as a plain predicate rather than buried in the polling hook:
 *
 *   - 404: the server does not have this job. It is never coming back, so the
 *     pending state must end and the recovery card must appear.
 *   - anything else (offline, timeout, 5xx): the generation is probably still
 *     running. Keep waiting; never start a second one over a blip.
 */
export const isJobGoneError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return false;
  }
  return (error as { status?: number | string }).status === 404;
};
