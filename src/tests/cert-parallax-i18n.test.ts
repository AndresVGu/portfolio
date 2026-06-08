// Feature: certificate-parallax-section, Property 4: i18n completeness
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getI18N } from '@/i18n';

describe('Certificate Parallax — Property 4: i18n Completeness', () => {
  it('every locale and certificate index has all required non-empty fields', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'es', 'fr'),
        fc.integer({ min: 0, max: 3 }),
        (locale, certIndex) => {
          const i18n = getI18N({ currentLocale: locale });
          const cert = i18n.CERTIFICATES[certIndex];
          const section = i18n.CERT_SECTION;

          // Certificate fields
          expect(cert).toBeDefined();
          expect(cert.title.length).toBeGreaterThan(0);
          expect(cert.issuer.length).toBeGreaterThan(0);
          expect(cert.description.length).toBeGreaterThan(0);
          expect(cert.link.length).toBeGreaterThan(0);
          expect(cert.credential.length).toBeGreaterThan(0);

          // CERT_SECTION fields
          expect(section.modalLabel.length).toBeGreaterThan(0);
          expect(section.close.length).toBeGreaterThan(0);
          expect(section.verify.length).toBeGreaterThan(0);
          expect(section.copyId.length).toBeGreaterThan(0);
          expect(section.copied.length).toBeGreaterThan(0);
          expect(section.copyError.length).toBeGreaterThan(0);
          expect(section.toastCopied.length).toBeGreaterThan(0);
          expect(section.toastError.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
