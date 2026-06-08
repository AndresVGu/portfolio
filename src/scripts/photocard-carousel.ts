/**
 * photocard-carousel.ts
 * Animated Testimonials-style carousel with stacked photo deck + blur-in text.
 * Pure functions are exported for testability; DOM logic lives in initPhotocardCarousel().
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PhotocardData {
  src: string;
  label: string;
  description: string;
}

export interface CarouselConfig {
  autoplayInterval: number; // ms, 0 = disabled
  transitionDuration: number; // ms, default 400
}

export interface CarouselState {
  activeIndex: number;
  totalCards: number;
  autoplayTimer: ReturnType<typeof setInterval> | null;
  isPaused: boolean;
}

export interface CardStyle {
  opacity: number;
  scale: number;
  rotateY: number;
  zIndex: number;
  pointerEvents: 'auto' | 'none';
}

// ── Pure Functions ────────────────────────────────────────────────────────────

/**
 * Compute the visual style for a card based on its position relative to activeIndex.
 */
export function computeCardStyle(
  cardIndex: number,
  activeIndex: number,
  rotation: number
): CardStyle {
  if (cardIndex === activeIndex) {
    return { opacity: 1, scale: 1, rotateY: 0, zIndex: 10, pointerEvents: 'auto' };
  }
  return { opacity: 0.7, scale: 0.95, rotateY: rotation, zIndex: 1, pointerEvents: 'none' };
}

/**
 * Get the next index with wrap-around.
 */
export function getNextIndex(current: number, total: number): number {
  return (current + 1) % total;
}

/**
 * Get the previous index with wrap-around.
 */
export function getPrevIndex(current: number, total: number): number {
  return (current - 1 + total) % total;
}

/**
 * Generate a random rotateY value between -12 and 12 degrees for inactive cards.
 */
export function generateInactiveRotateY(): number {
  return Math.random() * 24 - 12;
}

/**
 * Build HTML string with staggered blur-word spans for a text string.
 */
export function buildWordSpans(text: string, baseDelay: number): string {
  return text
    .split(/\s+/)
    .filter(word => word.length > 0)
    .map(
      (word, index) =>
        `<span class="blur-word" style="animation-delay: ${index * baseDelay}s">${word}</span>`
    )
    .join(' ');
}

// ── Initialization ────────────────────────────────────────────────────────────

let cleanupFn: (() => void) | null = null;

