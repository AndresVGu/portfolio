// cert-parallax-engine.ts — Pure logic for certificate parallax animations
// No DOM dependencies — fully testable with property-based tests

export interface CertPosition {
  x: number;       // translateX in px
  y: number;       // translateY in px
  rotate: number;  // rotation in degrees
  scale: number;   // scale factor
}

export interface CertConfig {
  initial: CertPosition;
  final: CertPosition;
  staggerStart: number;  // progress (0-1) where animation begins
  staggerEnd: number;    // progress (0-1) where animation ends
}

export interface TransformResult {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  glowIntensity: number; // 0-1
}

/**
 * Stagger configuration for 4 certificates.
 * Each certificate has a different start point to create
 * the cinematic staggered emergence effect.
 * Positions are relative to the center of the viewport (where laptop sits).
 */
export function getStaggerConfig(): CertConfig[] {
  const DURATION = 0.30; // each certificate animates over 30% of total range
  return [
    {
      initial: { x: 0, y: 0, rotate: 0, scale: 0.3 },
      final:   { x: -320, y: -60, rotate: -6, scale: 1 },
      staggerStart: 0.10,
      staggerEnd: 0.10 + DURATION,
    },
    {
      initial: { x: 0, y: 0, rotate: 0, scale: 0.3 },
      final:   { x: 300, y: -40, rotate: 5, scale: 1 },
      staggerStart: 0.25,
      staggerEnd: 0.25 + DURATION,
    },
    {
      initial: { x: 0, y: 0, rotate: 0, scale: 0.3 },
      final:   { x: -280, y: 100, rotate: 4, scale: 1 },
      staggerStart: 0.40,
      staggerEnd: 0.40 + DURATION,
    },
    {
      initial: { x: 0, y: 0, rotate: 0, scale: 0.3 },
      final:   { x: 280, y: 80, rotate: -3, scale: 1 },
      staggerStart: 0.55,
      staggerEnd: 0.55 + DURATION,
    },
  ];
}

/**
 * Cubic ease-out easing function.
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Interpolates the transformation of a certificate given global scroll progress.
 *
 * @param progress - Scroll progress of the section (0 to 1+)
 * @param config - Certificate configuration (initial/final positions, stagger)
 * @returns Interpolated transform values
 */
export function interpolateTransform(
  progress: number,
  config: CertConfig
): TransformResult {
  // Clamp progress to the certificate's range
  const localProgress = Math.max(0, Math.min(1,
    (progress - config.staggerStart) / (config.staggerEnd - config.staggerStart)
  ));

  const easedProgress = easeOutCubic(localProgress);

  const lerp = (a: number, b: number) => a + (b - a) * easedProgress;

  return {
    x: lerp(config.initial.x, config.final.x),
    y: lerp(config.initial.y, config.final.y),
    rotate: lerp(config.initial.rotate, config.final.rotate),
    scale: lerp(config.initial.scale, config.final.scale),
    opacity: easedProgress,
    glowIntensity: easedProgress,
  };
}

/**
 * Computes glow intensity for a certificate given its scroll progress.
 *
 * @param progress - Global scroll progress (0-1)
 * @param config - Certificate configuration
 * @returns Glow intensity (0-1)
 */
export function computeGlow(progress: number, config: CertConfig): number {
  const localProgress = Math.max(0, Math.min(1,
    (progress - config.staggerStart) / (config.staggerEnd - config.staggerStart)
  ));
  return easeOutCubic(localProgress);
}

/**
 * Generates a CSS drop-shadow string based on glow intensity.
 */
export function glowToCSS(intensity: number): string {
  const blur = Math.round(intensity * 20);
  return `drop-shadow(0 0 ${blur}px rgba(59, 130, 246, ${(intensity * 0.6).toFixed(2)}))`;
}

/**
 * Determines if hover effect should be enabled for a certificate.
 * Hover is only active when the certificate has fully completed its emergence animation.
 *
 * @param progress - Global scroll progress (0-1+)
 * @param config - Certificate configuration
 * @returns true if hover should be enabled
 */
export function isHoverEnabled(progress: number, config: CertConfig): boolean {
  return progress >= config.staggerEnd;
}
