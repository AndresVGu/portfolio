import { describe, expect, it } from 'vitest';
import { getI18N, getLocalePath } from '@/i18n';

describe('Japanese and Korean locales', () => {
  it.each([
    ['ja', '/ja', 'ホーム'],
    ['ko', '/ko', '홈'],
  ])('merges %s copy while retaining untranslated project fields', (locale, path, homeLabel) => {
    const i18n = getI18N({ currentLocale: locale });

    expect(getLocalePath(locale)).toBe(path);
    expect(i18n.NAV.home).toBe(homeLabel);
    expect(i18n.PROJECTS).toHaveLength(7);
    expect(i18n.PROJECTS[2].slug).toBe('cities-api');
    expect(i18n.PROJECTS[2].codeUrl).toBe('https://github.com/AndresVGu/Cities_Api/tree/main');
    expect(i18n.PROJECTS[2].detailDescription).toContain('RESTful web service');
  });
});
