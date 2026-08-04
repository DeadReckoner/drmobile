import {
  shouldRenderDescription,
  shouldRenderDetails,
  shouldRenderManualCompletionButton,
  shouldRenderSteps,
} from '@/hooks/habits/occurrenceDetail';

/**
 * What the occurrence detail screen puts on the page.
 *
 * These guard the layout defect this change fixes: sections that reserved space
 * for content that was not there. The rendered result is checked on the
 * emulator; these pin the decisions behind it.
 */

const facts = (
  over: Partial<Parameters<typeof shouldRenderDetails>[0]> = {},
) => ({
  isWeekly: false,
  isMonthly: false,
  hasDueDate: false,
  hasStartDate: false,
  hasEndDate: false,
  ...over,
});

describe('shouldRenderSteps', () => {
  // The checklist must never be conditionally dropped when steps exist -- it is
  // the only completion path for a step-driven item.
  it('renders the checklist whenever the occurrence has steps', () => {
    expect(shouldRenderSteps(1)).toBe(true);
    expect(shouldRenderSteps(3)).toBe(true);
    expect(shouldRenderSteps(99)).toBe(true);
  });

  it('renders no checklist for a stepless occurrence', () => {
    expect(shouldRenderSteps(0)).toBe(false);
  });

  // Before the occurrence query resolves there is no count; showing an empty
  // steps card and then swapping it out would flash.
  it('renders no checklist while the count is unknown', () => {
    expect(shouldRenderSteps(undefined)).toBe(false);
  });
});

describe('shouldRenderManualCompletionButton', () => {
  // Exactly the inverse of the checklist: never both, never neither.
  it('is the complement of the checklist', () => {
    [0, 1, 5, undefined].forEach((total) => {
      expect(shouldRenderManualCompletionButton(total)).toBe(
        !shouldRenderSteps(total),
      );
    });
  });

  it('gives a stepless occurrence its single-action button', () => {
    expect(shouldRenderManualCompletionButton(0)).toBe(true);
  });

  it('withholds the button when steps drive completion', () => {
    expect(shouldRenderManualCompletionButton(2)).toBe(false);
  });
});

describe('shouldRenderDescription', () => {
  it('renders a real description', () => {
    expect(shouldRenderDescription('Stretch first.')).toBe(true);
  });

  // The point of the change: no description means no labelled empty area, and
  // no reserved gap.
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty', ''],
    ['whitespace only', '   \n\t '],
  ])('renders nothing for a %s description', (_label, value) => {
    expect(shouldRenderDescription(value)).toBe(false);
  });
});

describe('shouldRenderDetails', () => {
  // An item with no dates and no cadence detail gets no "Details" label sitting
  // over nothing.
  it('renders nothing when there is no secondary detail', () => {
    expect(shouldRenderDetails(facts())).toBe(false);
  });

  it.each([
    ['weekly cadence', { isWeekly: true }],
    ['monthly cadence', { isMonthly: true }],
    ['a due date', { hasDueDate: true }],
    ['a start date', { hasStartDate: true }],
    ['an end date', { hasEndDate: true }],
  ])('renders the section for %s', (_label, over) => {
    expect(shouldRenderDetails(facts(over))).toBe(true);
  });

  // The common case: a daily habit with a start date still has a Details block,
  // which is where the date moved to.
  it('renders the section for a plain daily habit with a start date', () => {
    expect(shouldRenderDetails(facts({ hasStartDate: true }))).toBe(true);
  });
});

// A stepless occurrence must still be a usable screen: no checklist, but its
// action and its details survive.
describe('a stepless occurrence keeps a valid layout', () => {
  it('has no checklist, a completion button, and its details', () => {
    expect(shouldRenderSteps(0)).toBe(false);
    expect(shouldRenderManualCompletionButton(0)).toBe(true);
    expect(shouldRenderDetails(facts({ hasStartDate: true }))).toBe(true);
  });
});
