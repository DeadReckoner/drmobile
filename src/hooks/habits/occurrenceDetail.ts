/**
 * What the occurrence detail screen puts on the page.
 *
 * These are one-liners, but they are the rules that produced the layout bug
 * they replace: a screen that reserved space for sections whose content was
 * absent, and that pushed the checklist to the bottom of the viewport. Keeping
 * them here rather than inline means each "is there anything to show?" decision
 * is stated once and can be tested, instead of being re-derived slightly
 * differently at each call site.
 */

export interface OccurrenceDetailFacts {
  /** Weekly items show their weekday selector. */
  isWeekly: boolean;
  /** Monthly items show their day-of-month. */
  isMonthly: boolean;
  hasDueDate: boolean;
  hasStartDate: boolean;
  hasEndDate: boolean;
}

/**
 * Whether the checklist renders.
 *
 * Driven by the OCCURRENCE's step count, not the template's, so an item whose
 * steps were all deleted falls back to the single-action button instead of
 * rendering an empty card.
 */
export const shouldRenderSteps = (stepsTotal: number | undefined): boolean =>
  (stepsTotal ?? 0) > 0;

/**
 * Whether the description renders.
 *
 * Whitespace-only counts as absent: the old layout gave any non-null
 * description a heading, so a stray space produced a labelled empty block.
 */
export const shouldRenderDescription = (
  description: string | null | undefined,
): boolean => Boolean(description && description.trim().length > 0);

/**
 * Whether the secondary "Details" block renders at all.
 *
 * False for an item carrying none of it, so the section label never appears
 * over nothing.
 */
export const shouldRenderDetails = ({
  isWeekly,
  isMonthly,
  hasDueDate,
  hasStartDate,
  hasEndDate,
}: OccurrenceDetailFacts): boolean =>
  isWeekly || isMonthly || hasDueDate || hasStartDate || hasEndDate;

/**
 * Whether the manual complete/incomplete button renders.
 *
 * Exactly the inverse of the checklist: with steps, the last step completes the
 * occurrence, so a button would be a second and conflicting path to the same
 * state.
 */
export const shouldRenderManualCompletionButton = (
  stepsTotal: number | undefined,
): boolean => !shouldRenderSteps(stepsTotal);
