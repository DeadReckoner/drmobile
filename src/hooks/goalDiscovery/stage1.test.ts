import {
  GoalDiscoveryLimits,
  GoalDiscoveryStage1Values,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import {
  areaSelectionCount,
  canSelectMoreAreas,
  canSelectMoreOutcomes,
  emptyStage1Values,
  firstInvalidStage1Field,
  fromStage1Payload,
  outcomeSelectionCount,
  toggleArea,
  toggleOutcome,
  toStage1Payload,
  validateStage1,
} from '@/hooks/goalDiscovery/stage1';

// Stage 1 selection caps, validation and the payload that goes on the wire.
// These rules are mirrored on the server; a change here without a matching
// change there means the app lets through something the API will reject.

const complete = (): GoalDiscoveryStage1Values => ({
  ...emptyStage1Values(),
  trigger: 'feel_stuck',
  areas: ['career', 'money'],
  selfDescription: 'know_but_dont_do',
  recurringThought: 'Starting something of my own',
  successDefinition: 'One paying customer and a routine I keep',
  outcomes: ['create_income'],
  targetType: 'money_making_project',
});

describe('area selection', () => {
  it('counts a non-empty custom area as one of the three', () => {
    const values = {
      ...complete(),
      areas: ['career' as const],
      customArea: 'Volunteering',
    };
    expect(areaSelectionCount(values)).toBe(2);
  });

  it('ignores a whitespace-only custom area', () => {
    const values = {
      ...complete(),
      areas: ['career' as const],
      customArea: '   ',
    };
    expect(areaSelectionCount(values)).toBe(1);
  });

  it('refuses a fourth selection instead of dropping an earlier one', () => {
    const values: GoalDiscoveryStage1Values = {
      ...complete(),
      areas: ['career', 'money', 'health'],
    };
    const next = toggleArea(values, 'learning');

    // Nothing was silently swapped out.
    expect(next.areas).toEqual(['career', 'money', 'health']);
    expect(canSelectMoreAreas(values)).toBe(false);
  });

  it('lets a custom area consume the third slot', () => {
    const values: GoalDiscoveryStage1Values = {
      ...complete(),
      areas: ['career', 'money'],
      customArea: 'Volunteering',
    };
    expect(canSelectMoreAreas(values)).toBe(false);
    expect(toggleArea(values, 'health').areas).toEqual(['career', 'money']);
  });

  it('always allows deselecting, even at the cap', () => {
    const values: GoalDiscoveryStage1Values = {
      ...complete(),
      areas: ['career', 'money', 'health'],
    };
    expect(toggleArea(values, 'money').areas).toEqual(['career', 'health']);
  });
});

describe('outcome selection', () => {
  it('counts a non-empty custom outcome toward the maximum of two', () => {
    const values: GoalDiscoveryStage1Values = {
      ...complete(),
      outcomes: ['create_income'],
      customOutcome: 'Stop dreading Mondays',
    };
    expect(outcomeSelectionCount(values)).toBe(2);
    expect(canSelectMoreOutcomes(values)).toBe(false);
    expect(toggleOutcome(values, 'reduce_stress').outcomes).toEqual([
      'create_income',
    ]);
  });

  it('refuses a third outcome', () => {
    const values: GoalDiscoveryStage1Values = {
      ...complete(),
      outcomes: ['create_income', 'build_confidence'],
    };
    expect(toggleOutcome(values, 'reduce_stress').outcomes).toHaveLength(2);
  });
});

describe('validateStage1', () => {
  it('accepts a complete form', () => {
    expect(validateStage1(complete())).toEqual({});
  });

  it.each([
    ['trigger', { trigger: null }],
    ['selfDescription', { selfDescription: null }],
    ['targetType', { targetType: null }],
    ['recurringThought', { recurringThought: '' }],
    ['successDefinition', { successDefinition: '' }],
  ])('flags %s when unanswered', (field, patch) => {
    const errors = validateStage1({ ...complete(), ...patch });
    expect(errors[field]).toBeDefined();
  });

  it('treats whitespace-only long text as unanswered', () => {
    const errors = validateStage1({
      ...complete(),
      recurringThought: '   \n\t ',
    });
    expect(errors.recurringThought).toBe('goal_discovery.errors.required');
  });

  it('requires at least one area and one outcome', () => {
    const errors = validateStage1({ ...complete(), areas: [], outcomes: [] });
    expect(errors.areas).toBe('goal_discovery.errors.select_at_least_one');
    expect(errors.outcomes).toBe('goal_discovery.errors.select_at_least_one');
  });

  it('rejects text past the shared limits', () => {
    const errors = validateStage1({
      ...complete(),
      recurringThought: 'x'.repeat(GoalDiscoveryLimits.longText + 1),
      triggerNote: 'y'.repeat(GoalDiscoveryLimits.shortText + 1),
    });
    expect(errors.recurringThought).toBe('goal_discovery.errors.too_long');
    expect(errors.triggerNote).toBe('goal_discovery.errors.too_long');
  });

  // A form state that somehow exceeded the cap (restored draft, older build)
  // must still be caught rather than sent.
  it('rejects an over-cap selection even though the UI prevents making one', () => {
    const errors = validateStage1({
      ...complete(),
      areas: ['career', 'money', 'health'],
      customArea: 'Volunteering',
    });
    expect(errors.areas).toBe('goal_discovery.errors.max_areas');
  });
});

describe('firstInvalidStage1Field', () => {
  it('returns the earliest invalid field in display order', () => {
    const errors = validateStage1({
      ...complete(),
      successDefinition: '',
      trigger: null,
    });
    expect(firstInvalidStage1Field(errors)).toBe('trigger');
  });

  it('returns null when everything is valid', () => {
    expect(firstInvalidStage1Field(validateStage1(complete()))).toBeNull();
  });
});

describe('toStage1Payload', () => {
  it('maps the form onto the wire shape with trimmed text', () => {
    const payload = toStage1Payload({
      ...complete(),
      recurringThought: '  Starting something of my own  ',
    });

    expect(payload).toEqual({
      schema_version: 1,
      trigger: 'feel_stuck',
      areas: ['career', 'money'],
      self_description: 'know_but_dont_do',
      recurring_thought: 'Starting something of my own',
      success_definition: 'One paying customer and a routine I keep',
      outcomes: ['create_income'],
      target_type: 'money_making_project',
    });
  });

  it('omits optional text rather than sending empty strings', () => {
    const payload = toStage1Payload({ ...complete(), triggerNote: '   ' });
    expect(payload).not.toHaveProperty('trigger_note');
    expect(payload).not.toHaveProperty('custom_area');
    expect(payload).not.toHaveProperty('custom_outcome');
  });

  it('includes the custom entries when the user filled them in', () => {
    const payload = toStage1Payload({
      ...complete(),
      areas: ['career'],
      customArea: '  Volunteering  ',
      outcomes: [],
      customOutcome: 'Stop dreading Mondays',
    });
    expect(payload.custom_area).toBe('Volunteering');
    expect(payload.custom_outcome).toBe('Stop dreading Mondays');
  });

  // Round-tripping is what "Edit existing inputs" and draft restore rely on.
  it('round-trips back into editable form state', () => {
    const values = {
      ...complete(),
      triggerNote: 'Some context',
      customArea: 'Volunteering',
      areas: ['career' as const],
    };
    expect(fromStage1Payload(toStage1Payload(values))).toEqual(values);
  });
});
