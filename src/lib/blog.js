import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection('blog', (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export const readingTime = (body = '') => Math.max(1, Math.round(body.split(/\s+/).length / 200));
export const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
