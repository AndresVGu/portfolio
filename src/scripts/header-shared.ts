/**
 * Shared header utilities used by both Header and ProjectHeader.
 * - Language dropdown toggle
 * - Scroll-based header background effect
 */

/** Initialize the desktop language dropdown toggle */
export function initLangDropdown() {
  const langMenu = document.getElementById('language-menu');
  const langBtn  = document.getElementById('dropdown-language');

  if (!langBtn || !langMenu) return;

  const newBtn = langBtn.cloneNode(true) as HTMLElement;
  langBtn.parentNode?.replaceChild(newBtn, langBtn);

  document.addEventListener('click', () => langMenu.classList.remove('open'));
  newBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('open');
  });

  langMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => localStorage.setItem('lang-redirected', '1'));
  });
}

/** Initialize scroll-based header background effect */
export function initHeaderScroll() {
  const desktopNav = document.getElementById('desktop-nav');
  const siteHeader = document.getElementById('site-header');
  const openBtn    = document.getElementById('mobile-menu-btn');

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

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
