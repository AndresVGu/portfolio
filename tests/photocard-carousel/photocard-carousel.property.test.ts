import fc from 'fast-check';
import { describe, test, expect } from 'vitest';
import {
  computeCardStyle,
  getNextIndex,
  getPrevIndex,
  generateInactiveRotateY,
  buildWordSpans,
} from '@/scripts/photocard-carousel';

fc.configureGlobal({ numRuns: 100 });

describe('Feature: photocard-carousel', () => {
  // ── Property 1: Card style computation is correct for active vs inactive cards ──
  describe('Property 1: Card style computation', () => {
    test('active card gets correct style (opacity 1, scale 1, rotateY 0, zIndex 10, pointerEvents auto)', () => {
      /**
       * Validates: Requirements 2.1, 2.2
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // totalCards
          fc.float({ min: -10, max: 10, noNaN: true }), // rotation
          (totalCards, rotation) => {
            const activeIndex = totalCards - 1; // use a deterministic active index
            const style = computeCardStyle(activeIndex, activeIndex, rotation);
            expect(style).toEqual({
              opacity: 1,
              scale: 1,
              rotateY: 0,
              zIndex: 10,
              pointerEvents: 'auto',
            });
          }
        )
      );
    });

    test('inactive card gets correct style (opacity 0.7, scale 0.95, rotateY = rotation, zIndex 1, pointerEvents none)', () => {
      /**
       * Validates: Requirements 2.1, 2.2
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 50 }), // totalCards (at least 2 so we have inactive)
          fc.float({ min: -10, max: 10, noNaN: true }), // rotation
          (totalCards, rotation) => {
            const activeIndex = 0;
            // Test a card that is NOT the active one
            const inactiveIndex = totalCards - 1;
            const style = computeCardStyle(inactiveIndex, activeIndex, rotation);
            expect(style).toEqual({
              opacity: 0.7,
              scale: 0.95,
              rotateY: rotation,
              zIndex: 1,
              pointerEvents: 'none',
            });
          }
        )
      );
    });

    test('for any cardIndex and activeIndex, style is correctly determined', () => {
      /**
       * Validates: Requirements 2.1, 2.2
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // totalCards
          fc.float({ min: -10, max: 10, noNaN: true }), // rotation
          (totalCards, rotation) => {
            for (let activeIndex = 0; activeIndex < Math.min(totalCards, 5); activeIndex++) {
              for (let cardIndex = 0; cardIndex < Math.min(totalCards, 5); cardIndex++) {
                const style = computeCardStyle(cardIndex, activeIndex, rotation);
                if (cardIndex === activeIndex) {
                  expect(style).toEqual({
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    zIndex: 10,
                    pointerEvents: 'auto',
                  });
                } else {
                  expect(style).toEqual({
                    opacity: 0.7,
                    scale: 0.95,
                    rotateY: rotation,
                    zIndex: 1,
                    pointerEvents: 'none',
                  });
                }
              }
            }
          }
        )
      );
    });
  });

  // ── Property 4: buildWordSpans produces correct word spans with staggered delays ──
  describe('Property 4: buildWordSpans produces correct spans', () => {
    test('produces exactly N spans where N is the whitespace-separated word count', () => {
      /**
       * Validates: Requirements 3.2, 3.3
       */
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-zA-Z0-9]+$/).filter(s => s.length > 0),
            { minLength: 1, maxLength: 30 }
          ),
          fc.integer({ min: 0, max: 100 }),
          (words, baseDelayInt) => {
            const baseDelay = baseDelayInt / 100; // produce values in [0, 1]
            const text = words.join(' ');
            const html = buildWordSpans(text, baseDelay);
            const spanMatches = html.match(/<span/g) || [];
            expect(spanMatches.length).toBe(words.length);
          }
        )
      );
    });

    test('the i-th span has animation-delay of i * baseDelay seconds and contains the i-th word', () => {
      /**
       * Validates: Requirements 3.2, 3.3
       */
      fc.assert(
        fc.property(
          fc.array(
            fc.stringMatching(/^[a-zA-Z0-9]+$/).filter(s => s.length > 0),
            { minLength: 1, maxLength: 20 }
          ),
          fc.integer({ min: 1, max: 50 }),
          (words, baseDelayInt) => {
            const baseDelay = baseDelayInt / 100; // produce values in [0.01, 0.5]
            const text = words.join(' ');
            const html = buildWordSpans(text, baseDelay);
            // Parse spans using regex
            const spanRegex = /<span class="blur-word" style="animation-delay: ([^"]+)s">([^<]+)<\/span>/g;
            let match;
            let i = 0;
            while ((match = spanRegex.exec(html)) !== null) {
              const delay = parseFloat(match[1]);
              const word = match[2];
              const expectedDelay = i * baseDelay;
              expect(delay).toBeCloseTo(expectedDelay, 5);
              expect(word).toBe(words[i]);
              i++;
            }
            expect(i).toBe(words.length);
          }
        )
      );
    });
  });

  // ── Property 5: getNextIndex wraps correctly ──
  describe('Property 5: getNextIndex wraps correctly', () => {
    test('getNextIndex(current, total) === (current + 1) % total', () => {
      /**
       * Validates: Requirements 4.2, 4.4
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // total
          fc.integer({ min: 0, max: 999 }), // current (will be clamped)
          (total, current) => {
            // Ensure current is within [0, total)
            const validCurrent = current % total;
            expect(getNextIndex(validCurrent, total)).toBe((validCurrent + 1) % total);
          }
        )
      );
    });
  });

  // ── Property 6: getPrevIndex wraps correctly ──
  describe('Property 6: getPrevIndex wraps correctly', () => {
    test('getPrevIndex(current, total) === (current - 1 + total) % total', () => {
      /**
       * Validates: Requirements 4.3, 4.4
       */
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }), // total
          fc.integer({ min: 0, max: 999 }), // current (will be clamped)
          (total, current) => {
            // Ensure current is within [0, total)
            const validCurrent = current % total;
            expect(getPrevIndex(validCurrent, total)).toBe((validCurrent - 1 + total) % total);
          }
        )
      );
    });
  });

  // ── Property 7: generateInactiveRotateY stays within bounds ──
  describe('Property 7: generateInactiveRotateY stays within bounds', () => {
    test('generateInactiveRotateY() returns a number in [-12, 12]', () => {
      /**
       * Validates: Requirements 2.2
       */
      fc.assert(
        fc.property(fc.constant(null), () => {
          const val = generateInactiveRotateY();
          expect(val).toBeGreaterThanOrEqual(-12);
          expect(val).toBeLessThanOrEqual(12);
        })
      );
    });
  });
});