export function initPhotocardCarousel(): void {
  // Query root element
  const root = document.querySelector<HTMLElement>('[data-photocard-carousel]');
  if (!root) return;

  // Query DOM elements
  const cards = Array.from(
    root.querySelectorAll<HTMLImageElement>('.photocard-carousel__card')
  );
  const labelEl = root.querySelector<HTMLElement>('[data-photocard-label]');
  const descriptionEl = root.querySelector<HTMLElement>('[data-photocard-description]');
  const prevBtn = root.querySelector<HTMLButtonElement>('[data-photocard-prev]');
  const nextBtn = root.querySelector<HTMLButtonElement>('[data-photocard-next]');

  if (!cards.length) return;

  // Read config from data attributes
  const autoplayInterval = parseInt(root.dataset.autoplay ?? '0', 10) || 0;

  // Initialize state
  const state: CarouselState = {
    activeIndex: 0,
    totalCards: cards.length,
    autoplayTimer: null,
    isPaused: false,
  };

  // Generate random rotations for each card
  const rotations: number[] = cards.map(() => generateInactiveRotateY());

  // ── Helper: Apply styles to all cards ────────────────────────────────────
  function applyCardStyles() {
    // Sort inactive cards by distance from active (closest first = higher z)
    const distances: { index: number; dist: number }[] = [];
    cards.forEach((_, i) => {
      if (i !== state.activeIndex) {
        const dist = Math.min(
          Math.abs(i - state.activeIndex),
          state.totalCards - Math.abs(i - state.activeIndex)
        );
        distances.push({ index: i, dist });
      }
    });
    distances.sort((a, b) => a.dist - b.dist);

    // Map: card index → layer position (1 = closest behind, 2 = next, etc.)
    const layerMap = new Map<number, number>();
    distances.forEach((d, pos) => layerMap.set(d.index, pos + 1));

    cards.forEach((card, i) => {
      if (i === state.activeIndex) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1) rotate(0deg) translate(0, 0)';
        card.style.zIndex = '10';
        card.style.pointerEvents = 'auto';
        card.style.filter = '';
        card.classList.add('photocard-carousel__card--active');
        card.classList.remove('photocard-carousel__card--inactive');
      } else {
        const layer = layerMap.get(i) ?? 1;

        // Hide cards that are far from active (beyond 4 layers)
        if (layer > 4) {
          card.style.opacity = '0';
          card.style.transform = '';
          card.style.zIndex = '0';
          card.style.pointerEvents = 'none';
          card.style.filter = '';
          card.classList.remove('photocard-carousel__card--active');
          card.classList.add('photocard-carousel__card--inactive');
          return;
        }

        // Alternate sides: odd layers go right, even go left
        const side = layer % 2 === 0 ? -1 : 1;
        // Progressive rotation — cap at ±8° so cards don't spread too far
        const rotation = side * Math.min(2 + layer * 1.5, 8);
        // Horizontal offset — cap at ±12px
        const offsetX = side * Math.min(4 + layer * 2, 12);
        // Vertical shift — cap at 4px
        const offsetY = Math.min(layer * 1, 4);

        card.style.setProperty('--rotate-y', `${rotation}deg`);
        card.style.setProperty('--offset-x', `${offsetX}px`);
        card.style.setProperty('--offset-y', `${offsetY}px`);
        card.style.opacity = '';
        card.style.transform = '';
        // Closer cards get higher z-index, but always below active (10)
        card.style.zIndex = `${Math.max(1, 8 - layer)}`;
        card.style.pointerEvents = 'none';
        card.style.filter = '';
        card.classList.remove('photocard-carousel__card--active');
        card.classList.add('photocard-carousel__card--inactive');
      }
    });
  }

  // ── Helper: Update text panel ────────────────────────────────────────────
  function updateTextPanel() {
    const activeCard = cards[state.activeIndex];
    if (!activeCard) return;

    const label = activeCard.dataset.label ?? '';
    const description = activeCard.dataset.description ?? '';

    if (labelEl) {
      labelEl.textContent = label;
    }
    if (descriptionEl) {
      descriptionEl.innerHTML = buildWordSpans(description, 0.02);
    }
  }

  // ── Helper: Navigate to a specific index ─────────────────────────────────
  function navigateTo(newIndex: number) {
    const prevIndex = state.activeIndex;
    state.activeIndex = newIndex;
    // Only regenerate rotation for the card that was just active (not all)
    rotations[prevIndex] = generateInactiveRotateY();
    applyCardStyles();
    updateTextPanel();
  }

  // ── Helper: Go next ──────────────────────────────────────────────────────
  function goNext() {
    navigateTo(getNextIndex(state.activeIndex, state.totalCards));
  }

  // ── Helper: Go prev ──────────────────────────────────────────────────────
  function goPrev() {
    navigateTo(getPrevIndex(state.activeIndex, state.totalCards));
  }

  // ── Autoplay ─────────────────────────────────────────────────────────────
  function startAutoplay() {
    if (autoplayInterval <= 0) return;
    stopAutoplay();
    state.autoplayTimer = setInterval(() => {
      if (!state.isPaused) {
        goNext();
      }
    }, autoplayInterval);
  }

  function stopAutoplay() {
    if (state.autoplayTimer !== null) {
      clearInterval(state.autoplayTimer);
      state.autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    if (autoplayInterval > 0 && !state.isPaused) {
      startAutoplay();
    }
  }

  // ── Modal Integration ────────────────────────────────────────────────────
  function openModal(src: string, label: string) {
    // Pause autoplay when modal opens
    state.isPaused = true;
    stopAutoplay();

    // Use the existing gallery modal elements directly
    const backdrop = document.getElementById('gallery-modal-backdrop');
    const modalImg = document.getElementById('gallery-modal-img') as HTMLImageElement | null;
    const modalLabel = document.getElementById('gallery-modal-label');
    const modalCard = document.getElementById('gallery-modal-card');
    const modalInner = document.getElementById('gallery-modal-inner') as HTMLElement | null;

    if (!backdrop || !modalImg || !modalLabel) return;

    modalImg.src = src;
    modalLabel.textContent = label;

    // Reset flip state
    if (modalInner) {
      modalInner.style.transform = '';
      modalInner.style.transition = 'transform 0s';
    }

    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');

    if (modalCard) {
      modalCard.classList.remove('pop');
      void (modalCard as HTMLElement).offsetWidth;
      modalCard.classList.add('pop');
    }

    document.body.style.overflow = 'hidden';
  }

  // Watch for modal close to resume autoplay
  function onModalClose() {
    state.isPaused = false;
    resetAutoplay();
  }

  // Observe modal backdrop for close (class changes)
  const backdrop = document.getElementById('gallery-modal-backdrop');
  let modalObserver: MutationObserver | null = null;

  if (backdrop) {
    modalObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (backdrop.classList.contains('hidden') && state.isPaused) {
            onModalClose();
          }
        }
      }
    });
    modalObserver.observe(backdrop, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Event Listeners ──────────────────────────────────────────────────────
  function onPrevClick() {
    goPrev();
    resetAutoplay();
  }

  function onNextClick() {
    goNext();
    resetAutoplay();
  }

  function onCardClick(e: Event) {
    const target = e.currentTarget as HTMLElement;
    const index = parseInt(target.dataset.cardIndex ?? '0', 10);
    if (index === state.activeIndex) {
      const src = (target as HTMLImageElement).src || target.dataset.src || '';
      const label = target.dataset.label ?? '';
      openModal(src, label);
    }
  }

  prevBtn?.addEventListener('click', onPrevClick);
  nextBtn?.addEventListener('click', onNextClick);

  cards.forEach(card => {
    card.addEventListener('click', onCardClick);
  });

  // ── Initial State ────────────────────────────────────────────────────────
  applyCardStyles();
  updateTextPanel();
  startAutoplay();

  // ── Cleanup function for View Transitions ────────────────────────────────
  cleanupFn = () => {
    stopAutoplay();
    modalObserver?.disconnect();
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    cards.forEach(card => {
      card.removeEventListener('click', onCardClick);
    });
  };
}

// ── Lifecycle Events ──────────────────────────────────────────────────────────

document.addEventListener('astro:before-swap', () => {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
});
