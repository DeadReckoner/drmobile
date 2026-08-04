import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import { Href } from 'expo-router';

/**
 * The Templates library catalog.
 *
 * Empty on purpose: this ticket ships the library surface, not any template.
 * A later ticket adds its first entry (e.g. a Morning Routine) here, and the
 * Templates screen lists it without being rebuilt. While the catalog is empty
 * the screen renders its intentional empty state — no category sections, no
 * placeholder cards.
 */

/** The library will hold both kinds; neither implies the other's flow. */
export type TemplateKind = 'routine' | 'roadmap';

export interface TemplateCatalogEntry {
  /** Stable identifier — never derived from display copy. */
  id: string;
  kind: TemplateKind;
  titleKey: TranslationKeysType;
  descriptionKey: TranslationKeysType;
  /** The route that opens this template's customization flow. */
  route: Href;
}

export const TEMPLATES_CATALOG: TemplateCatalogEntry[] = [];

/** The screen shows its empty state when there is nothing to list. */
export const isTemplatesCatalogEmpty = (
  catalog: TemplateCatalogEntry[] = TEMPLATES_CATALOG,
): boolean => catalog.length === 0;
