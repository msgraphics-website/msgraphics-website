import content from '../data/load-content.js';
import config from '../config/site.config.js';

export { content, config };
export const allServices = content.services;
// Main services (top-level). Sub-pages carry a "parent" slug.
export const services = allServices.filter((s) => !s.parent);
export const DIGITAL_HUB = 'website-app-digital-marketing';
export const digitalHub = allServices.find((s) => s.slug === DIGITAL_HUB);
export const digitalServices = allServices.filter((s) => s.parent === DIGITAL_HUB);
export const business = content.business;

export const waLink = (text = config.whatsappMessage) =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`;
export const telLink = `tel:${business.phone}`;
export const mailLink = `mailto:${business.email}`;
export const serviceUrl = (s) => `/services/${s.slug}/`;
// Wraps [placeholders] so they are easy to spot. Returns HTML.
export const ph = (text = '') =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
export const isPlaceholder = (v) => /^\[.*\]$/.test(String(v ?? '').trim()) || !String(v ?? '').trim();
