import {
  CONSTRAINT_OTHER,
  GOAL_DISCOVERY_SCHEMA_VERSION,
  GoalDiscoveryAnswersPayload,
  GoalDiscoveryConstraint,
  GoalDiscoveryErrors,
  GoalDiscoveryLimits,
  GoalDiscoveryPacePayload,
  GoalDiscoveryPaceValues,
  GoalDiscoveryRoadmapPayload,
  GoalDiscoveryStage2Values,
  GoalOption,
  GoalOptionPace,
  NO_MAJOR_CONSTRAINTS,
} from '@/hooks/goalDiscovery/goalDiscovery.types';
import { DateUtils } from '@/utils/date.utils';

/**
 * Stage 2 rules: prefill from the chosen option, constraint exclusivity, pace
 * branching, validation, and the final payload.
 *
 * Two things this file deliberately does NOT do, because the backend owns them:
 * convert a weekly-time choice into a timeline, or convert a target date into
 * weekly hours. Doing either here would mean shipping an unverified assumption
 * (there is no defensible hours value for "2 to 3 sessions a week") and showing
 * the user a number the generator might then contradict.
 */

export const emptyPaceValues = (): GoalDiscoveryPaceValues => ({
  selectedPace: null,
  isCustom: false,
  control: null,
  targetDate: '',
  weeklyPreset: null,
  customWeeklyDescription: '',
});

export const emptyStage2Values = (): GoalDiscoveryStage2Values => ({
  selectedGoal: '',
  completionDefinition: '',
  whyNow: '',
  pace: emptyPaceValues(),
  baseline: '',
  constraints: [],
  constraintDetails: '',
  additionalContext: '',
});

export const STAGE2_FIELD_ORDER = [
  'selectedGoal',
  'completionDefinition',
  'whyNow',
  'pace',
  'baseline',
  'constraints',
  'constraintDetails',
  'additionalContext',
] as const;

export type Stage2Field = (typeof STAGE2_FIELD_ORDER)[number];

/**
 * Initialise stage 2 from the chosen option.
 *
 * "Why does this matter right now?" is prefilled from the user's OWN stage-1
 * success definition rather than generated prose: it is already their answer to
 * almost this question, and stitching AI text together with it would produce a
 * paragraph that reads like neither.
 */
export const prefillStage2 = (
  option: GoalOption,
  answers: GoalDiscoveryAnswersPayload,
): GoalDiscoveryStage2Values => ({
  ...emptyStage2Values(),
  selectedGoal: option.goal_title,
  completionDefinition: option.target_outcome,
  whyNow: answers.success_definition ?? '',
});

/**
 * Re-prefill after the user goes back and picks a DIFFERENT goal.
 *
 * Fields derived from the previous option (goal, definition of done, and the
 * pace, whose numbers belong to that option) are replaced. Neutral fields the
 * user wrote themselves — baseline, obstacles, extra context — are kept, because
 * they describe the user, not the goal.
 */
export const reselectOption = (
  current: GoalDiscoveryStage2Values,
  option: GoalOption,
  answers: GoalDiscoveryAnswersPayload,
): GoalDiscoveryStage2Values => ({
  ...current,
  selectedGoal: option.goal_title,
  completionDefinition: option.target_outcome,
  whyNow: current.whyNow.trim()
    ? current.whyNow
    : (answers.success_definition ?? ''),
  // Never carry a pace estimate across options: those hours and months were
  // calculated for a goal the user just rejected.
  pace: emptyPaceValues(),
});

/**
 * Toggle a constraint, enforcing that "No major constraints right now" and the
 * real constraints are mutually exclusive.
 *
 * Both directions are an intentional tap: choosing "no major constraints" clears
 * the real ones, and choosing a real one clears "no major constraints". Nothing
 * here runs on render, so a re-render can never silently rewrite the answer.
 */
export const toggleConstraint = (
  values: GoalDiscoveryStage2Values,
  constraint: GoalDiscoveryConstraint,
): GoalDiscoveryStage2Values => {
  const selected = values.constraints.includes(constraint);

  if (selected) {
    return {
      ...values,
      constraints: values.constraints.filter((c) => c !== constraint),
    };
  }

  if (constraint === NO_MAJOR_CONSTRAINTS) {
    return { ...values, constraints: [NO_MAJOR_CONSTRAINTS] };
  }

  return {
    ...values,
    constraints: [
      ...values.constraints.filter((c) => c !== NO_MAJOR_CONSTRAINTS),
      constraint,
    ],
  };
};

/** "Add details" becomes required only while "Other" is selected. */
export const isConstraintDetailsRequired = (
  values: GoalDiscoveryStage2Values,
): boolean => values.constraints.includes(CONSTRAINT_OTHER);

/** Choosing one of the generated lanes clears any custom pace state. */
export const selectGeneratedPace = (
  values: GoalDiscoveryStage2Values,
  pace: GoalOptionPace,
): GoalDiscoveryStage2Values => ({
  ...values,
  pace: { ...emptyPaceValues(), selectedPace: pace },
});

/** Switching to custom clears the generated selection but keeps custom input. */
export const selectCustomPace = (
  values: GoalDiscoveryStage2Values,
): GoalDiscoveryStage2Values => ({
  ...values,
  pace: { ...values.pace, selectedPace: null, isCustom: true },
});

