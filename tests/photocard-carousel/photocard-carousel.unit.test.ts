/**
 * photocard-carousel.unit.test.ts
 * Example-based unit tests for DOM integration behaviors.
 *
 * Validates: Requirements 4.5, 6.3, 9.3
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { initPhotocardCarousel } from '@/scripts/photocard-carousel';

const CAROUSEL_HTML = `
<div data-photocard-carousel data-autoplay="0">
  <div class="photocard-carousel__layout">
    <div class="photocard-carousel__deck">
      <div class="photocard-carousel__deck-container">
        <img class="photocard-carousel__card photocard-carousel__card--active" data-card-index="0" data-label="Card 0" data-description="Description zero" src="/test/0.webp" alt="Card 0" />
        <img class="photocard-carousel__card photocard-carousel__card--inactive" data-card-index="1" data-label="Card 1" data-description="Description one" src="/test/1.webp" alt="Card 1" />
        <img class="photocard-carousel__card photocard-carousel__card--inactive" data-card-index="2" data-label="Card 2" data-description="Description two" src="/test/2.webp" alt="Card 2" />
      </div>
      <div class="photocard-carousel__nav">
        <button data-photocard-prev aria-label="Previous"></button>
        <button data-photocard-next aria-label="Next"></button>
      </div>
    </div>
    <div class="photocard-carousel__text">
      <h3 data-photocard-label>Card 0</h3>
      <p data-photocard-description>Description zero</p>
    </div>
  </div>
</div>
`;

describe('PhotocardCarousel – DOM integration', () => {
  beforeEach(() => {
    document.body.innerHTML = CAROUSEL_HTML;
  });

  /**
   * Validates: Requirement 4.5
   * WHEN a navigation arrow is activated, THE Carousel SHALL update both the
   * Photo_Deck and the Text_Panel simultaneously.
   */
  test('text panel updates label and description on navigation', () => {
    initPhotocardCarousel();

    const nextBtn = document.querySelector<HTMLButtonElement>('[data-photocard-next]')!;
    nextBtn.click();

    const labelEl = document.querySelector('[data-photocard-label]')!;
    const descriptionEl = document.querySelector('[data-photocard-description]')!;

    expect(labelEl.textContent).toBe('Card 1');
    // Description is rendered via buildWordSpans — check spans with blur-word class
    const spans = descriptionEl.querySelectorAll('.blur-word');
    expect(spans.length).toBeGreaterThan(0);
    // The combined text content of spans should match "Description one"
    const textContent = Array.from(spans).map(s => s.textContent).join(' ');
    expect(textContent).toBe('Description one');
  });

  /**
   * Validates: Requirement 9.3
   * IF the carousel DOM elements are not found during initialization,
   * THEN THE Carousel script SHALL exit gracefully without errors.
   */
  test('script exits gracefully when DOM elements are missing', () => {
    document.body.innerHTML = '';

    // Should not throw
    expect(() => initPhotocardCarousel()).not.toThrow();
  });

  /**
   * Validates: Requirement 4.4
   * THE Navigation_Arrows SHALL wrap around (last → first, first → last)
   * to allow continuous browsing.
   */
  test('navigation wraps from last to first and first to last', () => {
    initPhotocardCarousel();

    const prevBtn = document.querySelector<HTMLButtonElement>('[data-photocard-prev]')!;
    const nextBtn = document.querySelector<HTMLButtonElement>('[data-photocard-next]')!;
    const labelEl = document.querySelector('[data-photocard-label]')!;

    // Starting at index 0, click prev → should wrap to last card (index 2)
    prevBtn.click();
    expect(labelEl.textContent).toBe('Card 2');

    // Now at index 2, click next → should wrap to first card (index 0)
    nextBtn.click();
    expect(labelEl.textContent).toBe('Card 0');
  });
});
