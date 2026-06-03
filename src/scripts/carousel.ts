/**
 * Carousel + modal interaction logic.
 * Runs on every Astro page load (including View Transitions navigations).
 */

const TECH_COLORS: Record<string, string> = {
  'astro': '#ff5a03', 'azure': '#0078d4', 'react': '#61dafb',
  'svelte': '#ff3e00', 'typescript': '#3178c6', 'javascript': '#f1e05a',
  'html': '#e34c26', 'css': '#563d7c', 'tailwind': '#38bdf8',
  'sql': '#e57373', 'sqlite': '#003b57', 'bootstrap': '#7952b3',
  'c#': '#178600', '.net': '#512bd4', 'asp.net': '#512bd4',
  'entity framework': '#512bd4', 'swagger': '#85ea2d',
  'python': '#3572A5', 'bash': '#89e051', 'linux': '#fcc624',
  'ubuntu': '#e95420', 'php': '#4F5D95', 'wordpress': '#21759b',
  'mysql': '#4479a1', 'github': '#fff', 'localstorage': '#f1e05a',
};

function getTechColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(TECH_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#9ca3af';
}

document.addEventListener('astro:page-load', () => {
  document.querySelectorAll<HTMLElement>('[data-carousel-root]').forEach(initCarousel);
});

