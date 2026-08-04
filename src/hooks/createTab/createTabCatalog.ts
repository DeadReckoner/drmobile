import { GOAL_DISCOVERY_ROUTES } from '@/hooks/goalDiscovery/draft';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';

/**
 * The Create page as plain data: three sections, six creation paths.
 *
 * The page renders exactly this, in this order. Keeping the hierarchy here
 * rather than inline in JSX lets tests pin the section order, the stable
 * option ids and each option's resting destination without a component
 * renderer, which this repository's Jest setup (node, .ts only) cannot run.
 *
 * "Resting destination" because two options do more than navigate: Build with
 * AI may first offer to resume a draft, and Goal Discovery resolves its entry
 * through `resolveEntry`. Both still land inside the route named here.
 */

/** Stable identifiers — analytics/tests key off these, never localized copy. */
export type CreateOptionId =
  | 'build_with_ai'
  | 'goal_discovery'
  | 'templates'
  | 'build_a_roadmap'
  | 'import_plan'
  | 'add_task_or_habit';

export type CreateSectionId = 'ai_guided' | 'starting_points' | 'quick_add';

/**
 * Where each option opens. Goal Discovery reuses the route table owned by
 * `draft.ts` so the two can never drift apart; its dynamic resume behaviour
 * stays inside GOAL_DISCOVERY_ROUTES as well.
 */
export const CREATE_OPTION_ROUTES = {
  build_with_ai: '/roadmap/create-ai-roadmap',
  goal_discovery: GOAL_DISCOVERY_ROUTES.stage1,
  templates: '/templates',
  build_a_roadmap: '/roadmap/add-edit-custom-roadmap',
  import_plan: '/coming-soon',
  add_task_or_habit: '/habits/add-edit-habits-task',
} as const;

export type CreateOptionRoute =
  (typeof CREATE_OPTION_ROUTES)[keyof typeof CREATE_OPTION_ROUTES];

export interface CreateOption {
  id: CreateOptionId;
  titleKey: TranslationKeysType;
  descriptionKey: TranslationKeysType;
  route: CreateOptionRoute;
  /** 'ai' gets the purple AI icon treatment; 'standard' the plain accent. */
  treatment: 'ai' | 'standard';
}

export interface CreateSection {
  id: CreateSectionId;
  labelKey: TranslationKeysType;
  options: CreateOption[];
}

export const CREATE_PAGE_SECTIONS: CreateSection[] = [
  {
    id: 'ai_guided',
    labelKey: 'tabs.create_tab.section_ai_guided',
    options: [
      {
        id: 'build_with_ai',
        titleKey: 'tabs.create_tab.build_with_ai',
        descriptionKey: 'tabs.create_tab.build_with_ai_desc',
        route: CREATE_OPTION_ROUTES.build_with_ai,
        treatment: 'ai',
      },
      // Deliberately adjacent to Build with AI: that one is for a KNOWN goal,
      // this one for finding a goal. They form a pair.
      {
        id: 'goal_discovery',
        titleKey: 'tabs.create_tab.goal_discovery',
        descriptionKey: 'tabs.create_tab.goal_discovery_desc',
        route: CREATE_OPTION_ROUTES.goal_discovery,
        treatment: 'ai',
      },
    ],
  },
  {
    id: 'starting_points',
    labelKey: 'tabs.create_tab.section_starting_points',
    options: [
      // Templates will hold both roadmap AND routine templates, which is why
      // it sits in this general section rather than under either feature.
      {
        id: 'templates',
        titleKey: 'tabs.create_tab.templates',
        descriptionKey: 'tabs.create_tab.templates_desc',
        route: CREATE_OPTION_ROUTES.templates,
        treatment: 'standard',
      },
      {
        id: 'build_a_roadmap',
        titleKey: 'tabs.create_tab.build_a_roadmap',
        descriptionKey: 'tabs.create_tab.build_a_roadmap_desc',
        route: CREATE_OPTION_ROUTES.build_a_roadmap,
        treatment: 'standard',
      },
      {
        id: 'import_plan',
        titleKey: 'tabs.create_tab.import_plan',
        descriptionKey: 'tabs.create_tab.import_plan_desc',
        route: CREATE_OPTION_ROUTES.import_plan,
        treatment: 'standard',
      },
    ],
  },
  {
    id: 'quick_add',
    labelKey: 'tabs.create_tab.section_quick_add',
    options: [
      {
        id: 'add_task_or_habit',
        titleKey: 'tabs.create_tab.add_task_or_habit',
        descriptionKey: 'tabs.create_tab.add_task_or_habit_desc',
        route: CREATE_OPTION_ROUTES.add_task_or_habit,
        treatment: 'standard',
      },
    ],
  },
];

export const allCreateOptions = (): CreateOption[] =>
  CREATE_PAGE_SECTIONS.flatMap((section) => section.options);
