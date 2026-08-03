import {
  GOAL_DISCOVERY_SCHEMA_VERSION,
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryArea,
  GoalDiscoveryErrors,
  GoalDiscoveryLimits,
  GoalDiscoveryOutcome,
  GoalDiscoveryStage1Values,
} from '@/hooks/goalDiscovery/goalDiscovery.types';

/**
 * Stage 1 rules, kept as pure functions so the screen is only wiring and the
 * behaviour that actually matters (selection caps, validation, what gets sent)
 * is testable without rendering anything.
 */

export const emptyStage1Values = (): GoalDiscoveryStage1Values => ({
  trigger: null,
  triggerNote: '',
  areas: [],
  customArea: '',
  selfDescription: null,
  recurringThought: '',
  successDefinition: '',
  outcomes: [],
  customOutcome: '',
  targetType: null,
});

/**
 * Field order for the whole form. Used to decide which invalid field to scroll
 * to after a failed submit: the FIRST one in this order, which is the first one
 * the user sees.
 */
export const STAGE1_FIELD_ORDER = [
  'trigger',
  'triggerNote',
  'areas',
  'selfDescription',
  'recurringThought',
  'successDefinition',
  'outcomes',
  'targetType',
] as const;

export type Stage1Field = (typeof STAGE1_FIELD_ORDER)[number];

/**
 * A non-empty custom entry counts as one selection, so the cap covers both the
 * chips and the free-text box. Mirrors the server's AreaSelectionCount.
 */
export const areaSelectionCount = (values: GoalDiscoveryStage1Values): number =>
  values.areas.length + (values.customArea.trim() ? 1 : 0);

export const outcomeSelectionCount = (
  values: GoalDiscoveryStage1Values,
): number => values.outcomes.length + (values.customOutcome.trim() ? 1 : 0);

/**
 * Toggle an area chip. Deselecting always works; selecting is refused once the
 * cap is reached rather than silently dropping an earlier choice — the user
 * deselects something first, and nothing they picked disappears behind them.
 */
export const toggleArea = (
  values: GoalDiscoveryStage1Values,
  area: GoalDiscoveryArea,
): GoalDiscoveryStage1Values => {
  if (values.areas.includes(area)) {
    return { ...values, areas: values.areas.filter((a) => a !== area) };
  }
  if (areaSelectionCount(values) >= GoalDiscoveryLimits.maxAreas) {
    return values;
  }
  return { ...values, areas: [...values.areas, area] };
};

export const toggleOutcome = (
  values: GoalDiscoveryStage1Values,
  outcome: GoalDiscoveryOutcome,
): GoalDiscoveryStage1Values => {
  if (values.outcomes.includes(outcome)) {
    return {
      ...values,
      outcomes: values.outcomes.filter((o) => o !== outcome),
    };
  }
  if (outcomeSelectionCount(values) >= GoalDiscoveryLimits.maxOutcomes) {
    return values;
  }
  return { ...values, outcomes: [...values.outcomes, outcome] };
};

/** True when another area chip may be selected. Drives the disabled state. */
export const canSelectMoreAreas = (
  values: GoalDiscoveryStage1Values,
): boolean => areaSelectionCount(values) < GoalDiscoveryLimits.maxAreas;

export const canSelectMoreOutcomes = (
  values: GoalDiscoveryStage1Values,
): boolean => outcomeSelectionCount(values) < GoalDiscoveryLimits.maxOutcomes;

/**
 * Validate the whole form. Returns a field-keyed map of translation keys; an
 * empty object means valid.
 *
 * Values are trimmed for the length and emptiness checks so an answer of pure
 * whitespace is treated as no answer at all, matching the server.
 */
