// cert-parallax-particles.ts — Lightweight CSS-based particle system

export interface Particle {
  element: HTMLElement;
  startTime: number;
  duration: number;
  active: boolean;
}

export class ParticlePool {
  private particles: Particle[] = [];
  private container: HTMLElement;
  private readonly MAX_PARTICLES = 20;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  get activeCount(): number {
    return this.particles.filter(p => p.active).length;
  }

  /**
   * Generates a new particle if limit is not exceeded.
   * Returns true if spawned, false if max reached.
   */
  spawn(originX: number, originY: number): boolean {
    if (this.activeCount >= this.MAX_PARTICLES) return false;

    const el = document.createElement('div');
    const size = 3 + Math.random() * 5; // 3-8px
    const duration = 1000 + Math.random() * 1500; // 1-2.5s
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 80;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // Neutral colors with low opacity
    const colors = [
      'rgba(59, 130, 246, 0.4)',
      'rgba(147, 197, 253, 0.35)',
      'rgba(196, 181, 253, 0.3)',
      'rgba(255, 255, 255, 0.3)',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    el.style.cssText = `
      position: absolute;
      left: ${originX}px;
      top: ${originY}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      will-change: transform, opacity;
      animation: cert-particle ${duration}ms ease-out forwards;
      --dx: ${dx}px;
      --dy: ${dy}px;
    `;

    this.container.appendChild(el);

    const particle: Particle = {
      element: el,
      startTime: Date.now(),
      duration,
      active: true,
    };

    this.particles.push(particle);
    return true;
  }

  /**
   * Cleans up particles that have completed their animation.
   */
  cleanup(): void {
    const now = Date.now();
    this.particles = this.particles.filter(p => {
      if (p.active && now - p.startTime > p.duration) {
        p.element.remove();
        p.active = false;
        return false;
      }
      return p.active;
    });
  }

  /**
   * Stops all particles with fade-out.
   */
  stopAll(): void {
    this.particles.forEach(p => {
      if (p.active) {
        p.element.style.opacity = '0';
        p.element.style.transition = 'opacity 300ms';
        setTimeout(() => p.element.remove(), 300);
        p.active = false;
      }
    });
    this.particles = [];
  }
}
