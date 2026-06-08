// certificate-parallax.ts — Floating scattered cards with scroll parallax + zoom reveal

export function initCertificateParallax(): void {
  const section = document.querySelector<HTMLElement>('[data-cert-parallax]');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allCards = Array.from(section.querySelectorAll<HTMLElement>('[data-cert-card]'));
  const floatCards = Array.from(section.querySelectorAll<HTMLElement>('.cert-float-card'));
  const mobileCards = Array.from(section.querySelectorAll<HTMLElement>('.cert-mobile-card'));

  if (prefersReducedMotion) {
    allCards.forEach(card => {
      card.classList.add('visible');
      card.style.transform = 'none';
    });
    setupInteractions(allCards, section);
    return;
  }

  // Mobile cards — simple scroll reveal with stagger
  if (mobileCards.length > 0) {
    const mobileObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement;
            const i = parseInt(card.dataset.certCard || '0');
            setTimeout(() => card.classList.add('visible'), i * 100);
            mobileObserver.unobserve(card);
          }
        });
      },
      { threshold: 0.2 }
    );
    mobileCards.forEach(card => mobileObserver.observe(card));
  }

  // Desktop: if no float cards visible, skip parallax setup
  if (floatCards.length === 0) {
    setupInteractions(allCards, section);
    return;
  }

  // Parse base rotation from inline style on first load
  floatCards.forEach((card) => {
    const match = card.style.transform.match(/rotate\(([^)]+)\)/);
    card.dataset.baseRotation = match ? match[1] : '0deg';
  });

  let ticking = false;

  function updateParallax() {
    const sectionRect = section!.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Progress: triggers earlier — certs fully visible when section is at viewport center
    const sectionTop = sectionRect.top;
    const progress = Math.max(0, Math.min(1,
      (viewportHeight * 0.7 - sectionTop) / (viewportHeight * 0.5)
    ));

    // Section center offset for parallax drift
    const sectionCenter = sectionTop + sectionRect.height / 2;
    const distFromCenter = (sectionCenter - viewportHeight / 2) / viewportHeight;

    floatCards.forEach((card, i) => {
      const speed = parseFloat(card.dataset.parallaxSpeed || '0.2');
      const direction = card.dataset.parallaxDirection === 'down' ? 1 : -1;
      const rot = card.dataset.baseRotation || '0deg';

      // Stagger: each card appears at a different point in the progress
      const staggerDelay = i * 0.1;
      const cardProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / 0.4));

      // Scale: starts small from laptop center, grows to full size
      const scale = 0.2 + cardProgress * 0.8; // 0.2 → 1.0
      const opacity = cardProgress;

      // Get card's position relative to its offset parent (the inner container)
      const parent = card.offsetParent as HTMLElement;
      if (!parent) return;
      const parentW = parent.offsetWidth;
      const parentH = parent.offsetHeight;
      const centerX = parentW / 2;
      const centerY = parentH / 2;
      const cardCX = card.offsetLeft + card.offsetWidth / 2;
      const cardCY = card.offsetTop + card.offsetHeight / 2;

      // Vector from center to card's natural position
      const toCardX = cardCX - centerX;
      const toCardY = cardCY - centerY;

      // When cardProgress=0: card is AT center (translate = -toCard)
      // When cardProgress=1: card is at natural pos (translate = 0)
      const pullX = -toCardX * (1 - cardProgress);
      const pullY = -toCardY * (1 - cardProgress);

      // Subtle parallax drift once emerged
      const yDrift = distFromCenter * speed * 40 * direction * cardProgress;

      card.style.transform = `translate(${pullX}px, ${pullY + yDrift}px) rotate(${rot}) scale(${scale})`;
      card.style.opacity = String(opacity);

      if (cardProgress > 0) {
        card.classList.add('visible');
      }
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      updateParallax();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();

  setupInteractions(allCards, section);
}

function setupInteractions(cards: HTMLElement[], section: HTMLElement): void {
  cards.forEach((card) => {
    // Works on both desktop (click) and mobile (tap)
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(card, section);
    });
  });
}

