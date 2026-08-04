import { GoalOption } from '@/hooks/goalDiscovery/goalDiscovery.types';
import { emptyStage1Values } from '@/hooks/goalDiscovery/stage1';
import { emptyStage2Values } from '@/hooks/goalDiscovery/stage2';
import { completeRoadmapCreationAction } from '@/store/slices/aiRoadmapCreationSlice';
import {
  claimGoalDiscoveryDraftAction,
  goalDiscoveryReducer,
  goalOptionsCompletedAction,
  goalOptionsFailedAction,
  resetGoalDiscoveryAction,
  selectGoalOptionAction,
  setGoalDiscoveryStage1Action,
  setRoadmapIdempotencyKeyAction,
  startGoalDiscoveryRoadmapAction,
  startGoalOptionsJobAction,
} from '@/store/slices/goalDiscoverySlice';

// Reducer behaviour that the screens depend on but cannot express: claiming a
// draft for an account, starting over, and the idempotency key that stops a
// retried submit creating a second roadmap.

const USER = 'user-1';
const OTHER_USER = 'user-2';

const ANSWERS = {
  schema_version: 1 as const,
  trigger: 'feel_stuck' as const,
  areas: ['career' as const],
  self_description: 'know_but_dont_do' as const,
  recurring_thought: 'Starting something of my own',
  success_definition: 'Something real shipped',
  outcomes: ['create_income' as const],
  target_type: 'money_making_project' as const,
};

const option = (id: string, rank: number): GoalOption => ({
  id,
  rank,
  goal_title: `Goal ${rank}`,
  why_this_fits: 'fits',
  target_outcome: 'done',
  why_worth_pursuing: 'worth it',
  effort_examples: [],
  difficulty: { level: 'moderate', explanation: 'e' },
  accountability_strength: { level: 'moderate', explanation: 'e' },
});

const OPTIONS = [option('a', 1), option('b', 2), option('c', 3)];

type State = ReturnType<typeof goalDiscoveryReducer>;
type SliceAction = Parameters<typeof goalDiscoveryReducer>[1];

/** Apply actions in order, the way the screens dispatch them. */
const reduce = (state: State, ...actions: SliceAction[]): State =>
  actions.reduce((acc, action) => goalDiscoveryReducer(acc, action), state);

const initial = (): State =>
  goalDiscoveryReducer(undefined, { type: '@@INIT' });

/** A draft that has been through stage 1 and has three options. */
const withOptions = () =>
  reduce(
    initial(),
    claimGoalDiscoveryDraftAction(USER),
    startGoalOptionsJobAction({
      jobId: 'job-1',
      answers: ANSWERS,
      idempotencyKey: 'options-key-1',
      regeneration: false,
    }),
    goalOptionsCompletedAction({ options: OPTIONS, safetyMessage: null }),
  );

describe('claiming a draft', () => {
  it('keeps the draft for the account that wrote it', () => {
    const state = reduce(withOptions(), claimGoalDiscoveryDraftAction(USER));
    expect(state.draft.options).toHaveLength(3);
    expect(state.draft.userId).toBe(USER);
  });

  // Account switching must not leak one person's answers into another's session.
  it('clears the draft when a different account signs in', () => {
    const state = reduce(
      withOptions(),
      claimGoalDiscoveryDraftAction(OTHER_USER),
    );
    expect(state.draft.options).toHaveLength(0);
    expect(state.draft.submittedAnswers).toBeNull();
    expect(state.draft.optionsJobId).toBeNull();
    expect(state.draft.userId).toBe(OTHER_USER);
  });
});

describe('start over', () => {
  it('clears every trace of the previous attempt', () => {
    const state = reduce(
      withOptions(),
      selectGoalOptionAction({ optionId: 'a', stage2: emptyStage2Values() }),
      resetGoalDiscoveryAction(),
    );

    expect(state.draft.options).toHaveLength(0);
    expect(state.draft.optionsJobId).toBeNull();
    expect(state.draft.submittedAnswers).toBeNull();
    expect(state.draft.selectedOptionId).toBeNull();
    expect(state.draft.stage2).toBeNull();
    expect(state.draft.stage).toBe('stage1');
  });
});

