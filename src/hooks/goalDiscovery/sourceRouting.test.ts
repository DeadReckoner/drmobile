import {
  emptyDraft,
  GoalDiscoveryDraft,
  GOAL_DISCOVERY_ROUTES,
  hasSubmittedRoadmap,
  resolveEntry,
  routeForEntry,
} from '@/hooks/goalDiscovery/draft';
import { GoalOption } from '@/hooks/goalDiscovery/goalDiscovery.types';
import { emptyStage1Values } from '@/hooks/goalDiscovery/stage1';
import {
  aiRoadmapCreationReducer,
  completeRoadmapCreationAction,
  DEFAULT_ROADMAP_CREATION_SOURCE,
  resetCreationStateAction,
  selectIsGoalDiscoveryRoadmapPending,
  selectRoadmapCreationSource,
  setCreationErrorAction,
  startCreationSessionAction,
  startRoadmapCreationAction,
} from '@/store/slices/aiRoadmapCreationSlice';

/**
 * Source-aware pending navigation.
 *
 * Goal discovery hands its final roadmap to the SHARED aiRoadmapCreation slice
 * so it inherits the existing polling, websocket and completion handling. The
 * hazard that creates: `status === 'creating'` no longer tells you which flow
 * the user came from, and every "Continue" affordance built on it routed to the
 * chat screen. A user who filled in a form would be dropped into a conversation
 * they never had, staring at a loader.
 *
 * These tests pin the rule in both directions: goal discovery never resolves to
 * chat, and the chat flow's own behaviour is unchanged.
 */

const USER = 'user-1';

const option = (id: string, rank: number): GoalOption => ({
  id,
  rank,
  goal_title: `Goal ${rank}`,
  why_this_fits: 'fits',
  target_outcome: 'done means this',
  why_worth_pursuing: 'worth it',
  effort_examples: [],
  difficulty: { level: 'moderate', explanation: 'e' },
  accountability_strength: { level: 'moderate', explanation: 'e' },
});

const draftWith = (
  overrides: Partial<GoalDiscoveryDraft>,
): GoalDiscoveryDraft => ({
  ...emptyDraft(emptyStage1Values()),
  userId: USER,
  ...overrides,
});

// ─── entry resolution ────────────────────────────────────────────────────────

describe('resolveEntry', () => {
  // The regression this whole change exists for.
  it('never resolves to a chat route', () => {
    const drafts = [
      draftWith({}),
      draftWith({ optionsJobId: 'job-1', optionsJobStatus: 'processing' }),
      draftWith({ options: [option('a', 1)] }),
      draftWith({ safetyMessage: 'blocked' }),
      draftWith({ stage: 'stage2', selectedOptionId: 'a' }),
      draftWith({ roadmapJobId: 'job-2', roadmapId: 'roadmap-1' }),
    ];

    const chatRoutes = ['/roadmap/create-ai-roadmap'];
    drafts.forEach((draft) => {
      const route = routeForEntry(resolveEntry(draft, USER));
      expect(chatRoutes).not.toContain(route);
      expect(route.startsWith('/goal-discovery')).toBe(true);
    });
  });

  // Previously this returned the stage-2 form the user had already submitted,
  // whose only visible action was to submit it again.
  it('resolves a submitted roadmap to the pending state', () => {
    const draft = draftWith({
      stage: 'stage2',
      selectedOptionId: 'a',
      options: [option('a', 1)],
      optionsJobId: 'job-1',
      roadmapJobId: 'job-2',
      roadmapId: 'roadmap-1',
    });

    expect(resolveEntry(draft, USER)).toEqual({ route: 'pending' });
    expect(routeForEntry(resolveEntry(draft, USER))).toBe(
      GOAL_DISCOVERY_ROUTES.pending,
    );
  });

  // A job id alone is not a submitted roadmap: the draft is cleared against the
  // roadmap id, so both must be present.
  it('does not treat a half-written draft as a submitted roadmap', () => {
    expect(hasSubmittedRoadmap(draftWith({ roadmapJobId: 'job-2' }))).toBe(
      false,
    );
    expect(hasSubmittedRoadmap(draftWith({ roadmapId: 'roadmap-1' }))).toBe(
      false,
    );
    expect(
      hasSubmittedRoadmap(
        draftWith({ roadmapJobId: 'job-2', roadmapId: 'roadmap-1' }),
      ),
    ).toBe(true);
  });

  it('still resolves the earlier stages unchanged', () => {
    expect(resolveEntry(draftWith({}), USER)).toEqual({ route: 'stage1' });
    expect(resolveEntry(draftWith({ optionsJobId: 'job-1' }), USER)).toEqual({
      route: 'options',
    });
    expect(
      resolveEntry(draftWith({ stage: 'stage2', selectedOptionId: 'a' }), USER),
    ).toEqual({ route: 'stage2' });
  });

  // Account safety still wins over resumption: another user's submitted roadmap
  // must not put THIS user into a pending state for it.
  it('refuses to restore another account’s pending roadmap', () => {
    const draft = draftWith({
      userId: 'someone-else',
      roadmapJobId: 'job-2',
      roadmapId: 'roadmap-1',
    });

    expect(resolveEntry(draft, USER)).toEqual({ route: 'stage1' });
  });
});

