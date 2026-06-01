/**
 * Project detail page interactions:
 * - Image gallery with fade transitions + swipe
 * - Copy-to-clipboard button for code blocks
 * - Table of contents generation + active section highlight
 */
document.addEventListener('astro:page-load', () => {
  const content = document.getElementById('project-content');
  const tocList = document.getElementById('toc-list');

  initGallery();
  initCopyButtons();
  initTOC(content, tocList);
});

// ── Gallery ────────────────────────────────────────────────────────────────────

function initGallery() {
  const galleryImgs = document.querySelectorAll<HTMLImageElement>('[data-gallery-img]');
  const prevBtn = document.querySelector<HTMLButtonElement>('[data-gallery-prev]');
  const nextBtn = document.querySelector<HTMLButtonElement>('[data-gallery-next]');
  const counter = document.querySelector<HTMLElement>('[data-gallery-counter]');

  if (galleryImgs.length <= 1 || !prevBtn || !nextBtn || !counter) return;

  let current = 0;
  const total = galleryImgs.length;

  // Style images for stacking
  galleryImgs.forEach((img) => {
    img.style.transition = 'opacity 0.3s ease-in-out';
    img.style.position = 'absolute';
    img.style.top = '0';
    img.style.left = '0';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.opacity = '0';
    img.classList.remove('hidden');
  });

  // Create wrapper
  const firstImg = galleryImgs[0];
  const parent = firstImg.parentElement!;
  const wrapper = document.createElement('div');
  wrapper.className = 'relative w-full rounded-xl ring-1 ring-black/5 dark:ring-white/10 my-6 bg-gray-100 dark:bg-neutral-900 overflow-hidden';

  galleryImgs.forEach((img) => {
    img.style.borderRadius = '0';
    img.className = '';
    wrapper.appendChild(img);
  });

  galleryImgs[0].style.position = 'relative';
  parent.insertBefore(wrapper, parent.querySelector('[data-gallery-prev]')?.parentElement ?? null);

  function showSlide(i: number) {
    galleryImgs.forEach((img, idx) => {
      const isActive = idx === i;
      img.style.opacity = isActive ? '1' : '0';
      img.style.position = isActive ? 'relative' : 'absolute';
      img.style.zIndex = isActive ? '1' : '0';
    });
    counter!.textContent = `${i + 1} / ${total}`;
    prevBtn!.disabled = i === 0;
    prevBtn!.classList.toggle('opacity-30', i === 0);
    nextBtn!.disabled = i === total - 1;
    nextBtn!.classList.toggle('opacity-30', i === total - 1);
  }

  prevBtn.addEventListener('click', () => { if (current > 0) showSlide(--current); });
  nextBtn.addEventListener('click', () => { if (current < total - 1) showSlide(++current); });

  // Swipe support for mobile
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  wrapper.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (diff > 50 && current < total - 1) showSlide(++current);
    else if (diff < -50 && current > 0) showSlide(--current);
  });

  showSlide(0);
}

// ── Copy buttons ───────────────────────────────────────────────────────────────

function initCopyButtons() {
  document.querySelectorAll<HTMLElement>('[data-copy-block]').forEach((block) => {
    const btn = block.querySelector<HTMLButtonElement>('[data-copy-btn]');
    const code = block.querySelector('code');
    if (!btn || !code) return;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = code.textContent?.replace(/\\n/g, '\n') ?? '';
      await navigator.clipboard.writeText(text);

      btn.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='size-4 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5'><path stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/></svg>`;
      btn.classList.add('!opacity-100');

      setTimeout(() => {
        btn.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='size-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'><rect x='9' y='9' width='13' height='13' rx='2'/><path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1'/></svg>`;
        btn.classList.remove('!opacity-100');
      }, 2000);
    });
  });
}

// ── Table of Contents ──────────────────────────────────────────────────────────

function initTOC(content: HTMLElement | null, tocList: HTMLElement | null) {
  if (!content || !tocList) return;

  const headings = content.querySelectorAll<HTMLHeadingElement>('h2');
  if (headings.length === 0) return;

  headings.forEach((h, i) => {
    if (!h.id) h.id = `section-${i}`;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.className = `block py-1.5 px-3 rounded-lg text-gray-600 dark:text-gray-400
                   hover:text-gray-900 dark:hover:text-white
                   hover:bg-gray-100 dark:hover:bg-neutral-800
                   transition-colors duration-150 leading-snug`;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Active section highlight
  const tocLinks = tocList.querySelectorAll<HTMLAnchorElement>('a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('text-neutral-900', isActive);
          link.classList.toggle('dark:text-white', isActive);
          link.classList.toggle('font-semibold', isActive);
          link.classList.toggle('bg-gray-100', isActive);
          link.classList.toggle('dark:bg-neutral-800', isActive);
        });
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
}
