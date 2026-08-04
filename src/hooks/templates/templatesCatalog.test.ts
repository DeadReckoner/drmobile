import {
  isTemplatesCatalogEmpty,
  TemplateCatalogEntry,
  TEMPLATES_CATALOG,
} from '@/hooks/templates/templatesCatalog';
import en from '@/lib/localization/translations/en.json';
import es from '@/lib/localization/translations/es.json';
import fr from '@/lib/localization/translations/fr.json';

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

describe('templates catalog', () => {
  // No template ships in this ticket, so the screen must land on its empty
  // state — and with zero entries there is nothing to group, so no empty
  // Roadmaps/Routines sections can render either.
  it('is empty until a later ticket adds the first template', () => {
    expect(TEMPLATES_CATALOG).toEqual([]);
    expect(isTemplatesCatalogEmpty()).toBe(true);
  });

  it('stops reporting empty once an entry exists', () => {
    const entry: TemplateCatalogEntry = {
      id: 'sample',
      kind: 'routine',
      titleKey: 'templates.header',
      descriptionKey: 'templates.intro',
      route: '/templates',
    };
    expect(isTemplatesCatalogEmpty([entry])).toBe(false);
  });

  // Compile-time guarantee that the catalog is ready for both planned kinds:
  // if either literal stops satisfying TemplateKind this test stops compiling.
  it('supports both routine and roadmap template kinds', () => {
    const kinds: TemplateCatalogEntry['kind'][] = ['routine', 'roadmap'];
    expect(kinds).toHaveLength(2);
  });
});

describe('templates screen copy', () => {
  it.each(LOCALES)('resolves every templates key in %s', (name, dict) => {
    const keys = [
      'templates.header',
      'templates.intro',
      'templates.empty_title',
      'templates.empty_description',
    ];
    const missing = keys.filter((key) => typeof lookup(dict, key) !== 'string');
    expect({ locale: name, missing }).toEqual({ locale: name, missing: [] });
  });

  it('uses the exact English copy the product specifies', () => {
    const dict = en as unknown as Dict;
    expect(lookup(dict, 'templates.header')).toBe('Templates');
    expect(lookup(dict, 'templates.intro')).toBe(
      'Start with a ready-made roadmap or routine, then make it yours.',
    );
    expect(lookup(dict, 'templates.empty_title')).toBe(
      'Templates are coming soon',
    );
    expect(lookup(dict, 'templates.empty_description')).toBe(
      'Ready-made routines and roadmaps will appear here as they are added.',
    );
  });
});
