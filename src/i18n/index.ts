import english from '@/i18n/en.json';
import spanish from '@/i18n/es.json';
import french from '@/i18n/fr.json';
import japanese from '@/i18n/ja.json';
import korean from '@/i18n/ko.json';

export type I18nKeys = typeof english;

const LANG = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
  JAPANESE: 'ja',
  KOREAN: 'ko',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep merges objects and object arrays so untranslated copy falls back to English. */
function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key in override) {
    const baseVal = base[key];
    const overrideVal = override[key];
    if (
      Array.isArray(baseVal) &&
      Array.isArray(overrideVal) &&
      baseVal.every(isRecord) &&
      overrideVal.every(isRecord)
    ) {
      result[key] = baseVal.map((item, index) => {
        const localizedItem = overrideVal[index];
        return isRecord(localizedItem)
          ? deepMerge(item, localizedItem)
          : item;
      }) as T[typeof key];
    } else if (
      isRecord(overrideVal) &&
      isRecord(baseVal)
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
  if (currentLocale === LANG.JAPANESE) return deepMerge(english, japanese as Partial<I18nKeys>);
  if (currentLocale === LANG.KOREAN) return deepMerge(english, korean as Partial<I18nKeys>);
  return english;
};

/** Returns the base path prefix for a given locale (e.g. '' for en, '/es' for es). */
export const getLocalePath = (locale: string) => {
  if (locale === LANG.SPANISH) return '/es';
  if (locale === LANG.FRENCH) return '/fr';
  if (locale === LANG.JAPANESE) return '/ja';
  if (locale === LANG.KOREAN) return '/ko';
  return '';
};