function openModal(card: HTMLElement, section: HTMLElement): void {
  const modal = section.querySelector<HTMLElement>('[data-cert-modal]');
  const modalContent = section.querySelector<HTMLElement>('[data-cert-modal-content]');
  const backdrop = section.querySelector<HTMLElement>('[data-cert-modal-backdrop]');
  if (!modal || !modalContent) return;

  const img = modal.querySelector<HTMLImageElement>('[data-cert-modal-img]');
  const title = modal.querySelector<HTMLElement>('[data-cert-modal-title]');
  const issuer = modal.querySelector<HTMLElement>('[data-cert-modal-issuer]');
  const desc = modal.querySelector<HTMLElement>('[data-cert-modal-desc]');
  const credential = modal.querySelector<HTMLElement>('[data-cert-modal-credential]');
  const verifyLink = modal.querySelector<HTMLAnchorElement>('[data-cert-modal-verify]');

  const certIndex = card.dataset.certCard || '0';
  const imageNum = parseInt(certIndex) + 1;
  if (img) img.src = `/projects/Certificates/image-${imageNum}.webp`;
  if (img) img.alt = card.dataset.certTitle || '';
  if (title) title.textContent = card.dataset.certTitle || '';
  if (issuer) issuer.textContent = card.dataset.certIssuer || '';
  if (desc) desc.textContent = card.dataset.certDescription || '';
  if (credential) credential.textContent = card.dataset.certCredential || '';
  if (verifyLink) verifyLink.href = card.dataset.certLink || '#';

  // Animate from card position
  const cardRect = card.getBoundingClientRect();
  const vpWidth = window.innerWidth;
  const vpHeight = window.innerHeight;
  const startX = cardRect.left + cardRect.width / 2 - vpWidth / 2;
  const startY = cardRect.top + cardRect.height / 2 - vpHeight / 2;
  const startScale = cardRect.width / Math.min(vpWidth * 0.9, 512);

  modalContent.style.transition = 'none';
  modalContent.style.transform = `translate(${startX}px, ${startY}px) scale(${startScale})`;
  modalContent.style.opacity = '0';

  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    modalContent.style.transition = 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1), opacity 300ms ease';
    modalContent.style.transform = 'translate(0, 0) scale(1)';
    modalContent.style.opacity = '1';
  });

  modal.dataset.originX = String(startX);
  modal.dataset.originY = String(startY);
  modal.dataset.originScale = String(startScale);

  const closeModal = () => {
    const ox = parseFloat(modal.dataset.originX || '0');
    const oy = parseFloat(modal.dataset.originY || '0');
    const os = parseFloat(modal.dataset.originScale || '0.5');

    modalContent.style.transition = 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1), opacity 250ms ease';
    modalContent.style.transform = `translate(${ox}px, ${oy}px) scale(${os})`;
    modalContent.style.opacity = '0';

    setTimeout(() => {
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      document.body.style.overflow = '';
    }, 350);

    document.removeEventListener('keydown', onKeyDown);
    backdrop?.removeEventListener('click', closeModal);
    closeBtn?.removeEventListener('click', closeModal);
  };

  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
  const closeBtn = modal.querySelector<HTMLElement>('[data-cert-modal-close]');
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', onKeyDown);

  // Copy button
  const copyBtn = modal.querySelector<HTMLElement>('[data-cert-modal-copy]');
  const newCopyBtn = copyBtn?.cloneNode(true) as HTMLElement;
  copyBtn?.parentNode?.replaceChild(newCopyBtn, copyBtn);
  newCopyBtn?.addEventListener('click', () => {
    copyToClipboard(card.dataset.certCredential || '', section, newCopyBtn);
  });

  // Magnifier lens setup
  setupMagnifier(modal);
}

/**
 * Sets up the magnifier lens effect on the modal image.
 * Click to activate, click again to deactivate. Works on both desktop and mobile.
 */
