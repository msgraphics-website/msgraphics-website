import content from '../data/load-content.js';
import config from '../config/site.config.js';

export { content, config };
export const services = content.services;
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
