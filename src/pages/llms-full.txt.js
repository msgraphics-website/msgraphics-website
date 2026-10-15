// Full text of every guide in one plain file, for AI assistants and search engines (see /llms.txt).
import { business, config, services } from '../lib/site.js';
import { getPosts } from '../lib/blog.js';

export async function GET() {
  const posts = await getPosts();
  const u = (p) => `${config.siteUrl}${p}`;
  const parts = [
    `# ${business.name}: guides (full text)`,
    '',
    `> Practical guides on printing, signage, in-store branding, hoardings, events and corporate branding from ${business.name}, ${business.address.full}. Phone/WhatsApp ${business.phoneDisplay}. Areas served: Delhi NCR${business.areasServed?.length ? ` (${business.areasServed.join(', ')})` : ''}.`,
    '',
    ...posts.flatMap((p) => {
      const s = services.find((x) => x.slug === p.data.service);
      return [
        `## ${p.data.title}`,
        `URL: ${u(`/blog/${p.id}/`)}`,
        ...(s ? [`Service: ${s.title} (${u(`/services/${s.slug}/`)})`] : []),
        `Published: ${p.data.date.toISOString().slice(0, 10)}`,
        '',
        ...(p.data.summary ? [`Quick answer: ${p.data.summary}`, ''] : []),
        p.body.trim(),
        '',
        ...(p.data.faq.length ? ['### Questions', ...p.data.faq.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`]), ''] : []),
        '---',
        '',
      ];
    }),
  ];
  return new Response(parts.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