export const validateStage1 = (
  values: GoalDiscoveryStage1Values,
): GoalDiscoveryErrors => {
  const errors: GoalDiscoveryErrors = {};

  if (!values.trigger) {
    errors.trigger = 'goal_discovery.errors.select_one';
  }
  if (values.triggerNote.trim().length > GoalDiscoveryLimits.shortText) {
    errors.triggerNote = 'goal_discovery.errors.too_long';
  }

  const areaCount = areaSelectionCount(values);
  if (areaCount === 0) {
    errors.areas = 'goal_discovery.errors.select_at_least_one';
  } else if (areaCount > GoalDiscoveryLimits.maxAreas) {
    errors.areas = 'goal_discovery.errors.max_areas';
  } else if (values.customArea.trim().length > GoalDiscoveryLimits.shortText) {
    errors.areas = 'goal_discovery.errors.too_long';
  }

  if (!values.selfDescription) {
    errors.selfDescription = 'goal_discovery.errors.select_one';
  }

  const recurring = values.recurringThought.trim();
  if (!recurring) {
    errors.recurringThought = 'goal_discovery.errors.required';
  } else if (recurring.length > GoalDiscoveryLimits.longText) {
    errors.recurringThought = 'goal_discovery.errors.too_long';
  }

  const success = values.successDefinition.trim();
  if (!success) {
    errors.successDefinition = 'goal_discovery.errors.required';
  } else if (success.length > GoalDiscoveryLimits.longText) {
    errors.successDefinition = 'goal_discovery.errors.too_long';
  }

  const outcomeCount = outcomeSelectionCount(values);
  if (outcomeCount === 0) {
    errors.outcomes = 'goal_discovery.errors.select_at_least_one';
  } else if (outcomeCount > GoalDiscoveryLimits.maxOutcomes) {
    errors.outcomes = 'goal_discovery.errors.max_outcomes';
  } else if (
    values.customOutcome.trim().length > GoalDiscoveryLimits.shortText
  ) {
    errors.outcomes = 'goal_discovery.errors.too_long';
  }

  if (!values.targetType) {
    errors.targetType = 'goal_discovery.errors.select_one';
  }

  return errors;
};

/**
 * The first invalid field in display order, or null when the form is valid.
 * The screen scrolls to this after a failed submit rather than leaving the user
 * to hunt for the problem.
 */
export const firstInvalidStage1Field = (
  errors: GoalDiscoveryErrors,
): Stage1Field | null =>
  STAGE1_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;

/**
 * Build the wire payload. Only call with values that passed validateStage1 —
 * the non-null assertions below are what that guarantee buys.
 *
 * Optional text is omitted entirely when empty rather than sent as "", so the
 * stored payload reflects what the user actually answered.
 */
export const toStage1Payload = (
  values: GoalDiscoveryStage1Values,
): GoalDiscoveryAnswersPayload => {
  const payload: GoalDiscoveryAnswersPayload = {
    schema_version: GOAL_DISCOVERY_SCHEMA_VERSION,
    trigger: values.trigger as NonNullable<
      GoalDiscoveryStage1Values['trigger']
    >,
    areas: [...values.areas],
    self_description: values.selfDescription as NonNullable<
      GoalDiscoveryStage1Values['selfDescription']
    >,
    recurring_thought: values.recurringThought.trim(),
    success_definition: values.successDefinition.trim(),
    outcomes: [...values.outcomes],
    target_type: values.targetType as NonNullable<
      GoalDiscoveryStage1Values['targetType']
    >,
  };

  const triggerNote = values.triggerNote.trim();
  if (triggerNote) payload.trigger_note = triggerNote;

  const customArea = values.customArea.trim();
  if (customArea) payload.custom_area = customArea;

  const customOutcome = values.customOutcome.trim();
  if (customOutcome) payload.custom_outcome = customOutcome;

  return payload;
};

/**
 * Rebuild editable form state from a stored payload, for "Edit existing inputs"
 * and for resuming a draft written by an earlier session.
 */
export const fromStage1Payload = (
  payload: GoalDiscoveryAnswersPayload,
): GoalDiscoveryStage1Values => ({
  trigger: payload.trigger,
  triggerNote: payload.trigger_note ?? '',
  areas: [...(payload.areas ?? [])],
  customArea: payload.custom_area ?? '',
  selfDescription: payload.self_description,
  recurringThought: payload.recurring_thought ?? '',
  successDefinition: payload.success_definition ?? '',
  outcomes: [...(payload.outcomes ?? [])],
  customOutcome: payload.custom_outcome ?? '',
  targetType: payload.target_type,
});
