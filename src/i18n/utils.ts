/**
 * i18n utility helpers
 */

const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Extracts the locale from a URL pathname.
 * e.g. "/es/about" → "es", "/" → "en"
 */
export const getLangFromUrl = (url: URL): SupportedLocale => {
  const [, lang] = url.pathname.split('/');
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return 'en';
};

/**
 * Returns true if the given locale string is a supported locale.
 */
export const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);
