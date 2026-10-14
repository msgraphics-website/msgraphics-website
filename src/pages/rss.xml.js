import { config } from '../lib/site.js';
import { getPosts } from '../lib/blog.js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export async function GET() {
  const items = (await getPosts()).map((p) => `  <item><title>${esc(p.data.title)}</title><link>${config.siteUrl}/blog/${p.id}/</link><guid>${config.siteUrl}/blog/${p.id}/</guid><pubDate>${p.data.date.toUTCString()}</pubDate><description>${esc(p.data.description)}</description></item>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>M.S. Graphics Studio Blog</title>\n  <link>${config.siteUrl}/blog/</link>\n  <description>Guides on signage, printing, in-store branding and events from M.S. Graphics Studio, New Delhi.</description>\n  <language>en-in</language>\n${items}\n</channel></rss>\n`, { headers: { 'Content-Type': 'application/rss+xml' } });
}
