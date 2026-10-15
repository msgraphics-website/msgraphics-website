// /llms.txt: a plain-text summary that AI assistants (ChatGPT, Claude, Perplexity, Gemini)
// can read to understand and cite the business accurately. Built from src/data/content/.
import { content, services, business, config } from '../lib/site.js';
import { getPosts } from '../lib/blog.js';

export async function GET() {
  const u = (p) => `${config.siteUrl}${p}`;
  const posts = await getPosts();
  const stats = Object.fromEntries(content.about.stats.map((s) => [s.label, `${s.value}${s.suffix}`]));
  const clients = content.home.clients.map((c) => c.name).filter((n) => !/^\[/.test(n));
  const lines = [
    `# ${business.name}`,
    '',
    `> ${business.name} is a print, branding and events company in New Delhi, India, with its own production unit at Dwarka Mor. It designs, prints, fabricates and installs in-store branding, signage, hoardings, exhibition stalls and event setups for businesses across Delhi NCR. Tagline: "${business.tagline}"`,
    '',
    '## Key facts',
    `- Address: ${business.address.full}`,
    `- Phone / WhatsApp: ${business.phoneDisplay}`,
    `- Email: ${business.email}`,
    `- Working hours: ${business.workingHours}`,
    `- Founded: ${stats['Founded'] ?? business.founded}`,
    `- Team: ${stats['Team members'] ?? ''} people (design, printing, fabrication, installation, client servicing, events)`,
    `- Projects delivered: ${stats['Projects delivered'] ?? ''}; clients served: ${stats['Happy clients'] ?? ''}`,
    `- Coverage: installation across Delhi NCR; work delivered in ${stats['Cities in India & Nepal'] ?? ''} cities across India and Nepal`,
    ...(business.areasServed?.length ? [`- Areas served in Delhi NCR include: ${business.areasServed.join(', ')}`] : []),
    `- Differentiator: production is in-house (own machines), with a colour proof before every bulk run and a photo report after every installation. GST registered and MSME registered.`,
    clients.length ? `- Clients include: ${clients.join(', ')}` : '',
    `- Quotes: within 24 hours via ${u('/contact/')} or WhatsApp`,
    '',
    '## Services',
    ...services.map((s) => `- [${s.title}](${u(`/services/${s.slug}/`)}): ${s.tagline} ${s.whatWeDo.join('; ')}.`),
    '',
    '## Pages',
    `- [Our production unit](${u('/our-unit/')}): machines and sections of the Dwarka unit`,
    `- [Work](${u('/work/')}): portfolio by category`,
    `- [About](${u('/about/')}): history, team and mission`,
    `- [Contact and quote](${u('/contact/')})`,
    `- [Online print shop](${config.shopUrl})`,
    '',
    `## Guides (full text: ${u('/llms-full.txt')})`,
    ...posts.map((p) => `- [${p.data.title}](${u(`/blog/${p.id}/`)}): ${p.data.summary || p.data.description}`),
    '',
    '## FAQ',
    ...content.home.faqs.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`, '']),
  ].filter((l, i, a) => !(l === '' && a[i - 1] === ''));
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
