import {
  allCreateOptions,
  CREATE_OPTION_ROUTES,
  CREATE_PAGE_SECTIONS,
} from '@/hooks/createTab/createTabCatalog';
import { GOAL_DISCOVERY_ROUTES } from '@/hooks/goalDiscovery/draft';
import en from '@/lib/localization/translations/en.json';
import es from '@/lib/localization/translations/es.json';
import fr from '@/lib/localization/translations/fr.json';

/**
 * The Create page renders CREATE_PAGE_SECTIONS verbatim, so these tests pin
 * the product hierarchy — three sections, six options, in this order — and
 * each option's destination. A regression here IS a regression on the page.
 */

type Dict = Record<string, unknown>;

const lookup = (dict: Dict, path: string): unknown =>
  path.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') {
      return (node as Dict)[part];
    }
    return undefined;
  }, dict);

const LOCALES: [string, Dict][] = [
  ['en', en as unknown as Dict],
  ['es', es as unknown as Dict],
  ['fr', fr as unknown as Dict],
];

const enDict = en as unknown as Dict;

describe('create page structure', () => {
  it('has exactly three sections in the required order', () => {
    expect(CREATE_PAGE_SECTIONS.map((section) => section.id)).toEqual([
      'ai_guided',
      'starting_points',
      'quick_add',
    ]);
  });

  it('has exactly six options in the required order', () => {
    expect(allCreateOptions().map((option) => option.id)).toEqual([
      'build_with_ai',
      'goal_discovery',
      'templates',
      'build_a_roadmap',
      'import_plan',
      'add_task_or_habit',
    ]);
  });

  it('groups the options into the required sections', () => {
    const byId = Object.fromEntries(
      CREATE_PAGE_SECTIONS.map((section) => [
        section.id,
        section.options.map((option) => option.id),
      ]),
    );
    expect(byId).toEqual({
      ai_guided: ['build_with_ai', 'goal_discovery'],
      starting_points: ['templates', 'build_a_roadmap', 'import_plan'],
      quick_add: ['add_task_or_habit'],
    });
  });

  it('gives every option a unique stable id and a unique route', () => {
    const ids = allCreateOptions().map((option) => option.id);
    expect(new Set(ids).size).toBe(ids.length);

    // No option may accidentally point at another option's destination.
    const routes = allCreateOptions().map((option) => option.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('marks exactly the AI-guided pair with the AI treatment', () => {
    const aiOptions = allCreateOptions()
      .filter((option) => option.treatment === 'ai')
      .map((option) => option.id);
    expect(aiOptions).toEqual(['build_with_ai', 'goal_discovery']);
  });
});

describe('create page destinations', () => {
  it('keeps Build with AI on the existing known-goal route', () => {
    expect(CREATE_OPTION_ROUTES.build_with_ai).toBe(
      '/roadmap/create-ai-roadmap',
    );
  });

  it('keeps Goal Discovery on its form flow, never chat', () => {
    expect(CREATE_OPTION_ROUTES.goal_discovery).toBe(
      GOAL_DISCOVERY_ROUTES.stage1,
    );
    expect(
      CREATE_OPTION_ROUTES.goal_discovery.startsWith('/goal-discovery'),
    ).toBe(true);
    expect(CREATE_OPTION_ROUTES.goal_discovery).not.toBe(
      '/roadmap/create-ai-roadmap',
    );
  });

  it('sends Templates to the new library screen', () => {
    expect(CREATE_OPTION_ROUTES.templates).toBe('/templates');
  });

  it('keeps the manual, import and task/habit destinations unchanged', () => {
    expect(CREATE_OPTION_ROUTES.build_a_roadmap).toBe(
      '/roadmap/add-edit-custom-roadmap',
    );
    expect(CREATE_OPTION_ROUTES.import_plan).toBe('/coming-soon');
    expect(CREATE_OPTION_ROUTES.add_task_or_habit).toBe(
      '/habits/add-edit-habits-task',
    );
  });
});

describe('create page copy', () => {
  it.each(LOCALES)('resolves every catalog key in %s', (name, dict) => {
    const keys = [
      ...CREATE_PAGE_SECTIONS.map((section) => section.labelKey),
      ...allCreateOptions().flatMap((option) => [
        option.titleKey,
        option.descriptionKey,
      ]),
    ];
    const missing = keys.filter((key) => typeof lookup(dict, key) !== 'string');
    expect({ locale: name, missing }).toEqual({ locale: name, missing: [] });
  });

  it('uses the exact English section labels the product specifies', () => {
    expect(
      CREATE_PAGE_SECTIONS.map((section) => lookup(enDict, section.labelKey)),
    ).toEqual(['AI-Guided', 'Starting Points', 'Quick Add']);
  });

  it('uses the exact English titles and descriptions the product specifies', () => {
    const copy = allCreateOptions().map((option) => [
      lookup(enDict, option.titleKey),
      lookup(enDict, option.descriptionKey),
    ]);
    expect(copy).toEqual([
      [
        'Build with AI',
        'Tell us your goal. AI will build a step-by-step roadmap.',
      ],
      [
        'Goal Discovery',
        'Not sure what to pursue? Find a goal worth committing to.',
      ],
      [
        'Templates',
        'Start with a ready-made roadmap or routine, then make it yours.',
      ],
      [
        'Build a Roadmap',
        'Create your own roadmap, milestones, and tasks from scratch.',
      ],
      [
        'Import a Plan',
        'Turn an existing plan or program into an editable roadmap.',
      ],
      [
        'Add a Task or Habit',
        'Create a custom task or recurring habit from scratch.',
      ],
    ]);
  });
});
