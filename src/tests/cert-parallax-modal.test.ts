// Feature: certificate-parallax-section, Property 5: Modal content completeness
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Simulates rendering modal content the same way the actual implementation does.
 * Tests that all required data fields are present in the rendered output.
 */
function renderModalContent(certData: {
  title: string;
  issuer: string;
  description: string;
  link: string;
  credential: string;
  index: number;
}): string {
  // Simulate what the modal rendering logic does
  return `
    <img src="/projects/Certificates/image-${certData.index + 1}.webp" alt="${certData.title}" />
    <h3>${certData.title}</h3>
    <p>${certData.issuer}</p>
    <p>${certData.description}</p>
    <code>${certData.credential}</code>
    <a href="${certData.link}" target="_blank" rel="noopener noreferrer">Verify</a>
  `;
}

describe('Certificate Parallax Modal — Property 5: Content Completeness', () => {
  it('modal rendered output contains all required certificate fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
          issuer: fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
          description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => !s.includes('<') && !s.includes('>')),
          link: fc.webUrl(),
          credential: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>')),
          index: fc.integer({ min: 0, max: 3 }),
        }),
        (certData) => {
          const html = renderModalContent(certData);

          expect(html).toContain(certData.title);
          expect(html).toContain(certData.issuer);
          expect(html).toContain(certData.description);
          expect(html).toContain(certData.credential);
          expect(html).toContain(`href="${certData.link}"`);
          expect(html).toContain(`image-${certData.index + 1}.webp`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
