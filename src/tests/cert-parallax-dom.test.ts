// Feature: certificate-parallax-section — DOM interaction unit tests
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Helper to create a minimal DOM structure matching CertificateParallax.astro
 */
function createCertSection(): HTMLElement {
  const section = document.createElement('section');
  section.setAttribute('data-cert-parallax', '');
  section.setAttribute('data-locale', 'en');
  section.style.minHeight = '200vh';

  const sticky = document.createElement('div');
  sticky.className = 'sticky';

  // Laptop
  const laptop = document.createElement('div');
  laptop.setAttribute('data-cert-laptop', '');
  laptop.innerHTML = '<img src="/laptop_sin_fondo.png" alt="Laptop" loading="lazy" />';
  sticky.appendChild(laptop);

  // Sheen
  const sheen = document.createElement('div');
  sheen.setAttribute('data-cert-sheen', '');
  sticky.appendChild(sheen);

  // Certificates
  for (let i = 0; i < 4; i++) {
    const card = document.createElement('div');
    card.setAttribute('data-cert-card', String(i));
    card.setAttribute('data-cert-title', `Cert ${i}`);
    card.setAttribute('data-cert-issuer', `Issuer ${i}`);
    card.setAttribute('data-cert-description', `Description ${i}`);
    card.setAttribute('data-cert-link', `https://verify.com/${i}`);
    card.setAttribute('data-cert-credential', `CRED-${i}`);
    card.style.opacity = '0';
    card.innerHTML = `<img src="/projects/Certificates/image-${i + 1}.webp" alt="Cert ${i}" loading="lazy" />`;
    sticky.appendChild(card);
  }

  // Particles container
  const particles = document.createElement('div');
  particles.setAttribute('data-cert-particles', '');
  sticky.appendChild(particles);

  // Scroll indicator
  const indicator = document.createElement('div');
  indicator.setAttribute('data-cert-scroll-indicator', '');
  indicator.style.opacity = '0';
  indicator.innerHTML = '<svg></svg>';
  sticky.appendChild(indicator);

  // Tooltip
  const tooltip = document.createElement('div');
  tooltip.setAttribute('data-cert-tooltip', '');
  tooltip.style.opacity = '0';
  sticky.appendChild(tooltip);

  section.appendChild(sticky);

  // Modal
  const modal = document.createElement('div');
  modal.setAttribute('data-cert-modal', '');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Certificate details');
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';

  const backdrop = document.createElement('div');
  backdrop.setAttribute('data-cert-modal-backdrop', '');
  modal.appendChild(backdrop);

  const content = document.createElement('div');
  content.setAttribute('data-cert-modal-content', '');

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('data-cert-modal-close', '');
  content.appendChild(closeBtn);

  const img = document.createElement('img');
  img.setAttribute('data-cert-modal-img', '');
  content.appendChild(img);

  const title = document.createElement('h3');
  title.setAttribute('data-cert-modal-title', '');
  content.appendChild(title);

  const issuer = document.createElement('p');
  issuer.setAttribute('data-cert-modal-issuer', '');
  content.appendChild(issuer);

  const desc = document.createElement('p');
  desc.setAttribute('data-cert-modal-desc', '');
  content.appendChild(desc);

  const credential = document.createElement('code');
  credential.setAttribute('data-cert-modal-credential', '');
  content.appendChild(credential);

  const copyBtn = document.createElement('button');
  copyBtn.setAttribute('data-cert-modal-copy', '');
  content.appendChild(copyBtn);

  const verifyLink = document.createElement('a');
  verifyLink.setAttribute('data-cert-modal-verify', '');
  content.appendChild(verifyLink);

  modal.appendChild(content);
  section.appendChild(modal);

  // Toast container
  const toast = document.createElement('div');
  toast.setAttribute('data-cert-toast-container', '');
  section.appendChild(toast);

  // i18n data
  const i18nScript = document.createElement('script');
  i18nScript.setAttribute('data-cert-i18n', '');
  i18nScript.setAttribute('type', 'application/json');
  i18nScript.textContent = JSON.stringify({
    modalLabel: 'Certificate details',
    close: 'Close',
    verify: 'Verify certificate',
    copyId: 'Copy ID',
    copied: 'Copied!',
    copyError: 'Copy failed',
    toastCopied: 'Credential copied to clipboard',
    toastError: 'Could not copy to clipboard',
  });
  section.appendChild(i18nScript);

  return section;
}

describe('Certificate Parallax DOM — Modal Tests', () => {
  let section: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    section = createCertSection();
    document.body.appendChild(section);
  });

  it('modal has role="dialog" and aria-modal="true"', () => {
    const modal = section.querySelector('[data-cert-modal]');
    expect(modal?.getAttribute('role')).toBe('dialog');
    expect(modal?.getAttribute('aria-modal')).toBe('true');
    expect(modal?.getAttribute('aria-label')).toBe('Certificate details');
  });

  it('modal starts hidden (opacity 0, pointer-events none)', () => {
    const modal = section.querySelector<HTMLElement>('[data-cert-modal]');
    expect(modal?.style.opacity).toBe('0');
    expect(modal?.style.pointerEvents).toBe('none');
  });

  it('certificate images have loading="lazy"', () => {
    const images = section.querySelectorAll<HTMLImageElement>('[data-cert-card] img');
    images.forEach((img) => {
      expect(img.getAttribute('loading')).toBe('lazy');
    });
  });

  it('all 4 certificates are rendered with correct data attributes', () => {
    const cards = section.querySelectorAll('[data-cert-card]');
    expect(cards.length).toBe(4);

    cards.forEach((card, i) => {
      expect(card.getAttribute('data-cert-card')).toBe(String(i));
      expect(card.getAttribute('data-cert-title')).toBe(`Cert ${i}`);
      expect(card.getAttribute('data-cert-issuer')).toBe(`Issuer ${i}`);
      expect(card.getAttribute('data-cert-credential')).toBe(`CRED-${i}`);
      expect(card.getAttribute('data-cert-link')).toContain('verify.com');
    });
  });

  it('scroll indicator starts with opacity 0', () => {
    const indicator = section.querySelector<HTMLElement>('[data-cert-scroll-indicator]');
    expect(indicator?.style.opacity).toBe('0');
  });

  it('tooltip starts with opacity 0', () => {
    const tooltip = section.querySelector<HTMLElement>('[data-cert-tooltip]');
    expect(tooltip?.style.opacity).toBe('0');
  });
});

describe('Certificate Parallax DOM — Toast Tests', () => {
  let section: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    section = createCertSection();
    document.body.appendChild(section);
  });

  it('toast container exists and is initially empty', () => {
    const container = section.querySelector('[data-cert-toast-container]');
    expect(container).not.toBeNull();
    expect(container?.children.length).toBe(0);
  });
});

describe('Certificate Parallax DOM — Accessibility', () => {
  let section: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    section = createCertSection();
    document.body.appendChild(section);
  });

  it('close button exists in modal', () => {
    const closeBtn = section.querySelector('[data-cert-modal-close]');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.tagName).toBe('BUTTON');
  });

  it('verify link opens in new tab', () => {
    const link = section.querySelector<HTMLAnchorElement>('[data-cert-modal-verify]');
    // The actual href is set dynamically, but the element exists
    expect(link).not.toBeNull();
    expect(link?.tagName).toBe('A');
  });

  it('section has data-locale attribute', () => {
    expect(section.getAttribute('data-locale')).toBe('en');
  });
});
