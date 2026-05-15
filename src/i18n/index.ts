import english from '@/i18n/en.json';
import spanish from '@/i18n/es.json';
import french from '@/i18n/fr.json';

export type I18nKeys = typeof english;

const LANG = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
} as const;

/**
 * Deep merges two objects. Arrays are replaced (not concatenated).
 * Nested objects are recursively merged so missing keys fall back to `base`.
 */
function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      ) as T[typeof key];
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[typeof key];
    }
  }
  return result;
}

export const getI18N = ({
  currentLocale = 'en',
}: {
  currentLocale: string | undefined;
}): I18nKeys => {
  if (currentLocale === LANG.SPANISH) return deepMerge(english, spanish as Partial<I18nKeys>);
  if (currentLocale === LANG.FRENCH) return deepMerge(english, french as Partial<I18nKeys>);
  return english;
};

/** Returns the base path prefix for a given locale (e.g. '' for en, '/es' for es) */
export const getLocalePath = (locale: string) => {
  if (locale === LANG.SPANISH) return '/es';
  if (locale === LANG.FRENCH) return '/fr';
  return '';
};
