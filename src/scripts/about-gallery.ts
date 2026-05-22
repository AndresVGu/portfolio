/**
 * about-gallery.ts
 * Photo grid expand/collapse + modal with glare, foil, shine and 3-D flip.
 */

// ── Grid expand / collapse ────────────────────────────────────────────────────
export function initGalleryGrid(): void {
  const expandBtn   = document.getElementById('gallery-expand-btn');
  const galleryGrid = document.getElementById('gallery-grid');
  if (!expandBtn || !galleryGrid) return;

  const labelEl    = document.getElementById('gallery-expand-label');
  const hiddenCards = Array.from(galleryGrid.querySelectorAll<HTMLElement>('.gallery-card-hidden'));
  const total      = Number(expandBtn.dataset.total ?? 0);

  expandBtn.addEventListener('click', () => {
    const expanded = expandBtn.dataset.expanded === 'true';

    if (!expanded) {
      hiddenCards.forEach((card, i) => {
        card.style.display = '';
        card.style.animationDelay = `${i * 40}ms`;
        card.classList.add('gallery-card-reveal');
      });
      expandBtn.dataset.expanded = 'true';
      if (labelEl) labelEl.textContent = 'Show less';
    } else {
      hiddenCards.forEach(card => {
        card.style.display = 'none';
        card.classList.remove('gallery-card-reveal');
        card.style.animationDelay = '';
      });
      expandBtn.dataset.expanded = 'false';
      if (labelEl) labelEl.textContent = `See all ${total} photos`;
    }
  });
}

