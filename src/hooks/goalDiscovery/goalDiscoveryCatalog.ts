import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import {
  GoalDiscoveryArea,
  GoalDiscoveryConstraint,
  GoalDiscoveryOutcome,
  GoalDiscoverySelfDescription,
  GoalDiscoveryTargetType,
  GoalDiscoveryTrigger,
  GoalDiscoveryWeeklyPreset,
  GoalOptionAccountabilityLevel,
  GoalOptionDifficultyLevel,
  GoalOptionPace,
} from '@/hooks/goalDiscovery/goalDiscovery.types';

/**
 * The option catalogs: stable enum value on one side, translation key on the
 * other. Screens render from these so the display order is defined once and the
 * label can never leak into the payload.
 */

export interface GoalDiscoveryChoice<T extends string> {
  value: T;
  labelKey: TranslationKeysType;
}

const choice = <T extends string>(
  value: T,
  labelKey: TranslationKeysType,
): GoalDiscoveryChoice<T> => ({ value, labelKey });

export const TRIGGER_CHOICES: GoalDiscoveryChoice<GoalDiscoveryTrigger>[] = [
  choice('feel_stuck', 'goal_discovery.stage1.q1_feel_stuck'),
  choice(
    'want_more_discipline',
    'goal_discovery.stage1.q1_want_more_discipline',
  ),
  choice(
    'want_to_build_something',
    'goal_discovery.stage1.q1_want_to_build_something',
  ),
  choice(
    'want_to_get_healthier',
    'goal_discovery.stage1.q1_want_to_get_healthier',
  ),
  choice(
    'want_to_make_more_money',
    'goal_discovery.stage1.q1_want_to_make_more_money',
  ),
  choice('want_a_new_hobby', 'goal_discovery.stage1.q1_want_a_new_hobby'),
  choice('want_to_feel_proud', 'goal_discovery.stage1.q1_want_to_feel_proud'),
  choice(
    'something_needs_to_change',
    'goal_discovery.stage1.q1_something_needs_to_change',
  ),
];

export const AREA_CHOICES: GoalDiscoveryChoice<GoalDiscoveryArea>[] = [
  choice('career', 'goal_discovery.stage1.q2_career'),
  choice('business', 'goal_discovery.stage1.q2_business'),
  choice('money', 'goal_discovery.stage1.q2_money'),
  choice('learning', 'goal_discovery.stage1.q2_learning'),
  choice('creativity', 'goal_discovery.stage1.q2_creativity'),
  choice('relationships', 'goal_discovery.stage1.q2_relationships'),
  choice('health', 'goal_discovery.stage1.q2_health'),
  choice('home_environment', 'goal_discovery.stage1.q2_home_environment'),
  choice('confidence', 'goal_discovery.stage1.q2_confidence'),
  choice('discipline', 'goal_discovery.stage1.q2_discipline'),
  choice('adventure_fun', 'goal_discovery.stage1.q2_adventure_fun'),
  choice('purpose_direction', 'goal_discovery.stage1.q2_purpose_direction'),
];

export const SELF_DESCRIPTION_CHOICES: GoalDiscoveryChoice<GoalDiscoverySelfDescription>[] =
  [
    choice('know_but_dont_do', 'goal_discovery.stage1.q3_know_but_dont_do'),
    choice('too_many_ideas', 'goal_discovery.stage1.q3_too_many_ideas'),
    choice(
      'dont_know_where_to_start',
      'goal_discovery.stage1.q3_dont_know_where_to_start',
    ),
    choice('start_and_quit', 'goal_discovery.stage1.q3_start_and_quit'),
    choice(
      'fine_but_want_harder_target',
      'goal_discovery.stage1.q3_fine_but_want_harder_target',
    ),
    choice('need_a_win', 'goal_discovery.stage1.q3_need_a_win'),
  ];

export const OUTCOME_CHOICES: GoalDiscoveryChoice<GoalDiscoveryOutcome>[] = [
  choice('build_confidence', 'goal_discovery.stage1.q6_build_confidence'),
  choice('create_income', 'goal_discovery.stage1.q6_create_income'),
  choice('reduce_stress', 'goal_discovery.stage1.q6_reduce_stress'),
  choice('build_discipline', 'goal_discovery.stage1.q6_build_discipline'),
  choice('learn_useful_skill', 'goal_discovery.stage1.q6_learn_useful_skill'),
  choice(
    'create_something_tangible',
    'goal_discovery.stage1.q6_create_something_tangible',
  ),
  choice(
    'become_more_interesting',
    'goal_discovery.stage1.q6_become_more_interesting',
  ),
  choice('fix_ignored_problem', 'goal_discovery.stage1.q6_fix_ignored_problem'),
  choice(
    'prove_follow_through',
    'goal_discovery.stage1.q6_prove_follow_through',
  ),
  choice('improve_health', 'goal_discovery.stage1.q6_improve_health'),
];

