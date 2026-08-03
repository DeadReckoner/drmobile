import en from '@/lib/localization/translations/en.json';
import es from '@/lib/localization/translations/es.json';
import fr from '@/lib/localization/translations/fr.json';
import {
  AREA_CHOICES,
  CONSTRAINT_CHOICES,
  OUTCOME_CHOICES,
  SELF_DESCRIPTION_CHOICES,
  TARGET_TYPE_CHOICES,
  TRIGGER_CHOICES,
  WEEKLY_PRESET_CHOICES,
} from '@/hooks/goalDiscovery/goalDiscoveryCatalog';

// The catalogs point at translation keys by string. Nothing at compile time
// checks that those keys exist in every locale, and a missing one renders as the
// raw key path in the UI — so it is checked here instead.

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

const ALL_CHOICES = [
  ...TRIGGER_CHOICES,
  ...AREA_CHOICES,
  ...SELF_DESCRIPTION_CHOICES,
  ...OUTCOME_CHOICES,
  ...TARGET_TYPE_CHOICES,
  ...CONSTRAINT_CHOICES,
  ...WEEKLY_PRESET_CHOICES,
];

describe('goal discovery copy', () => {
  it.each(LOCALES)('has the Create page entry in %s', (_name, dict) => {
    expect(lookup(dict, 'tabs.create_tab.goal_discovery')).toBeTruthy();
    expect(lookup(dict, 'tabs.create_tab.goal_discovery_desc')).toBeTruthy();
  });

  it('uses the exact entry copy the product specifies', () => {
    expect(
      lookup(en as unknown as Dict, 'tabs.create_tab.goal_discovery'),
    ).toBe('Goal Discovery');
    expect(
      lookup(en as unknown as Dict, 'tabs.create_tab.goal_discovery_desc'),
    ).toBe(
      'Not sure where to start? Get clear on what matters and choose a target worth committing to.',
    );
  });

  it.each(LOCALES)('resolves every choice label in %s', (name, dict) => {
    const missing = ALL_CHOICES.filter(
      (choice) => typeof lookup(dict, choice.labelKey) !== 'string',
    ).map((choice) => choice.labelKey);

    expect({ locale: name, missing }).toEqual({ locale: name, missing: [] });
  });

  it.each(LOCALES)('resolves every validation message in %s', (name, dict) => {
    const errors = lookup(dict, 'goal_discovery.errors') as Dict | undefined;
    const enErrors = lookup(
      en as unknown as Dict,
      'goal_discovery.errors',
    ) as Dict;

    const missing = Object.keys(enErrors).filter(
      (key) => typeof errors?.[key] !== 'string',
    );
    expect({ locale: name, missing }).toEqual({ locale: name, missing: [] });
  });

  // The pending copy promises a notification. That promise is only kept because
  // the server writes a real in-app notification (and a push when a device token
  // exists) on completion. If that ever changes, this copy has to change too.
  it('keeps the completion-notification promise in one place', () => {
    expect(
      lookup(en as unknown as Dict, 'goal_discovery.pending.options_body'),
    ).toContain('notify you');
    expect(
      lookup(en as unknown as Dict, 'goal_discovery.pending.roadmap_body'),
    ).toContain('notify you');
  });

  it('states plainly that regeneration replaces all three options', () => {
    expect(
      lookup(
        en as unknown as Dict,
        'goal_discovery.options.regenerate_subtitle',
      ),
    ).toBe(
      'Your current 3 options will be replaced, and this may take a couple minutes.',
    );
  });
});
