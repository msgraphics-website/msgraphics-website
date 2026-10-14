import { services, config, content } from '../lib/site.js';
import { getPosts } from '../lib/blog.js';

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const pages = ['/', '/services/', ...services.map((s) => `/services/${s.slug}/`), '/our-unit/', '/work/', '/about/', '/contact/', '/blog/', '/track/'].map((p) => ({ p, lastmod: today, pr: p === '/' ? '1.0' : p.startsWith('/services/') ? '0.9' : '0.7' }));
  const posts = (await getPosts()).map((post) => ({ p: `/blog/${post.id}/`, lastmod: (post.data.updated ?? post.data.date).toISOString().slice(0, 10), pr: '0.6' }));
  const urls = [...pages, ...posts].map(({ p, lastmod, pr }) => `  <url><loc>${config.siteUrl}${p}</loc><lastmod>${lastmod}</lastmod><priority>${pr}</priority></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
}