export const TARGET_TYPE_CHOICES: GoalDiscoveryChoice<GoalDiscoveryTargetType>[] =
  [
    choice('easy_win', 'goal_discovery.stage1.q7_easy_win'),
    choice('steady_habit', 'goal_discovery.stage1.q7_steady_habit'),
    choice('serious_challenge', 'goal_discovery.stage1.q7_serious_challenge'),
    choice(
      'skill_building_project',
      'goal_discovery.stage1.q7_skill_building_project',
    ),
    choice(
      'money_making_project',
      'goal_discovery.stage1.q7_money_making_project',
    ),
    choice('life_cleanup', 'goal_discovery.stage1.q7_life_cleanup'),
    choice('new_experience', 'goal_discovery.stage1.q7_new_experience'),
    choice('open_to_best_fit', 'goal_discovery.stage1.q7_open_to_best_fit'),
  ];

/**
 * Constraint order matters: "Other" and "No major constraints right now" are
 * rendered last because they behave differently from the rest ("Other" reveals a
 * required detail field, "No major constraints" clears everything else).
 */
export const CONSTRAINT_CHOICES: GoalDiscoveryChoice<GoalDiscoveryConstraint>[] =
  [
    choice('limited_time', 'goal_discovery.stage2.constraint_limited_time'),
    choice('limited_budget', 'goal_discovery.stage2.constraint_limited_budget'),
    choice('low_energy', 'goal_discovery.stage2.constraint_low_energy'),
    choice(
      'lack_of_experience',
      'goal_discovery.stage2.constraint_lack_of_experience',
    ),
    choice(
      'motivation_consistency',
      'goal_discovery.stage2.constraint_motivation_consistency',
    ),
    choice(
      'overthinking_procrastination',
      'goal_discovery.stage2.constraint_overthinking_procrastination',
    ),
    choice(
      'privacy_concerns',
      'goal_discovery.stage2.constraint_privacy_concerns',
    ),
    choice(
      'need_accountability',
      'goal_discovery.stage2.constraint_need_accountability',
    ),
    choice(
      'need_beginner_friendly_steps',
      'goal_discovery.stage2.constraint_need_beginner_friendly_steps',
    ),
    choice(
      'need_flexibility',
      'goal_discovery.stage2.constraint_need_flexibility',
    ),
    choice(
      'need_simplicity',
      'goal_discovery.stage2.constraint_need_simplicity',
    ),
    choice(
      'physical_limitations',
      'goal_discovery.stage2.constraint_physical_limitations',
    ),
    choice(
      'equipment_tools_space_access',
      'goal_discovery.stage2.constraint_equipment_tools_space_access',
    ),
    choice('other', 'goal_discovery.stage2.constraint_other'),
    choice(
      'no_major_constraints',
      'goal_discovery.stage2.constraint_no_major_constraints',
    ),
  ];

export const WEEKLY_PRESET_CHOICES: GoalDiscoveryChoice<GoalDiscoveryWeeklyPreset>[] =
  [
    choice('ten_minutes_day', 'goal_discovery.stage2.weekly_ten_minutes_day'),
    choice(
      'thirty_minutes_day',
      'goal_discovery.stage2.weekly_thirty_minutes_day',
    ),
    choice(
      'two_to_three_sessions_week',
      'goal_discovery.stage2.weekly_two_to_three_sessions_week',
    ),
    choice(
      'four_to_six_hours_week',
      'goal_discovery.stage2.weekly_four_to_six_hours_week',
    ),
    choice(
      'seven_to_ten_hours_week',
      'goal_discovery.stage2.weekly_seven_to_ten_hours_week',
    ),
    choice(
      'ten_plus_hours_week',
      'goal_discovery.stage2.weekly_ten_plus_hours_week',
    ),
    choice('custom', 'goal_discovery.stage2.weekly_custom'),
  ];

/** Rank labels are product-controlled, never taken from the model. */
export const RANK_LABEL_KEYS: Record<number, TranslationKeysType> = {
  1: 'goal_discovery.options.rank_1',
  2: 'goal_discovery.options.rank_2',
  3: 'goal_discovery.options.rank_3',
};

export const PACE_LABEL_KEYS: Record<GoalOptionPace, TranslationKeysType> = {
  focused: 'goal_discovery.options.pace_focused',
  steady: 'goal_discovery.options.pace_steady',
  light: 'goal_discovery.options.pace_light',
};

export const DIFFICULTY_LABEL_KEYS: Record<
  GoalOptionDifficultyLevel,
  TranslationKeysType
> = {
  starter: 'goal_discovery.options.difficulty_starter',
  moderate: 'goal_discovery.options.difficulty_moderate',
  demanding: 'goal_discovery.options.difficulty_demanding',
  intense: 'goal_discovery.options.difficulty_intense',
};

export const ACCOUNTABILITY_LABEL_KEYS: Record<
  GoalOptionAccountabilityLevel,
  TranslationKeysType
> = {
  low: 'goal_discovery.options.accountability_low',
  moderate: 'goal_discovery.options.accountability_moderate',
  high: 'goal_discovery.options.accountability_high',
};

/** Pace lanes always render in descending intensity. */
export const PACE_ORDER: GoalOptionPace[] = ['focused', 'steady', 'light'];