// ── Modal with glare / foil / shine / flip ────────────────────────────────────
export function initGalleryModal(): void {
  const gBackdrop = document.getElementById('gallery-modal-backdrop');
  const gCard     = document.getElementById('gallery-modal-card');
  const gInner    = document.getElementById('gallery-modal-inner') as HTMLElement | null;
  const gImg      = document.getElementById('gallery-modal-img')   as HTMLImageElement | null;
  const gLabel    = document.getElementById('gallery-modal-label');
  const gGlare    = document.getElementById('gallery-modal-glare') as HTMLElement | null;
  const gFoil     = document.getElementById('gallery-modal-foil')  as HTMLElement | null;
  const gShine    = document.getElementById('gallery-modal-shine') as HTMLElement | null;
  const gClose    = document.getElementById('gallery-modal-close');

  if (!gBackdrop || !gCard || !gInner || !gGlare || !gFoil || !gShine) return;

  let gFlipped  = false;
  let gFlipping = false;
  let gCurrentIdx = 0;

  function getCards() {
    return Array.from(document.querySelectorAll<HTMLElement>('#gallery-grid .gallery-card'));
  }

  function gHideLayers() {
    if (!gFlipped && !gFlipping) gInner!.style.transform = 'rotateX(0) rotateY(0)';
    gGlare!.style.opacity = '0';
    gFoil!.style.opacity  = '0';
    gShine!.style.opacity = '0';
  }

  function gShowLayers() {
    if (gFlipped || gFlipping) return;
    gGlare!.style.opacity = '0.4';
    gFoil!.style.opacity  = '0.35';
    gShine!.style.opacity = '0.6';
  }

  function gApplyGlare(px: number, py: number) {
    if (gFlipped || gFlipping) return;
    const dx = px - 50, dy = py - 50;
    gInner!.style.transform = `rotateY(${(dx / 50) * 12}deg) rotateX(${-(dy / 50) * 12}deg)`;
    gGlare!.style.background = `radial-gradient(ellipse 80% 70% at ${px}% ${py}%,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.06) 50%,transparent 75%)`;
    gFoil!.style.backgroundPosition  = `${px}% ${py}%`;
    gShine!.style.backgroundPosition = `${px * 0.7 + py * 0.3}% 50%`;
  }

  function gFlip() {
    if (gFlipping) return;
    gFlipping = true;
    gHideLayers();
    gFlipped = !gFlipped;
    gInner!.style.transition = 'transform 600ms cubic-bezier(0.4,0,0.2,1)';
    gInner!.style.transform  = gFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    setTimeout(() => { gFlipping = false; gInner!.style.transition = 'transform 0s'; }, 620);
  }

  function gOpen(img: string, label: string) {
    if (gImg)   gImg.src = img;
    if (gLabel) gLabel.textContent = label;
    gFlipped  = false;
    gFlipping = false;
    gInner!.style.transform  = '';
    gInner!.style.transition = 'transform 0s';
    gBackdrop!.classList.remove('hidden');
    gBackdrop!.classList.add('flex');
    gCard!.classList.remove('pop');
    void (gCard as HTMLElement).offsetWidth;
    gCard!.classList.add('pop');
    document.body.style.overflow = 'hidden';
    gHideLayers();
  }

  function gCloseModal() {
    gBackdrop!.classList.add('hidden');
    gBackdrop!.classList.remove('flex');
    document.body.style.overflow = '';
    gInner!.style.transform = '';
    gHideLayers();
    gFlipped = false;
  }

  function gNav(dir: number) {
    const cards = getCards();
    gCurrentIdx = ((gCurrentIdx + dir) % cards.length + cards.length) % cards.length;
    const card  = cards[gCurrentIdx];
    gOpen(card.dataset.img ?? '', card.dataset.label ?? '');
  }

  // Attach click to all cards (including hidden ones revealed later)
  document.querySelectorAll<HTMLElement>('#gallery-grid .gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      gCurrentIdx = Number(card.dataset.index ?? 0);
      gOpen(card.dataset.img ?? '', card.dataset.label ?? '');
    });
  });

  // Desktop flip on click
  gCard.addEventListener('click', e => {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const t = e.target as HTMLElement;
    if (t.closest('#gallery-modal-close') || t.closest('#gallery-modal-prev') || t.closest('#gallery-modal-next')) return;
    gFlip();
  });

  document.getElementById('gallery-modal-prev')?.addEventListener('click', () => gNav(-1));
  document.getElementById('gallery-modal-next')?.addEventListener('click', () => gNav(1));

  // Desktop hover tilt
  gCard.addEventListener('pointerenter', e => {
    if ((e as PointerEvent).pointerType === 'touch' || gFlipped) return;
    setTimeout(() => { if (!gFlipped) gInner!.style.transition = 'transform 0s'; }, 300);
    gShowLayers();
  });
  gCard.addEventListener('pointerleave', e => {
    if ((e as PointerEvent).pointerType === 'touch') return;
    if (!gFlipped && !gFlipping) gHideLayers();
  });
  gCard.addEventListener('pointermove', e => {
    const pe = e as PointerEvent;
    if (pe.pointerType === 'touch' || gFlipped || gFlipping) return;
    const rect = gCard!.getBoundingClientRect();
    gApplyGlare(
      ((pe.clientX - rect.left) / rect.width)  * 100,
      ((pe.clientY - rect.top)  / rect.height) * 100
    );
  });

  // Mobile touch
  let touchStartX = 0, touchStartY = 0, touchMoved = false;
  gCard.addEventListener('touchstart', e => {
    if (gFlipped) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved  = false;
    gInner!.style.transition = 'transform 0s';
    gShowLayers();
  }, { passive: true });

  gCard.addEventListener('touchend', () => {
    if (!gFlipped && !gFlipping) gHideLayers();
    if (!touchMoved && !gFlipping) gFlip();
  });

  gCard.addEventListener('touchmove', e => {
    if (gFlipped || gFlipping) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > 8 || dy > 8) touchMoved = true;
    e.preventDefault();
    const t    = e.touches[0];
    const rect = gCard!.getBoundingClientRect();
    gApplyGlare(
      Math.min(100, Math.max(0, ((t.clientX - rect.left) / rect.width)  * 100)),
      Math.min(100, Math.max(0, ((t.clientY - rect.top)  / rect.height) * 100))
    );
  }, { passive: false });

  gClose?.addEventListener('click', gCloseModal);
  gBackdrop.addEventListener('click', e => { if (e.target === gBackdrop) gCloseModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !gBackdrop!.classList.contains('hidden')) gCloseModal();
  });
}