export const validateStage2 = (
  values: GoalDiscoveryStage2Values,
  today: Date = new Date(),
): GoalDiscoveryErrors => {
  const errors: GoalDiscoveryErrors = {};

  const goal = values.selectedGoal.trim();
  if (!goal) {
    errors.selectedGoal = 'goal_discovery.errors.required';
  } else if (goal.length > GoalDiscoveryLimits.title) {
    errors.selectedGoal = 'goal_discovery.errors.too_long';
  }

  const done = values.completionDefinition.trim();
  if (!done) {
    errors.completionDefinition = 'goal_discovery.errors.required';
  } else if (done.length > GoalDiscoveryLimits.longText) {
    errors.completionDefinition = 'goal_discovery.errors.too_long';
  }

  const why = values.whyNow.trim();
  if (!why) {
    errors.whyNow = 'goal_discovery.errors.required';
  } else if (why.length > GoalDiscoveryLimits.longText) {
    errors.whyNow = 'goal_discovery.errors.too_long';
  }

  const paceError = validatePace(values.pace, today);
  if (paceError) errors.pace = paceError;

  const baseline = values.baseline.trim();
  if (!baseline) {
    errors.baseline = 'goal_discovery.errors.required';
  } else if (baseline.length > GoalDiscoveryLimits.detailText) {
    errors.baseline = 'goal_discovery.errors.too_long';
  }

  if (values.constraints.length === 0) {
    errors.constraints = 'goal_discovery.errors.select_at_least_one';
  }

  const details = values.constraintDetails.trim();
  if (isConstraintDetailsRequired(values) && !details) {
    errors.constraintDetails = 'goal_discovery.errors.details_required';
  } else if (details.length > GoalDiscoveryLimits.detailText) {
    errors.constraintDetails = 'goal_discovery.errors.too_long';
  }

  if (values.additionalContext.trim().length > GoalDiscoveryLimits.longText) {
    errors.additionalContext = 'goal_discovery.errors.too_long';
  }

  return errors;
};

/** Returns a translation key for the pace problem, or null when valid. */
const validatePace = (
  pace: GoalDiscoveryPaceValues,
  today: Date,
): string | null => {
  if (!pace.isCustom) {
    return pace.selectedPace ? null : 'goal_discovery.errors.pace_required';
  }

  if (!pace.control) return 'goal_discovery.errors.control_required';

  if (pace.control === 'deadline') {
    if (!pace.targetDate) return 'goal_discovery.errors.date_required';
    return isFutureLocalDate(pace.targetDate, today)
      ? null
      : 'goal_discovery.errors.date_must_be_future';
  }

  if (!pace.weeklyPreset) return 'goal_discovery.errors.weekly_limit_required';

  if (pace.weeklyPreset === 'custom') {
    const described = pace.customWeeklyDescription.trim();
    if (!described) return 'goal_discovery.errors.custom_pace_required';
    if (described.length > GoalDiscoveryLimits.customPace) {
      return 'goal_discovery.errors.too_long';
    }
  }

  return null;
};

/**
 * Compare two calendar days, never two instants.
 *
 * Both sides are reduced to YYYY-MM-DD in the device's own timezone and compared
 * as strings. Converting either to UTC first is exactly how a user west of UTC
 * picking tomorrow evening gets told their date is in the past.
 */
export const isFutureLocalDate = (
  targetDate: string,
  today: Date = new Date(),
): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) return false;
  return targetDate > DateUtils.formatDate(today, 'YYYY-MM-DD');
};

/** Format a picked Date as the date-only value the API expects. */
export const toDateOnly = (date: Date): string =>
  DateUtils.formatDate(date, 'YYYY-MM-DD');

/** Serialize the pace union. Only the active branch's fields are included. */
export const toPacePayload = (
  pace: GoalDiscoveryPaceValues,
): GoalDiscoveryPacePayload => {
  if (!pace.isCustom) {
    return {
      mode: 'generated',
      selected_pace: pace.selectedPace as GoalOptionPace,
    };
  }

  if (pace.control === 'deadline') {
    return { mode: 'ideal_deadline', target_date: pace.targetDate };
  }

  const preset = pace.weeklyPreset as NonNullable<
    GoalDiscoveryPaceValues['weeklyPreset']
  >;
  if (preset === 'custom') {
    return {
      mode: 'weekly_limit',
      preset,
      custom_description: pace.customWeeklyDescription.trim(),
    };
  }
  return { mode: 'weekly_limit', preset };
};

/**
 * Build the final payload. Carries the provenance (discovery job + original
 * option id) so the server can verify the selection came from a result it
 * actually produced for this user.
 */
export const toStage2Payload = (params: {
  values: GoalDiscoveryStage2Values;
  answers: GoalDiscoveryAnswersPayload;
  discoveryJobId: string;
  selectedOptionId: string;
  idempotencyKey: string;
}): GoalDiscoveryRoadmapPayload => {
  const { values, answers, discoveryJobId, selectedOptionId, idempotencyKey } =
    params;

  const payload: GoalDiscoveryRoadmapPayload = {
    schema_version: GOAL_DISCOVERY_SCHEMA_VERSION,
    discovery_job_id: discoveryJobId,
    selected_option_id: selectedOptionId,
    answers,
    selected_goal: values.selectedGoal.trim(),
    completion_definition: values.completionDefinition.trim(),
    why_now: values.whyNow.trim(),
    pace: toPacePayload(values.pace),
    baseline: values.baseline.trim(),
    constraints: [...values.constraints],
    idempotency_key: idempotencyKey,
  };

  const details = values.constraintDetails.trim();
  if (details) payload.constraint_details = details;

  const extra = values.additionalContext.trim();
  if (extra) payload.additional_context = extra;

  return payload;
};

export const firstInvalidStage2Field = (
  errors: GoalDiscoveryErrors,
): Stage2Field | null =>
  STAGE2_FIELD_ORDER.find((field) => Boolean(errors[field])) ?? null;

/** The effort lane for a pace, or undefined when the option lacks it. */
export const effortFor = (option: GoalOption, pace: GoalOptionPace) =>
  option.effort_examples?.find((effort) => effort.pace === pace);
