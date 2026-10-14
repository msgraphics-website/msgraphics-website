import { config } from '../lib/site.js';

// Search engines and AI assistants are welcome to read and cite the site.
const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];

export function GET() {
  const body = [
    'User-agent: *', 'Allow: /', 'Disallow: /404', 'Disallow: /admin/', 'Disallow: /staff/', '',
    ...aiBots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', 'Disallow: /admin/', 'Disallow: /staff/', '']),
    `Sitemap: ${config.siteUrl}/sitemap.xml`, '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
