import {
  activeOptionsJobId,
  applyOptionsFailure,
  applyOptionsResult,
  emptyDraft,
  GOAL_DISCOVERY_DRAFT_VERSION,
  GoalDiscoveryDraft,
  isDraftEmpty,
  isDraftUsable,
  isJobGoneError,
  isStatusForActiveJob,
  resolveEntry,
  shouldPollOptions,
  sortByRank,
} from '@/hooks/goalDiscovery/draft';
import { GoalOption } from '@/hooks/goalDiscovery/goalDiscovery.types';
import { emptyStage1Values } from '@/hooks/goalDiscovery/stage1';

// Draft restoration, account scoping, and the atomic option swap.
//
// The two rules worth breaking a build over: a draft must never surface for the
// wrong account, and a failed regeneration must never destroy the options the
// user is currently looking at.

const USER = 'user-1';
const OTHER_USER = 'user-2';

const option = (id: string, rank: number, title: string): GoalOption => ({
  id,
  rank,
  goal_title: title,
  why_this_fits: 'fits',
  target_outcome: 'done means this',
  why_worth_pursuing: 'worth it',
  effort_examples: [],
  difficulty: { level: 'moderate', explanation: 'e' },
  accountability_strength: { level: 'moderate', explanation: 'e' },
});

const OLD_OPTIONS = [
  option('old-1', 1, 'Old goal A'),
  option('old-2', 2, 'Old goal B'),
  option('old-3', 3, 'Old goal C'),
];

const NEW_OPTIONS = [
  option('new-1', 1, 'New goal A'),
  option('new-2', 2, 'New goal B'),
  option('new-3', 3, 'New goal C'),
];

const draftWithOptions = (): GoalDiscoveryDraft => ({
  ...emptyDraft(emptyStage1Values()),
  userId: USER,
  stage: 'options',
  optionsJobId: 'job-1',
  optionsJobStatus: 'completed',
  options: OLD_OPTIONS,
});

describe('account scoping', () => {
  it('restores a draft for the account that wrote it', () => {
    expect(isDraftUsable(draftWithOptions(), USER)).toBe(true);
  });

  // The rule that stops one person's answers appearing in another's session.
  it('refuses a draft belonging to a different account', () => {
    expect(isDraftUsable(draftWithOptions(), OTHER_USER)).toBe(false);
    expect(resolveEntry(draftWithOptions(), OTHER_USER)).toEqual({
      route: 'stage1',
    });
  });

  it('lets an unclaimed draft be adopted by the signed-in user', () => {
    const draft = { ...draftWithOptions(), userId: '' };
    expect(isDraftUsable(draft, USER)).toBe(true);
  });

  it('refuses any draft when nobody is signed in', () => {
    expect(isDraftUsable(draftWithOptions(), '')).toBe(false);
  });

  it('discards a draft written by an incompatible build', () => {
    const draft = {
      ...draftWithOptions(),
      draftVersion: GOAL_DISCOVERY_DRAFT_VERSION + 1,
    };
    expect(isDraftUsable(draft, USER)).toBe(false);
    expect(resolveEntry(draft, USER)).toEqual({ route: 'stage1' });
  });
});

describe('resolveEntry', () => {
  it('starts at the form with no draft', () => {
    expect(resolveEntry(null, USER)).toEqual({ route: 'stage1' });
    expect(resolveEntry(emptyDraft(emptyStage1Values()), USER)).toEqual({
      route: 'stage1',
    });
  });

  it('resumes a pending job on the options screen', () => {
    const draft: GoalDiscoveryDraft = {
      ...emptyDraft(emptyStage1Values()),
      userId: USER,
      optionsJobId: 'job-1',
      optionsJobStatus: 'processing',
    };
    expect(resolveEntry(draft, USER)).toEqual({ route: 'options' });
  });

  it('resumes completed options on the options screen', () => {
    expect(resolveEntry(draftWithOptions(), USER)).toEqual({
      route: 'options',
    });
  });

  it('resumes stage 2 once a goal has been chosen', () => {
    const draft: GoalDiscoveryDraft = {
      ...draftWithOptions(),
      stage: 'stage2',
      selectedOptionId: 'old-1',
    };
    expect(resolveEntry(draft, USER)).toEqual({ route: 'stage2' });
  });

  it('shows a safety-blocked result rather than starting over', () => {
    const draft: GoalDiscoveryDraft = {
      ...emptyDraft(emptyStage1Values()),
      userId: USER,
      safetyMessage: 'not something we can plan',
    };
    expect(resolveEntry(draft, USER)).toEqual({ route: 'options' });
  });
});

describe('polling', () => {
  it('polls an unfinished first-run job and stops once it settles', () => {
    const draft = {
      ...emptyDraft(emptyStage1Values()),
      userId: USER,
      optionsJobId: 'job-1',
      optionsJobStatus: 'processing' as const,
    };
    expect(shouldPollOptions(draft)).toBe(true);
    expect(shouldPollOptions({ ...draft, optionsJobStatus: 'completed' })).toBe(
      false,
    );
    expect(shouldPollOptions({ ...draft, optionsJobStatus: 'failed' })).toBe(
      false,
    );
  });

  it('polls a replacement job even though the current set is complete', () => {
    const draft = { ...draftWithOptions(), regenerationJobId: 'job-2' };
    expect(shouldPollOptions(draft)).toBe(true);
    expect(activeOptionsJobId(draft)).toBe('job-2');
  });

  it('does not poll without a job', () => {
    expect(shouldPollOptions(emptyDraft(emptyStage1Values()))).toBe(false);
  });
});