function initCarousel(root: HTMLElement) {
  // --- Element refs ---
  const track       = root.querySelector<HTMLElement>('[data-carousel-track]');
  const btnLeft     = root.querySelector<HTMLButtonElement>('[data-carousel-btn-left]');
  const btnRight    = root.querySelector<HTMLButtonElement>('[data-carousel-btn-right]');
  const modal       = root.querySelector<HTMLElement>('[data-carousel-modal]');
  const backdrop    = root.querySelector<HTMLElement>('[data-carousel-backdrop]');
  const modalContent= root.querySelector<HTMLElement>('[data-carousel-modal-content]');
  const modalClose  = root.querySelector<HTMLButtonElement>('[data-carousel-modal-close]');
  const modalImage  = root.querySelector<HTMLImageElement>('[data-carousel-modal-image]');
  const modalCat    = root.querySelector<HTMLElement>('[data-carousel-modal-category]');
  const modalTitle  = root.querySelector<HTMLElement>('[data-carousel-modal-title]');
  const modalDesc   = root.querySelector<HTMLElement>('[data-carousel-modal-description]');
  const modalStack  = root.querySelector<HTMLElement>('[data-carousel-modal-stack]');
  const modalViewBtn= root.querySelector<HTMLAnchorElement>('[data-carousel-modal-view-btn]');
  const modalLiveBtn= root.querySelector<HTMLAnchorElement>('[data-carousel-modal-live-btn]');
  const modalCodeBtn= root.querySelector<HTMLAnchorElement>('[data-carousel-modal-code-btn]');

  if (!track || !btnLeft || !btnRight) return;

  // ── Scroll helpers ──────────────────────────────────────────────────────────

  function cardScrollAmount(): number {
    const card = root.querySelector<HTMLElement>('[data-carousel-card]');
    if (!card) return 300;
    const gap = parseFloat(getComputedStyle(card.parentElement!).gap) || 16;
    return card.offsetWidth + gap;
  }

  function syncButtons() {
    const { scrollLeft, scrollWidth, clientWidth } = track!;
    setDisabled(btnLeft!,  scrollLeft <= 1);
    setDisabled(btnRight!, scrollLeft + clientWidth >= scrollWidth - 1);
  }

  function setDisabled(btn: HTMLButtonElement, disabled: boolean) {
    btn.disabled = disabled;
    btn.setAttribute('aria-disabled', String(disabled));
    if (disabled) {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
    } else {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
  }

  btnLeft.addEventListener('click',  () => { if (!btnLeft.disabled)  track.scrollBy({ left: -cardScrollAmount(), behavior: 'smooth' }); });
  btnRight.addEventListener('click', () => { if (!btnRight.disabled) track.scrollBy({ left:  cardScrollAmount(), behavior: 'smooth' }); });
  track.addEventListener('scroll', syncButtons, { passive: true });
  syncButtons();

  // Remove the pulse hint from the right arrow once the user scrolls
  function removeHint() {
    btnRight.classList.remove('carousel-arrow-hint');
    track.removeEventListener('scroll', removeHint);
  }
  track.addEventListener('scroll', removeHint, { passive: true });

  // ── Image blur-on-load ──────────────────────────────────────────────────────

  root.querySelectorAll<HTMLImageElement>('[data-carousel-img]').forEach((img) => {
    const unblur = () => img.classList.remove('blur-sm');
    img.complete ? unblur() : img.addEventListener('load', unblur, { once: true });
  });

  // ── Modal ───────────────────────────────────────────────────────────────────

  if (!modal || !backdrop || !modalContent || !modalClose) return;

  const localePath = { es: '/es', fr: '/fr' }[document.documentElement.lang] ?? '';
  let activeIndex = -1;

  function openModal(index: number) {
    const card = root.querySelector<HTMLElement>(`[data-carousel-card][data-index="${index}"]`);
    if (!card) return;

    const title   = card.querySelector('h3 span')?.textContent?.replace('.', '').trim() ?? '';
    const subtitle= card.getAttribute('data-subtitle') ?? '';
    const desc    = card.getAttribute('data-description') ?? '';
    const image   = card.getAttribute('data-image') ?? '';
    const slug    = card.getAttribute('data-slug') ?? '';
    const liveUrl = card.getAttribute('data-live-url') ?? '';
    const codeUrl = card.getAttribute('data-code-url') ?? '';
    let stack: string[] = [];
    try { stack = JSON.parse(card.getAttribute('data-stack') ?? '[]'); } catch { /* noop */ }

    if (modalImage)  { modalImage.src = image; modalImage.alt = title; }
    if (modalCat)    modalCat.textContent   = subtitle;
    if (modalTitle)  modalTitle.textContent = title;
    if (modalDesc)   modalDesc.textContent  = desc;

    if (modalStack) {
      modalStack.innerHTML = stack
        .map(t => {
          const color = getTechColor(t);
          return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-neutral-800 text-xs font-semibold text-gray-700 dark:text-gray-300"><span class="size-2 rounded-full" style="background-color:${color}"></span>${t}</span>`;
        })
        .join('');
    }

    if (modalViewBtn) modalViewBtn.href = `${localePath}/projects/${slug}`;
    toggleOptionalBtn(modalLiveBtn, liveUrl);
    toggleOptionalBtn(modalCodeBtn, codeUrl);

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      backdrop!.classList.replace('opacity-0', 'opacity-100');
      modalContent!.classList.remove('opacity-0', 'translate-y-4');
      modalContent!.classList.add('opacity-100', 'translate-y-0');
    });

    activeIndex = index;
  }

  function closeModal() {
    backdrop!.classList.replace('opacity-100', 'opacity-0');
    modalContent!.classList.remove('opacity-100', 'translate-y-0');
    modalContent!.classList.add('opacity-0', 'translate-y-4');

    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);

    if (activeIndex >= 0) {
      const card = root.querySelector<HTMLElement>(`[data-carousel-card][data-index="${activeIndex}"]`);
      if (card) {
        const offset = card.getBoundingClientRect().left - track!.getBoundingClientRect().left + track!.scrollLeft;
        track!.scrollTo({ left: offset, behavior: 'smooth' });
      }
    }
    activeIndex = -1;
  }

  function toggleOptionalBtn(btn: HTMLAnchorElement | null, url: string) {
    if (!btn) return;
    if (url) {
      btn.href = url;
      btn.classList.remove('hidden');
      btn.classList.add('inline-flex');
    } else {
      btn.classList.add('hidden');
      btn.classList.remove('inline-flex');
    }
  }

  root.querySelectorAll<HTMLElement>('[data-carousel-card]').forEach((card) => {
    card.addEventListener('click', () => openModal(parseInt(card.getAttribute('data-index') ?? '0', 10)));
  });

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
}
