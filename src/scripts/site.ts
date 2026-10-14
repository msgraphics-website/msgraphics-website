// Site-wide behaviour: scroll reveal, analytics event tracking.
declare global { interface Window { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void } }

/** Sends an event to GA4 and Meta Pixel (if they are configured). */
export function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params);
  if (window.fbq) {
    if (name === 'quote_form_submit') window.fbq('track', 'Lead', params);
    else if (name === 'whatsapp_click') window.fbq('track', 'Contact', { method: 'whatsapp' });
    else window.fbq('trackCustom', name, params);
  }
}

export function initSite() {
  // Track WhatsApp / call clicks anywhere on the page
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
    if (el) track(el.dataset.track!, { link_url: (el as HTMLAnchorElement).href, page: location.pathname });
  });

  // Fade/slide-in on scroll
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}
