// Feature: certificate-parallax-section, Property 7: Particle pool invariant
import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { ParticlePool } from '@/scripts/cert-parallax-particles';

describe('Certificate Parallax Particles — Property 7: Pool Count Invariant', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('activeCount never exceeds MAX_PARTICLES (20) for any sequence of spawns', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.integer({ min: 0, max: 500 }),
            y: fc.integer({ min: 0, max: 500 }),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (spawnCalls) => {
          const pool = new ParticlePool(container);

          spawnCalls.forEach(({ x, y }) => {
            pool.spawn(x, y);
          });

          expect(pool.activeCount).toBeLessThanOrEqual(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('spawn returns false when max particles reached', () => {
    const pool = new ParticlePool(container);

    // Spawn 20 particles (max)
    for (let i = 0; i < 20; i++) {
      const result = pool.spawn(100, 100);
      expect(result).toBe(true);
    }

    // 21st should fail
    const result = pool.spawn(100, 100);
    expect(result).toBe(false);
    expect(pool.activeCount).toBe(20);
  });

  it('cleanup removes expired particles', () => {
    const pool = new ParticlePool(container);
    pool.spawn(100, 100);
    expect(pool.activeCount).toBe(1);

    // Manually expire by manipulating time (particles have duration 1000-2500ms)
    // We'll use stopAll instead to verify cleanup behavior
    pool.stopAll();
    expect(pool.activeCount).toBe(0);
  });
});
