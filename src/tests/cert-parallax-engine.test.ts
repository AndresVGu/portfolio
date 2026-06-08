// Feature: certificate-parallax-section — Engine Property Tests
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getStaggerConfig,
  interpolateTransform,
  computeGlow,
  isHoverEnabled,
} from '@/scripts/cert-parallax-engine';

describe('Certificate Parallax Engine — Property 1: Interpolation Correctness', () => {
  it('opacity=0 and initial scale before staggerStart, opacity=1 and final scale after staggerEnd, intermediate values in between', () => {
    const configs = getStaggerConfig();

    fc.assert(
      fc.property(
        fc.double({ min: -0.5, max: 2.0, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 0, max: 3 }),
        (progress, certIndex) => {
          const config = configs[certIndex];
          const result = interpolateTransform(progress, config);

          if (progress <= config.staggerStart) {
            expect(result.opacity).toBe(0);
            expect(result.scale).toBeCloseTo(config.initial.scale, 5);
          } else if (progress >= config.staggerEnd) {
            expect(result.opacity).toBeCloseTo(1, 3);
            expect(result.scale).toBeCloseTo(config.final.scale, 3);
            expect(result.x).toBeCloseTo(config.final.x, 1);
            expect(result.y).toBeCloseTo(config.final.y, 1);
          } else {
            expect(result.opacity).toBeGreaterThan(0);
            expect(result.opacity).toBeLessThan(1);
            expect(result.scale).toBeGreaterThan(config.initial.scale);
            expect(result.scale).toBeLessThan(config.final.scale);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Certificate Parallax Engine — Property 2: Stagger Timing', () => {
  it('all staggerStart values are unique and all durations are equal', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const configs = getStaggerConfig();

        // Unique start points
        const starts = configs.map((c) => c.staggerStart);
        const uniqueStarts = new Set(starts);
        expect(uniqueStarts.size).toBe(starts.length);

        // Consistent duration
        const durations = configs.map((c) => c.staggerEnd - c.staggerStart);
        durations.forEach((d) => {
          expect(d).toBeCloseTo(durations[0], 5);
        });
      }),
      { numRuns: 10 }
    );
  });
});

describe('Certificate Parallax Engine — Property 3: Glow Proportionality', () => {
  it('glow is 0 before start, 1 after end, and monotonically increasing in between', () => {
    const configs = getStaggerConfig();

    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1.5, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 0, max: 3 }),
        (progress, certIndex) => {
          const config = configs[certIndex];
          const glow = computeGlow(progress, config);

          if (progress <= config.staggerStart) {
            expect(glow).toBe(0);
          } else if (progress >= config.staggerEnd) {
            expect(glow).toBeCloseTo(1, 3);
          } else {
            expect(glow).toBeGreaterThan(0);
            expect(glow).toBeLessThan(1);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('glow is monotonically non-decreasing for increasing progress', () => {
    const configs = getStaggerConfig();

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.array(
          fc.double({ min: 0, max: 1.5, noNaN: true, noDefaultInfinity: true }),
          { minLength: 2, maxLength: 20 }
        ),
        (certIndex, progressValues) => {
          const config = configs[certIndex];
          const sorted = [...progressValues].sort((a, b) => a - b);
          const glows = sorted.map((p) => computeGlow(p, config));

          for (let i = 1; i < glows.length; i++) {
            expect(glows[i]).toBeGreaterThanOrEqual(glows[i - 1] - 0.0001);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Certificate Parallax Engine — Property 6: Hover Gated on Completion', () => {
  it('hover is enabled only when progress >= staggerEnd', () => {
    const configs = getStaggerConfig();

    fc.assert(
      fc.property(
        fc.double({ min: -0.5, max: 2.0, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 0, max: 3 }),
        (progress, certIndex) => {
          const config = configs[certIndex];
          const hoverEnabled = isHoverEnabled(progress, config);

          if (progress >= config.staggerEnd) {
            expect(hoverEnabled).toBe(true);
          } else {
            expect(hoverEnabled).toBe(false);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
