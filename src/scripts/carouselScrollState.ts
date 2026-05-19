/**
 * Pure scroll-state logic for the AppleCarousel component.
 * Extracted as a standalone module so it can be unit/property tested
 * without requiring a browser or DOM environment.
 */

export interface ScrollDimensions {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}

export interface ScrollState {
  /** True when the track can scroll further to the left (scrollLeft > 0). */
  canScrollLeft: boolean;
  /**
   * True when the track can scroll further to the right.
   * The -1 tolerance avoids false positives caused by sub-pixel rendering
   * differences across browsers.
   */
  canScrollRight: boolean;
}

/**
 * Computes whether the carousel track can scroll left or right
 * based on the current scroll dimensions.
 */
export function checkScrollability(dims: ScrollDimensions): ScrollState {
  return {
    canScrollLeft: dims.scrollLeft > 0,
    canScrollRight: dims.scrollLeft + dims.clientWidth < dims.scrollWidth - 1,
  };
}