describe('applyOptionsResult', () => {
  it('replaces the set only once a valid replacement arrives', () => {
    const draft = { ...draftWithOptions(), regenerationJobId: 'job-2' };
    const next = applyOptionsResult(draft, NEW_OPTIONS, null);

    expect(next.options.map((o) => o.id)).toEqual(['new-1', 'new-2', 'new-3']);
    expect(next.regenerationJobId).toBeNull();
    // The replacement job becomes the provenance stage 2 cites.
    expect(next.optionsJobId).toBe('job-2');
  });

  it('keeps the current options when a result carries none', () => {
    const draft = { ...draftWithOptions(), regenerationJobId: 'job-2' };
    const next = applyOptionsResult(draft, [], null);

    expect(next.options).toEqual(OLD_OPTIONS);
    expect(next.regenerationFailed).toBe(true);
  });

  it('surfaces a safety block instead of goal cards', () => {
    const next = applyOptionsResult(draftWithOptions(), [], 'please reach out');
    expect(next.options).toEqual([]);
    expect(next.safetyMessage).toBe('please reach out');
  });

  it('always presents options in rank order', () => {
    const shuffled = [NEW_OPTIONS[2], NEW_OPTIONS[0], NEW_OPTIONS[1]];
    expect(sortByRank(shuffled).map((o) => o.rank)).toEqual([1, 2, 3]);
    expect(
      applyOptionsResult(draftWithOptions(), shuffled, null).options.map(
        (o) => o.rank,
      ),
    ).toEqual([1, 2, 3]);
  });
});

describe('applyOptionsFailure', () => {
  // The behaviour the product explicitly requires: asking for alternatives must
  // never cost the user the three options they already have.
  it('keeps the existing options when a REGENERATION fails', () => {
    const draft = { ...draftWithOptions(), regenerationJobId: 'job-2' };
    const next = applyOptionsFailure(draft);

    expect(next.options).toEqual(OLD_OPTIONS);
    expect(next.optionsJobStatus).toBe('completed');
    expect(next.regenerationFailed).toBe(true);
    expect(next.regenerationJobId).toBeNull();
  });

  it('marks the job failed when the FIRST generation fails', () => {
    const draft = {
      ...emptyDraft(emptyStage1Values()),
      userId: USER,
      optionsJobId: 'job-1',
      optionsJobStatus: 'processing' as const,
    };
    expect(applyOptionsFailure(draft).optionsJobStatus).toBe('failed');
  });
});

describe('isStatusForActiveJob', () => {
  it('applies a status that belongs to the watched job', () => {
    expect(isStatusForActiveJob('job-2', 'job-2')).toBe(true);
  });

  // The regression this guards: right after a regeneration starts, the polling
  // hook can still be holding the PREVIOUS job's completed response. Applying it
  // re-installs the options the user asked to move on from and ends the poll, so
  // the set silently never changes.
  it('ignores the previous job’s response after a regeneration starts', () => {
    expect(isStatusForActiveJob('job-2', 'job-1')).toBe(false);
  });

  it.each([
    ['no active job', null, 'job-1'],
    ['no response id', 'job-1', undefined],
    ['neither', null, undefined],
  ])('ignores %s', (_name, active, response) => {
    expect(isStatusForActiveJob(active, response)).toBe(false);
  });
});

describe('isJobGoneError', () => {
  // A job the server has never heard of is terminal: the user must get a way
  // out rather than staring at a pending screen that will never resolve.
  it('treats a 404 as the job being gone', () => {
    expect(isJobGoneError({ status: 404, data: 'Job not found' })).toBe(true);
  });

  // Everything else is assumed transient. The generation is probably still
  // running, so the app keeps waiting instead of starting a second one.
  it.each([
    ['offline', { status: 'FETCH_ERROR', error: 'Network request failed' }],
    ['timeout', { status: 'TIMEOUT_ERROR' }],
    ['server error', { status: 500 }],
    ['auth', { status: 401 }],
    ['no status field', { message: 'boom' }],
    ['null', null],
    ['undefined', undefined],
  ])('keeps waiting on %s', (_name, error) => {
    expect(isJobGoneError(error)).toBe(false);
  });
});

describe('isDraftEmpty', () => {
  it('is empty before anything is answered', () => {
    expect(isDraftEmpty(emptyDraft(emptyStage1Values()))).toBe(true);
  });

  it('is not empty once a single answer exists', () => {
    const draft = emptyDraft({ ...emptyStage1Values(), trigger: 'feel_stuck' });
    expect(isDraftEmpty(draft)).toBe(false);
  });

  it('is not empty while a job is in flight', () => {
    const draft = { ...emptyDraft(emptyStage1Values()), optionsJobId: 'job-1' };
    expect(isDraftEmpty(draft)).toBe(false);
  });
});
