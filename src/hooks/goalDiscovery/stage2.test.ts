import {
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryLimits,
  GoalDiscoveryStage2Values,
  GoalOption,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import {
  effortFor,
  emptyStage2Values,
  firstInvalidStage2Field,
  isConstraintDetailsRequired,
  isFutureLocalDate,
  prefillStage2,
  reselectOption,
  selectCustomPace,
  selectGeneratedPace,
  toDateOnly,
  toggleConstraint,
  toPacePayload,
  toStage2Payload,
  validateStage2,
} from '@/hooks/goalDiscovery/stage2';

// Stage 2 prefill, constraint exclusivity, the three pace branches, and the
// final payload. The date handling here is the part most likely to break
// silently, so it is pinned down explicitly.

const OPTION: GoalOption = {
  id: 'option-1',
  rank: 1,
  goal_title: 'Launch a paid landing page',
  why_this_fits: 'Matches what you said about money and career.',
  target_outcome: 'A live page that has taken one real payment.',
  why_worth_pursuing: 'It turns intent into evidence.',
  effort_examples: [
    {
      pace: 'focused',
      hours_per_week_min: 8,
      hours_per_week_max: 10,
      estimated_duration_months_min: 2,
      estimated_duration_months_max: 3,
      display_text: '8-10 h/wk, 2-3 months',
    },
    {
      pace: 'steady',
      hours_per_week_min: 4,
      hours_per_week_max: 6,
      estimated_duration_months_min: 4,
      estimated_duration_months_max: 5,
      display_text: '4-6 h/wk, 4-5 months',
    },
    {
      pace: 'light',
      hours_per_week_min: 2,
      hours_per_week_max: 3,
      estimated_duration_months_min: 7,
      estimated_duration_months_max: 9,
      display_text: '2-3 h/wk, 7-9 months',
    },
  ],
  difficulty: { level: 'moderate', explanation: 'Fits your starting point.' },
  accountability_strength: {
    level: 'moderate',
    explanation: 'Weekly check-in.',
  },
};

const ANSWERS: GoalDiscoveryAnswersPayload = {
  schema_version: 1,
  trigger: 'feel_stuck',
  areas: ['career'],
  self_description: 'know_but_dont_do',
  recurring_thought: 'Starting something of my own',
  success_definition: 'Something real shipped and earning',
  outcomes: ['create_income'],
  target_type: 'money_making_project',
};

const TODAY = new Date(2026, 7, 3); // 3 Aug 2026, local time

const filled = (): GoalDiscoveryStage2Values => ({
  ...prefillStage2(OPTION, ANSWERS),
  pace: { ...emptyStage2Values().pace, selectedPace: 'steady' },
  baseline: 'I can write basic HTML and own a domain.',
  constraints: ['limited_time'],
});

describe('prefillStage2', () => {
  it('prefills the goal and definition of done from the chosen option', () => {
    const values = prefillStage2(OPTION, ANSWERS);
    expect(values.selectedGoal).toBe(OPTION.goal_title);
    expect(values.completionDefinition).toBe(OPTION.target_outcome);
  });

  // "Why does this matter" is prefilled from the user's own stage-1 answer, not
  // from generated prose stitched together with it.
  it('prefills "why now" from the user\'s own success definition', () => {
    expect(prefillStage2(OPTION, ANSWERS).whyNow).toBe(
      ANSWERS.success_definition,
    );
  });

  it('starts with no pace chosen', () => {
    expect(prefillStage2(OPTION, ANSWERS).pace.selectedPace).toBeNull();
  });
});

describe('reselectOption', () => {
  const OTHER: GoalOption = {
    ...OPTION,
    id: 'option-2',
    goal_title: 'Publish a weekly newsletter',
    target_outcome: 'Eight issues published on schedule.',
  };

  it('replaces the fields derived from the previous option', () => {
    const next = reselectOption(filled(), OTHER, ANSWERS);
    expect(next.selectedGoal).toBe(OTHER.goal_title);
    expect(next.completionDefinition).toBe(OTHER.target_outcome);
  });

  // The old pace numbers were calculated for a goal the user just rejected, so
  // carrying them over would submit stale data.
  it('clears the pace so a stale estimate is never submitted', () => {
    const next = reselectOption(filled(), OTHER, ANSWERS);
    expect(next.pace.selectedPace).toBeNull();
    expect(next.pace.isCustom).toBe(false);
  });

  it('keeps the neutral answers the user wrote themselves', () => {
    const current = {
      ...filled(),
      baseline: 'Ten years of writing experience.',
      constraints: ['low_energy' as const],
      constraintDetails: 'I travel a lot.',
      additionalContext: 'Prefer mornings.',
      whyNow: 'Because I said I would.',
    };
    const next = reselectOption(current, OTHER, ANSWERS);

    expect(next.baseline).toBe('Ten years of writing experience.');
    expect(next.constraints).toEqual(['low_energy']);
    expect(next.constraintDetails).toBe('I travel a lot.');
    expect(next.additionalContext).toBe('Prefer mornings.');
    expect(next.whyNow).toBe('Because I said I would.');
  });
});

describe('constraint exclusivity', () => {
  it('clears the real constraints when "no major constraints" is chosen', () => {
    const values = {
      ...filled(),
      constraints: ['limited_time' as const, 'low_energy' as const],
    };
    expect(
      toggleConstraint(values, 'no_major_constraints').constraints,
    ).toEqual(['no_major_constraints']);
  });

  it('clears "no major constraints" when a real one is chosen', () => {
    const values = {
      ...filled(),
      constraints: ['no_major_constraints' as const],
    };
    expect(toggleConstraint(values, 'limited_time').constraints).toEqual([
      'limited_time',
    ]);
  });

  it('only changes anything on an actual tap', () => {
    const values = {
      ...filled(),
      constraints: ['no_major_constraints' as const],
    };
    // Deselecting is still just a deselect, not a rewrite of the whole answer.
    expect(
      toggleConstraint(values, 'no_major_constraints').constraints,
    ).toEqual([]);
  });

  it('requires details only while "Other" is selected', () => {
    expect(isConstraintDetailsRequired(filled())).toBe(false);
    expect(
      isConstraintDetailsRequired({ ...filled(), constraints: ['other'] }),
    ).toBe(true);
  });
});

describe('validateStage2', () => {
  it('accepts a complete form', () => {
    expect(validateStage2(filled(), TODAY)).toEqual({});
  });

  it.each([
    ['selectedGoal', { selectedGoal: '  ' }],
    ['completionDefinition', { completionDefinition: '' }],
    ['whyNow', { whyNow: '' }],
    ['baseline', { baseline: '   ' }],
  ])('flags %s when blank or whitespace-only', (field, patch) => {
    expect(
      validateStage2({ ...filled(), ...patch }, TODAY)[field],
    ).toBeDefined();
  });

  it('requires at least one constraint', () => {
    expect(
      validateStage2({ ...filled(), constraints: [] }, TODAY).constraints,
    ).toBe('goal_discovery.errors.select_at_least_one');
  });

  it('requires details when "Other" is selected', () => {
    const errors = validateStage2(
      { ...filled(), constraints: ['other'], constraintDetails: '  ' },
      TODAY,
    );
    expect(errors.constraintDetails).toBe(
      'goal_discovery.errors.details_required',
    );
  });

  it('requires a pace to be chosen', () => {
    const values = { ...filled(), pace: emptyStage2Values().pace };
    expect(validateStage2(values, TODAY).pace).toBe(
      'goal_discovery.errors.pace_required',
    );
  });

  it('rejects text past the shared limits', () => {
    const errors = validateStage2(
      {
        ...filled(),
        selectedGoal: 'g'.repeat(GoalDiscoveryLimits.title + 1),
        baseline: 'b'.repeat(GoalDiscoveryLimits.detailText + 1),
      },
      TODAY,
    );
    expect(errors.selectedGoal).toBe('goal_discovery.errors.too_long');
    expect(errors.baseline).toBe('goal_discovery.errors.too_long');
  });

  it('returns the earliest invalid field in display order', () => {
    const errors = validateStage2(
      { ...filled(), baseline: '', selectedGoal: '' },
      TODAY,
    );
    expect(firstInvalidStage2Field(errors)).toBe('selectedGoal');
  });
});

describe('custom pace: ideal deadline', () => {
  const withDeadline = (targetDate: string): GoalDiscoveryStage2Values => ({
    ...filled(),
    pace: {
      ...emptyStage2Values().pace,
      isCustom: true,
      control: 'deadline',
      targetDate,
    },
  });

  it('requires a control choice first', () => {
    const values = {
      ...filled(),
      pace: { ...emptyStage2Values().pace, isCustom: true },
    };
    expect(validateStage2(values, TODAY).pace).toBe(
      'goal_discovery.errors.control_required',
    );
  });

  it('requires a date', () => {
    expect(validateStage2(withDeadline(''), TODAY).pace).toBe(
      'goal_discovery.errors.date_required',
    );
  });

  it('accepts a future date and rejects today and the past', () => {
    expect(
      validateStage2(withDeadline('2026-12-01'), TODAY).pace,
    ).toBeUndefined();
    expect(validateStage2(withDeadline('2026-08-03'), TODAY).pace).toBe(
      'goal_discovery.errors.date_must_be_future',
    );
    expect(validateStage2(withDeadline('2020-01-01'), TODAY).pace).toBe(
      'goal_discovery.errors.date_must_be_future',
    );
  });

  // The whole point of comparing calendar days: a user in a negative UTC offset
  // choosing tomorrow late at night must not be told the date is in the past.
  it('compares local calendar days, not UTC instants', () => {
    const lateEveningLocal = new Date(2026, 7, 3, 23, 30);
    expect(isFutureLocalDate('2026-08-04', lateEveningLocal)).toBe(true);
    expect(isFutureLocalDate('2026-08-03', lateEveningLocal)).toBe(false);
  });

  it('serializes a picked date as date-only in the local calendar', () => {
    // 23:30 local on 15 Sep must stay 2026-09-15, not roll to the 16th via UTC.
    expect(toDateOnly(new Date(2026, 8, 15, 23, 30))).toBe('2026-09-15');
  });

  it('sends the date unchanged, with no weekly hours invented', () => {
    const payload = toPacePayload(withDeadline('2026-11-30').pace);
    expect(payload).toEqual({
      mode: 'ideal_deadline',
      target_date: '2026-11-30',
    });
  });
});

describe('custom pace: weekly limit', () => {
  const withWeekly = (
    weeklyPreset: GoalDiscoveryStage2Values['pace']['weeklyPreset'],
    customWeeklyDescription = '',
  ): GoalDiscoveryStage2Values => ({
    ...filled(),
    pace: {
      ...emptyStage2Values().pace,
      isCustom: true,
      control: 'weekly',
      weeklyPreset,
      customWeeklyDescription,
    },
  });

  it('requires a preset', () => {
    expect(validateStage2(withWeekly(null), TODAY).pace).toBe(
      'goal_discovery.errors.weekly_limit_required',
    );
  });

  it('accepts a preset and sends it as a stable enum', () => {
    expect(
      validateStage2(withWeekly('two_to_three_sessions_week'), TODAY).pace,
    ).toBeUndefined();
    expect(
      toPacePayload(withWeekly('two_to_three_sessions_week').pace),
    ).toEqual({
      mode: 'weekly_limit',
      preset: 'two_to_three_sessions_week',
    });
  });

  it('requires a description when the preset is custom', () => {
    expect(validateStage2(withWeekly('custom'), TODAY).pace).toBe(
      'goal_discovery.errors.custom_pace_required',
    );
    expect(validateStage2(withWeekly('custom', '   '), TODAY).pace).toBe(
      'goal_discovery.errors.custom_pace_required',
    );
    expect(
      validateStage2(withWeekly('custom', '45 minutes on weekdays'), TODAY)
        .pace,
    ).toBeUndefined();
  });

  it('bounds the custom description', () => {
    const long = 'x'.repeat(GoalDiscoveryLimits.customPace + 1);
    expect(validateStage2(withWeekly('custom', long), TODAY).pace).toBe(
      'goal_discovery.errors.too_long',
    );
  });

  it('sends the trimmed custom description', () => {
    expect(
      toPacePayload(withWeekly('custom', '  45 minutes on weekdays  ').pace),
    ).toEqual({
      mode: 'weekly_limit',
      preset: 'custom',
      custom_description: '45 minutes on weekdays',
    });
  });
});

describe('pace switching', () => {
  it('clears custom state when a generated lane is chosen', () => {
    const custom = selectCustomPace(filled());
    const back = selectGeneratedPace(
      { ...custom, pace: { ...custom.pace, targetDate: '2026-12-01' } },
      'light',
    );
    expect(back.pace).toEqual({
      selectedPace: 'light',
      isCustom: false,
      control: null,
      targetDate: '',
      weeklyPreset: null,
      customWeeklyDescription: '',
    });
  });

  it('clears the generated lane when switching to custom', () => {
    expect(selectCustomPace(filled()).pace.selectedPace).toBeNull();
  });
});

describe('toStage2Payload', () => {
  const build = (values: GoalDiscoveryStage2Values) =>
    toStage2Payload({
      values,
      answers: ANSWERS,
      discoveryJobId: 'job-1',
      selectedOptionId: OPTION.id,
      idempotencyKey: 'key-1',
    });

  it('carries the provenance the server verifies against', () => {
    const payload = build(filled());
    expect(payload.discovery_job_id).toBe('job-1');
    expect(payload.selected_option_id).toBe(OPTION.id);
    expect(payload.schema_version).toBe(1);
    expect(payload.idempotency_key).toBe('key-1');
    expect(payload.answers).toEqual(ANSWERS);
  });

  it('sends trimmed text and the structured pace', () => {
    const payload = build({ ...filled(), selectedGoal: '  A goal  ' });
    expect(payload.selected_goal).toBe('A goal');
    expect(payload.pace).toEqual({
      mode: 'generated',
      selected_pace: 'steady',
    });
  });

  it('omits optional fields rather than sending empty strings', () => {
    const payload = build({
      ...filled(),
      constraintDetails: '  ',
      additionalContext: '',
    });
    expect(payload).not.toHaveProperty('constraint_details');
    expect(payload).not.toHaveProperty('additional_context');
  });
});

describe('effortFor', () => {
  it('reads the structured lane rather than parsing display text', () => {
    expect(effortFor(OPTION, 'light')?.hours_per_week_max).toBe(3);
    expect(effortFor(OPTION, 'focused')?.estimated_duration_months_min).toBe(2);
  });

  it('returns undefined for a lane the option does not carry', () => {
    expect(
      effortFor({ ...OPTION, effort_examples: [] }, 'steady'),
    ).toBeUndefined();
  });
});

// ─── remediation coverage ────────────────────────────────────────────────────

describe('constraint details requirement lifecycle', () => {
  // The requirement must appear AND disappear. A one-way rule leaves the user
  // blocked by a field the form no longer shows as relevant.
  it('drops the requirement when "Other" is deselected', () => {
    const withOther = toggleConstraint(filled(), 'other');
    expect(isConstraintDetailsRequired(withOther)).toBe(true);

    const withoutOther = toggleConstraint(withOther, 'other');
    expect(isConstraintDetailsRequired(withoutOther)).toBe(false);
    expect(
      validateStage2({ ...withoutOther, constraintDetails: '' }, TODAY)
        .constraintDetails,
    ).toBeUndefined();
  });

  // The screen only announces the requirement while it is UNMET; filled details
  // must satisfy it rather than leaving a permanent warning under the field.
  it('is satisfied by real details', () => {
    const values = {
      ...filled(),
      constraints: ['other' as const],
      constraintDetails: 'I travel for work three weeks a month',
    };
    expect(validateStage2(values, TODAY).constraintDetails).toBeUndefined();
  });
});

describe('pace payload discriminators', () => {
  // Every mode must serialize with the discriminator the server switches on.
  // A wrong tag silently changes which branch of the generator prompt runs.
  it('tags a generated lane', () => {
    const payload = toPacePayload(
      selectGeneratedPace(filled(), 'focused').pace,
    );
    expect(payload).toEqual({ mode: 'generated', selected_pace: 'focused' });
  });

  it('tags an ideal deadline', () => {
    const values = {
      ...filled(),
      pace: {
        ...emptyStage2Values().pace,
        isCustom: true,
        control: 'deadline' as const,
        targetDate: '2026-12-01',
      },
    };
    expect(toPacePayload(values.pace)).toEqual({
      mode: 'ideal_deadline',
      target_date: '2026-12-01',
    });
  });

  it('tags a weekly preset without inventing an hours number', () => {
    const values = {
      ...filled(),
      pace: {
        ...emptyStage2Values().pace,
        isCustom: true,
        control: 'weekly' as const,
        weeklyPreset: 'two_to_three_sessions_week' as const,
      },
    };
    expect(toPacePayload(values.pace)).toEqual({
      mode: 'weekly_limit',
      preset: 'two_to_three_sessions_week',
    });
  });

  it('tags weekly custom and carries the description', () => {
    const values = {
      ...filled(),
      pace: {
        ...emptyStage2Values().pace,
        isCustom: true,
        control: 'weekly' as const,
        weeklyPreset: 'custom' as const,
        customWeeklyDescription: '  45 minutes on weekdays  ',
      },
    };
    expect(toPacePayload(values.pace)).toEqual({
      mode: 'weekly_limit',
      preset: 'custom',
      custom_description: '45 minutes on weekdays',
    });
  });
});

describe('switching to a different goal', () => {
  const OTHER_OPTION: GoalOption = {
    ...OPTION,
    id: 'option-2',
    goal_title: 'Publish a weekly newsletter',
    target_outcome: 'Eight issues published on schedule.',
  };

  // The pace numbers belong to the option they were generated for. Carrying
  // them across would submit an estimate for a goal the user just rejected.
  it('never lets a previous option’s pace reach the payload', () => {
    const chosen = selectGeneratedPace(filled(), 'focused');
    const switched = reselectOption(chosen, OTHER_OPTION, ANSWERS);

    expect(switched.pace.selectedPace).toBeNull();
    expect(switched.pace.isCustom).toBe(false);
    // And the form now refuses to submit until a pace is chosen for the NEW
    // goal, rather than silently sending the old one.
    expect(validateStage2(switched, TODAY).pace).toBe(
      'goal_discovery.errors.pace_required',
    );
  });

  it('replaces the goal and definition of done', () => {
    const switched = reselectOption(filled(), OTHER_OPTION, ANSWERS);

    expect(switched.selectedGoal).toBe(OTHER_OPTION.goal_title);
    expect(switched.completionDefinition).toBe(OTHER_OPTION.target_outcome);
  });

  it('keeps every field the user wrote about themselves', () => {
    const authored = {
      ...filled(),
      whyNow: 'Because I keep putting it off',
      baseline: 'I have never done this before',
      constraints: ['limited_time' as const, 'other' as const],
      constraintDetails: 'I travel for work',
      additionalContext: 'Please avoid weekends',
    };

    const switched = reselectOption(authored, OTHER_OPTION, ANSWERS);

    expect(switched.whyNow).toBe(authored.whyNow);
    expect(switched.baseline).toBe(authored.baseline);
    expect(switched.constraints).toEqual(authored.constraints);
    expect(switched.constraintDetails).toBe(authored.constraintDetails);
    expect(switched.additionalContext).toBe(authored.additionalContext);
  });
});