function setupMagnifier(modal: HTMLElement): void {
  const container = modal.querySelector<HTMLElement>('[data-cert-magnifier]');
  const img = modal.querySelector<HTMLImageElement>('[data-cert-modal-img]');
  const lens = modal.querySelector<HTMLElement>('[data-cert-magnifier-lens]');
  if (!container || !img || !lens) return;

  const ZOOM = 2.5;
  let active = false;

  const initLens = () => {
    lens.style.backgroundImage = `url(${img.src})`;
    lens.style.backgroundSize = `${img.offsetWidth * ZOOM}px ${img.offsetHeight * ZOOM}px`;
  };

  if (img.complete) {
    initLens();
  } else {
    img.addEventListener('load', initLens, { once: true });
  }

  const updateLensPosition = (clientX: number, clientY: number) => {
    if (!active) return;
    const rect = img.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      lens.style.opacity = '0';
      return;
    }

    lens.style.opacity = '1';
    const lensW = lens.offsetWidth;
    const lensH = lens.offsetHeight;
    let lensX = Math.max(0, Math.min(x - lensW / 2, rect.width - lensW));
    let lensY = Math.max(0, Math.min(y - lensH / 2, rect.height - lensH));

    lens.style.left = `${lensX}px`;
    lens.style.top = `${lensY}px`;

    const bgX = -(x * ZOOM - lensW / 2);
    const bgY = -(y * ZOOM - lensH / 2);
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    lens.style.backgroundSize = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
  };

  // Toggle on click
  container.addEventListener('click', (e) => {
    e.stopPropagation();
    active = !active;
    if (active) {
      initLens();
      container.style.cursor = 'crosshair';
      // Show lens at click position
      updateLensPosition(e.clientX, e.clientY);
    } else {
      lens.style.opacity = '0';
      container.style.cursor = 'zoom-in';
    }
  });

  // Move lens while active (desktop)
  container.addEventListener('mousemove', (e) => {
    updateLensPosition(e.clientX, e.clientY);
  });

  // Move lens while active (mobile — touch drag)
  container.addEventListener('touchmove', (e) => {
    if (!active) return;
    e.preventDefault();
    const touch = e.touches[0];
    updateLensPosition(touch.clientX, touch.clientY);
  }, { passive: false });

  container.addEventListener('mouseleave', () => {
    if (active) {
      lens.style.opacity = '0';
    }
  });

  container.addEventListener('mouseenter', (e) => {
    if (active) {
      updateLensPosition(e.clientX, e.clientY);
    }
  });
}

async function copyToClipboard(text: string, section: HTMLElement, copyBtn?: HTMLElement): Promise<void> {
  const toastContainer = section.querySelector<HTMLElement>('[data-cert-toast-container]');
  if (!toastContainer) return;

  let successMsg = 'Credential copied to clipboard';
  let errorMsg = 'Could not copy to clipboard';
  const i18nScript = document.querySelector<HTMLScriptElement>('[data-cert-i18n]');
  if (i18nScript) {
    try {
      const data = JSON.parse(i18nScript.textContent || '{}');
      successMsg = data.toastCopied || successMsg;
      errorMsg = data.toastError || errorMsg;
    } catch {}
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(toastContainer, successMsg, 'success');

    // Visual feedback on button — turn green with check icon
    if (copyBtn) {
      copyBtn.classList.remove('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-600', 'dark:text-blue-400');
      copyBtn.classList.add('bg-green-50', 'dark:bg-green-900/30', 'text-green-600', 'dark:text-green-400');
      const svgEl = copyBtn.querySelector('svg');
      if (svgEl) {
        svgEl.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />';
      }
      const textEl = copyBtn.querySelector('[data-cert-modal-copy-text]');
      if (textEl) textEl.textContent = 'Copied!';

      // Revert after 2s
      setTimeout(() => {
        copyBtn.classList.remove('bg-green-50', 'dark:bg-green-900/30', 'text-green-600', 'dark:text-green-400');
        copyBtn.classList.add('bg-blue-50', 'dark:bg-blue-900/30', 'text-blue-600', 'dark:text-blue-400');
        if (svgEl) {
          svgEl.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />';
        }
        // Restore original text from i18n
        if (textEl) {
          try {
            const data = JSON.parse(i18nScript?.textContent || '{}');
            textEl.textContent = data.copyId || 'Copy ID';
          } catch { textEl.textContent = 'Copy ID'; }
        }
      }, 2000);
    }
  } catch {
    showToast(toastContainer, errorMsg, 'error');
  }
}

function showToast(container: HTMLElement, message: string, type: 'success' | 'error'): void {
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90';
  toast.className = `px-4 py-2.5 rounded-xl ${bg} text-white text-sm font-medium shadow-lg backdrop-blur-sm pointer-events-auto`;
  toast.style.cssText = 'transform:translateY(-20px);opacity:0;transition:transform 300ms ease,opacity 300ms ease';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
