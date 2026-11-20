/**
 * Shared header utilities used by both Header and ProjectHeader.
 * - Language dropdown toggle
 * - Scroll-based header background effect
 */

let langCleanup: (() => void) | null = null;
let headerCleanup: (() => void) | null = null;

export function cleanupHeaderListeners() {
  langCleanup?.();
  headerCleanup?.();
  langCleanup = null;
  headerCleanup = null;
}

/** Initialize the desktop language dropdown toggle */
export function initLangDropdown() {
  langCleanup?.();
  const langMenu = document.getElementById('language-menu');
  const langBtn = document.getElementById('dropdown-language');

  if (!langBtn || !langMenu) return;

  const controller = new AbortController();
  const closeMenu = () => {
    langMenu.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  };

  document.addEventListener('click', closeMenu, { signal: controller.signal });
  langBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = langMenu.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', String(isOpen));
  }, { signal: controller.signal });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && langMenu.classList.contains('open')) {
      closeMenu();
      langBtn.focus();
    }
  }, { signal: controller.signal });
  langMenu.querySelectorAll('a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      localStorage.setItem('lang-redirected', '1');
    }, { signal: controller.signal });
  });

  langCleanup = () => controller.abort();
  return langCleanup;
}

/** Initialize scroll-based header background effect */
export function initHeaderScroll() {
  headerCleanup?.();
  const desktopNav = document.getElementById('desktop-nav');
  const siteHeader = document.getElementById('site-header');
  const openBtn    = document.getElementById('mobile-menu-btn');
  const controller = new AbortController();

  const SCROLLED_DESKTOP = [
    'bg-white/80', 'dark:bg-gray-900/80',
    'border', 'border-gray-200', 'dark:border-gray-700',
    'backdrop-blur-md', 'shadow-sm',
  ];
  const SCROLLED_MOBILE = [
    'bg-white/60', 'dark:bg-gray-950/60',
    'backdrop-blur-md', 'shadow-sm',
  ];
  const SCROLLED_HAMBURGER = [
    'bg-white/80', 'dark:bg-gray-900/80',
    'border', 'border-gray-200', 'dark:border-gray-700',
    'backdrop-blur-md', 'shadow-sm', 'hover:bg-gray-100', 'dark:hover:bg-gray-800',
  ];

  function update() {
    const scrolled = window.scrollY > 10;
    const isMobile = window.innerWidth < 768;

    if (desktopNav) {
      if (scrolled) {
        desktopNav.classList.add('transition-all', 'duration-300');
        SCROLLED_DESKTOP.forEach(c => desktopNav.classList.add(c));
      } else {
        desktopNav.classList.remove('transition-all', 'duration-300');
        SCROLLED_DESKTOP.forEach(c => desktopNav.classList.remove(c));
      }
    }

    if (siteHeader && isMobile) {
      SCROLLED_MOBILE.forEach(c => siteHeader.classList.toggle(c, scrolled));
    }

    if (openBtn && isMobile) {
      SCROLLED_HAMBURGER.forEach(c => (openBtn as HTMLElement).classList.toggle(c, scrolled));
    }
  }

  window.addEventListener('scroll', update, { passive: true, signal: controller.signal });
  window.addEventListener('resize', update, { passive: true, signal: controller.signal });
  update();
  headerCleanup = () => controller.abort();
  return headerCleanup;
}