describe('stage 1 draft saving', () => {
  it('persists answers as they are edited', () => {
    const values = { ...emptyStage1Values(), trigger: 'feel_stuck' as const };
    const state = reduce(
      initial(),
      claimGoalDiscoveryDraftAction(USER),
      setGoalDiscoveryStage1Action(values),
    );
    expect(state.draft.stage1.trigger).toBe('feel_stuck');
    expect(state.draft.updatedAt).not.toBeNull();
  });
});

describe('regeneration', () => {
  it('tracks a replacement job without disturbing the current options', () => {
    const state = reduce(
      withOptions(),
      startGoalOptionsJobAction({
        jobId: 'job-2',
        answers: ANSWERS,
        idempotencyKey: 'options-key-2',
        regeneration: true,
      }),
    );

    expect(state.draft.regenerationJobId).toBe('job-2');
    expect(state.draft.options).toHaveLength(3);
    expect(state.draft.optionsJobId).toBe('job-1');
    expect(state.draft.optionsJobStatus).toBe('completed');
  });

  // The swap itself, through the real reducer: a completed replacement must
  // become the visible set, and its job must become the provenance stage 2 cites.
  it('swaps in the replacement set once it completes', () => {
    const replacement = [option('x', 1), option('y', 2), option('z', 3)];

    const state = reduce(
      withOptions(),
      startGoalOptionsJobAction({
        jobId: 'job-2',
        answers: ANSWERS,
        idempotencyKey: 'options-key-2',
        regeneration: true,
      }),
      goalOptionsCompletedAction({ options: replacement, safetyMessage: null }),
    );

    expect(state.draft.options.map((o) => o.id)).toEqual(['x', 'y', 'z']);
    expect(state.draft.regenerationJobId).toBeNull();
    expect(state.draft.regenerationFailed).toBe(false);
    expect(state.draft.optionsJobId).toBe('job-2');
  });

  it('leaves the current options in place when the replacement fails', () => {
    const state = reduce(
      withOptions(),
      startGoalOptionsJobAction({
        jobId: 'job-2',
        answers: ANSWERS,
        idempotencyKey: 'options-key-2',
        regeneration: true,
      }),
      goalOptionsFailedAction(),
    );

    expect(state.draft.options.map((o) => o.id)).toEqual(['a', 'b', 'c']);
    expect(state.draft.regenerationFailed).toBe(true);
  });
});

describe('final submission idempotency', () => {
  it('keeps the first key so a retry cannot create a second roadmap', () => {
    const state = reduce(
      withOptions(),
      selectGoalOptionAction({ optionId: 'a', stage2: emptyStage2Values() }),
      setRoadmapIdempotencyKeyAction('roadmap-key-1'),
      // A retry mints a fresh candidate key; the stored one must win.
      setRoadmapIdempotencyKeyAction('roadmap-key-2'),
    );
    expect(state.draft.roadmapIdempotencyKey).toBe('roadmap-key-1');
  });

  // Choosing a different goal is a different roadmap, so the old key must not
  // be reused — that would return the roadmap built for the previous goal.
  it('drops the key when a different goal is selected', () => {
    const state = reduce(
      withOptions(),
      selectGoalOptionAction({ optionId: 'a', stage2: emptyStage2Values() }),
      setRoadmapIdempotencyKeyAction('roadmap-key-1'),
      selectGoalOptionAction({ optionId: 'b', stage2: emptyStage2Values() }),
    );
    expect(state.draft.roadmapIdempotencyKey).toBeNull();
  });

  it('records the created roadmap so the pending state can be restored', () => {
    const state = reduce(
      withOptions(),
      selectGoalOptionAction({ optionId: 'a', stage2: emptyStage2Values() }),
      startGoalDiscoveryRoadmapAction({
        jobId: 'roadmap-job-1',
        roadmapId: 'roadmap-1',
        idempotencyKey: 'roadmap-key-1',
      }),
    );
    expect(state.draft.roadmapJobId).toBe('roadmap-job-1');
    expect(state.draft.roadmapId).toBe('roadmap-1');
  });
});

