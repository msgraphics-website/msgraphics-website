import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog posts live in src/content/blog/*.md. Copy an existing post to start a new one.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string().optional(), // "Quick answer" box at the top; also read by AI search
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    keywords: z.array(z.string()).default([]),
    cover: z.object({ src: z.string(), alt: z.string() }),
    service: z.string().optional(), // slug of the related service page
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
