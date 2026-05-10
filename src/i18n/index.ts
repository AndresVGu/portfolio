import english from '@/i18n/en.json';
import spanish from '@/i18n/es.json';
import french from '@/i18n/fr.json';

export type I18nKeys = typeof english;

const LANG = {
  ENGLISH: 'en',
  SPANISH: 'es',
  FRENCH: 'fr',
} as const;

export const getI18N = ({
  currentLocale = 'en',
}: {
  currentLocale: string | undefined;
}): I18nKeys => {
  if (currentLocale === LANG.SPANISH) return { ...english, ...spanish } as I18nKeys;
  if (currentLocale === LANG.FRENCH) return { ...english, ...french } as I18nKeys;
  return english;
};

/** Returns the base path prefix for a given locale (e.g. '' for en, '/es' for es) */
export const getLocalePath = (locale: string) => {
  if (locale === LANG.SPANISH) return '/es';
  if (locale === LANG.FRENCH) return '/fr';
  return '';
};