describe('draft lifetime', () => {
  const submitted = () =>
    reduce(
      withOptions(),
      selectGoalOptionAction({ optionId: 'a', stage2: emptyStage2Values() }),
      startGoalDiscoveryRoadmapAction({
        jobId: 'roadmap-job-1',
        roadmapId: 'roadmap-1',
        idempotencyKey: 'roadmap-key-1',
      }),
    );

  // Submitting is not "done": if generation failed the user still needs their
  // answers, so the draft survives the hand-off.
  it('survives submission of the final roadmap', () => {
    expect(submitted().draft.submittedAnswers).not.toBeNull();
    expect(submitted().draft.options).toHaveLength(3);
  });

  it('clears once that roadmap is actually available', () => {
    const state = reduce(
      submitted(),
      completeRoadmapCreationAction({
        roadmap_id: 'roadmap-1',
        goal: 'Goal 1',
        description: '',
        days: 0,
        completed: false,
        start_date: '',
        milestones: [],
        reason: '',
      }),
    );
    expect(state.draft.options).toHaveLength(0);
    expect(state.draft.roadmapJobId).toBeNull();
    expect(state.draft.submittedAnswers).toBeNull();
  });

  // A roadmap finished by the chat flow must not wipe a goal discovery draft
  // that is still in progress.
  it('ignores completion of an unrelated roadmap', () => {
    const state = reduce(
      submitted(),
      completeRoadmapCreationAction({
        roadmap_id: 'some-other-roadmap',
        goal: 'Unrelated',
        description: '',
        days: 0,
        completed: false,
        start_date: '',
        milestones: [],
        reason: '',
      }),
    );
    expect(state.draft.options).toHaveLength(3);
    expect(state.draft.roadmapId).toBe('roadmap-1');
  });
});

describe('safety-blocked generation', () => {
  it('stores the message and shows no goal cards', () => {
    const state = reduce(
      initial(),
      claimGoalDiscoveryDraftAction(USER),
      startGoalOptionsJobAction({
        jobId: 'job-1',
        answers: ANSWERS,
        idempotencyKey: 'k',
        regeneration: false,
      }),
      goalOptionsCompletedAction({
        options: [],
        safetyMessage: 'please reach out',
      }),
    );
    expect(state.draft.safetyMessage).toBe('please reach out');
    expect(state.draft.options).toHaveLength(0);
  });
});

// ─── re-selecting the SAME goal ──────────────────────────────────────────────

describe('selectGoalOptionAction on an unchanged selection', () => {
  // Found on the emulator: tapping "Choose this goal" on the card already
  // chosen ran the switch-goal re-prefill, which deliberately clears the pace.
  // The user lost their pace choice with no confirmation and no way to tell.
  it('keeps the idempotency key when the option is unchanged', () => {
    let state = goalDiscoveryReducer(undefined, { type: '@@INIT' } as never);
    state = goalDiscoveryReducer(state, claimGoalDiscoveryDraftAction(USER));
    state = goalDiscoveryReducer(
      state,
      selectGoalOptionAction({
        optionId: 'opt-1',
        stage2: emptyStage2Values(),
      }),
    );
    state = goalDiscoveryReducer(
      state,
      setRoadmapIdempotencyKeyAction('key-1'),
    );

    state = goalDiscoveryReducer(
      state,
      selectGoalOptionAction({
        optionId: 'opt-1',
        stage2: emptyStage2Values(),
      }),
    );

    expect(state.draft.roadmapIdempotencyKey).toBe('key-1');
  });

  // A genuine switch still invalidates it: reusing a key across two different
  // goals would return the roadmap built for the goal they abandoned.
  it('drops the idempotency key when the option changes', () => {
    let state = goalDiscoveryReducer(undefined, { type: '@@INIT' } as never);
    state = goalDiscoveryReducer(state, claimGoalDiscoveryDraftAction(USER));
    state = goalDiscoveryReducer(
      state,
      selectGoalOptionAction({
        optionId: 'opt-1',
        stage2: emptyStage2Values(),
      }),
    );
    state = goalDiscoveryReducer(
      state,
      setRoadmapIdempotencyKeyAction('key-1'),
    );

    state = goalDiscoveryReducer(
      state,
      selectGoalOptionAction({
        optionId: 'opt-2',
        stage2: emptyStage2Values(),
      }),
    );

    expect(state.draft.roadmapIdempotencyKey).toBeNull();
  });
});