// ─── source tracking ─────────────────────────────────────────────────────────

describe('roadmap creation source', () => {
  const stateWith = (...actions: { type: string; payload?: unknown }[]) =>
    actions.reduce(
      (state, action) => aiRoadmapCreationReducer(state, action as never),
      aiRoadmapCreationReducer(undefined, { type: '@@INIT' } as never),
    );

  const select = (state: ReturnType<typeof aiRoadmapCreationReducer>) => ({
    source: selectRoadmapCreationSource({ aiRoadmapCreation: state } as never),
    isGoalDiscovery: selectIsGoalDiscoveryRoadmapPending({
      aiRoadmapCreation: state,
    } as never),
  });

  it('defaults to the chat source', () => {
    expect(select(stateWith()).source).toBe(DEFAULT_ROADMAP_CREATION_SOURCE);
    expect(DEFAULT_ROADMAP_CREATION_SOURCE).toBe('known_goal_chat');
  });

  // The existing chat call site passes no argument and must keep meaning chat.
  it('treats an unlabelled creation as the chat flow', () => {
    const state = stateWith(startRoadmapCreationAction());

    expect(select(state).source).toBe('known_goal_chat');
    expect(select(state).isGoalDiscovery).toBe(false);
  });

  it('records the goal discovery source', () => {
    const state = stateWith(startRoadmapCreationAction('goal_discovery_form'));

    expect(select(state).source).toBe('goal_discovery_form');
    expect(select(state).isGoalDiscovery).toBe(true);
  });

  // A failed goal discovery roadmap is still a goal discovery roadmap: its
  // recovery must not be the chat screen either.
  it('keeps the source through a failure', () => {
    const state = stateWith(
      startRoadmapCreationAction('goal_discovery_form'),
      setCreationErrorAction('boom'),
    );

    expect(select(state).source).toBe('goal_discovery_form');
    expect(select(state).isGoalDiscovery).toBe(true);
  });

  // Opening the chat flow claims the slice, so a leftover goal-discovery tag
  // cannot send a chat user into goal discovery.
  it('reclaims the slice for chat when a chat session starts', () => {
    const state = stateWith(
      startRoadmapCreationAction('goal_discovery_form'),
      startCreationSessionAction(),
    );

    expect(select(state).source).toBe('known_goal_chat');
    expect(select(state).isGoalDiscovery).toBe(false);
  });

  it('returns to the default on reset', () => {
    const state = stateWith(
      startRoadmapCreationAction('goal_discovery_form'),
      resetCreationStateAction(),
    );

    expect(select(state).source).toBe('known_goal_chat');
  });

  // State persisted by a build without the field must behave exactly as it did
  // before, not crash and not be misread as goal discovery.
  it('reads restored state that predates the field as the chat flow', () => {
    const legacy = {
      ...stateWith(startRoadmapCreationAction()),
      pendingSource: undefined,
    };

    expect(select(legacy).source).toBe('known_goal_chat');
    expect(select(legacy).isGoalDiscovery).toBe(false);
  });

  // A completed roadmap is no longer "pending" for routing purposes: it opens
  // through the existing roadmap destination whichever flow produced it.
  it('stops reporting a pending goal discovery roadmap once it completes', () => {
    const state = stateWith(
      startRoadmapCreationAction('goal_discovery_form'),
      completeRoadmapCreationAction({
        roadmap_id: 'roadmap-1',
        goal: '',
        description: '',
        days: 0,
        completed: false,
        start_date: '',
        milestones: [],
        reason: '',
      } as never),
    );

    expect(select(state).source).toBe('goal_discovery_form');
    expect(select(state).isGoalDiscovery).toBe(false);
  });
});
