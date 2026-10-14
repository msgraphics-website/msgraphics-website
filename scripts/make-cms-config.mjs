// Writes public/admin/config.yml for the admin panel (Decap CMS) from the
// content files, so every field in src/data/content/*.json is editable.
// Runs automatically before every build (see "build" in package.json).
import fs from 'node:fs';
import path from 'node:path';
import config from '../src/config/site.config.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cdir = path.join(root, 'src/data/content');

const SECTIONS = [
  ['business', 'Business details (phone, address, hours, social)'],
  ['home', 'Home page'],
  ['services', 'Services (6 service pages)'],
  ['testimonials', 'Client testimonials'],
  ['unit', 'Our Unit page (machines, photos)'],
  ['work', 'Work page (projects, before/after, case studies)'],
  ['about', 'About page (founder, team, stats)'],
  ['contact', 'Contact page'],
];

const NICE = { src: 'Image', alt: 'Image description (alt text)', label: '3D note (delete when you upload a real photo)', cta: 'Button', ctaText: 'Button text', faqs: 'FAQs', q: 'Question', a: 'Answer', url: 'Link', youtubeId: 'YouTube video ID' };
const human = (k) => NICE[k] ?? k.replace(/^_/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase());
const isImage = (v) => v && typeof v === 'object' && !Array.isArray(v) && typeof v.src === 'string' && 'alt' in v;

function field(name, v, siblings = {}) {
  const f = { name, label: human(name), required: false };
  if (name.startsWith('_')) return { ...f, widget: 'hidden', default: v };
  if (typeof v === 'number') return { ...f, widget: 'number', value_type: Number.isInteger(v) ? 'int' : 'float' };
  if (typeof v === 'boolean') return { ...f, widget: 'boolean' };
  if (typeof v === 'string' || v == null) {
    if (name === 'src' || name === 'logo' || /^\/images\//.test(v ?? '') || /(image|photo|logo)$/i.test(name) && /\.(webp|jpe?g|png|svg)$/i.test(v ?? '')) return { ...f, widget: 'image', choose_url: false };
    if (name === 'slug') return { ...f, widget: 'string', hint: 'Part of the page address. Changing it breaks old links.' };
    return { ...f, widget: (v ?? '').length > 90 || /\n/.test(v ?? '') ? 'text' : 'string' };
  }
  if (Array.isArray(v)) {
    if (!v.length || v.every((x) => typeof x !== 'object')) return { ...f, widget: 'list', field: { name: 'item', label: human(name), widget: v.some((x) => String(x).length > 90) ? 'text' : 'string' } };
    const merged = Object.assign({}, ...v.filter((x) => x && typeof x === 'object'));
    const summary = ['title', 'name', 'q', 'label', 'value', 'caption', 'alt'].find((k) => typeof merged[k] === 'string');
    return { ...f, widget: 'list', collapsed: true, ...(summary ? { summary: `{{fields.${summary}}}` } : {}), fields: Object.entries(merged).map(([k, x]) => field(k, x, merged)) };
  }
  if (isImage(v)) return { ...f, widget: 'object', collapsed: false, fields: Object.entries(v).map(([k, x]) => field(k, x)) };
  return { ...f, widget: 'object', collapsed: true, fields: Object.entries(v).map(([k, x]) => field(k, x, v)) };
}

const files = SECTIONS.map(([key, label]) => {
  const data = JSON.parse(fs.readFileSync(path.join(cdir, `${key}.json`), 'utf8'));
  return { name: key, label, file: `src/data/content/${key}.json`, format: 'json', fields: Object.entries(data).map(([k, v]) => field(k, v, data)) };
});

// Testimonials: keep a clear form, whatever is in the file today.
const t = files.find((f) => f.name === 'testimonials');
t.fields = [{
  name: 'testimonials', label: 'Testimonials', widget: 'list', collapsed: false, summary: '{{fields.name}}, {{fields.company}}',
  hint: 'Only real quotes from real clients, with their permission.',
  fields: [
    { name: 'quote', label: 'What they said', widget: 'text' },
    { name: 'name', label: 'Name', widget: 'string' },
    { name: 'designation', label: 'Designation', widget: 'string', required: false },
    { name: 'company', label: 'Company', widget: 'string', required: false },
  ],
}];

const services = JSON.parse(fs.readFileSync(path.join(cdir, 'services.json'), 'utf8')).services;
const cms = {
  backend: { name: 'github', repo: config.cmsRepo, branch: config.cmsBranch, commit_messages: { update: 'Update {{collection}} “{{slug}}” from admin panel', create: 'Create {{collection}} “{{slug}}” from admin panel' } },
  site_url: config.siteUrl,
  display_url: config.siteUrl,
  logo_url: '/favicon.svg',
  locale: 'en',
  media_folder: 'public/images',
  public_folder: '/images',
  collections: [
    { name: 'site', label: 'Website pages', editor: { preview: false }, files },
    {
      name: 'blog', label: 'Blog posts', label_singular: 'Blog post', folder: 'src/content/blog', create: true, extension: 'md', format: 'frontmatter',
      slug: '{{slug}}', sortable_fields: ['date', 'title'], summary: '{{title}} ({{date}})', editor: { preview: false },
      fields: [
        { name: 'title', label: 'Title', widget: 'string', hint: 'Under 65 characters works best on Google.' },
        { name: 'description', label: 'Short description (Google and social media)', widget: 'text', hint: '140–160 characters.' },
        { name: 'date', label: 'Published', widget: 'datetime', date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD' },
        { name: 'updated', label: 'Updated', widget: 'datetime', date_format: 'YYYY-MM-DD', time_format: false, format: 'YYYY-MM-DD', required: false },
        { name: 'keywords', label: 'Keywords', widget: 'list', required: false },
        { name: 'cover', label: 'Cover image', widget: 'object', fields: [{ name: 'src', label: 'Image', widget: 'image', choose_url: false }, { name: 'alt', label: 'Image description', widget: 'string' }] },
        { name: 'service', label: 'Related service', widget: 'select', required: false, options: services.map((s) => ({ label: s.title, value: s.slug })) },
        { name: 'faq', label: 'Quick answers (FAQ)', widget: 'list', required: false, summary: '{{fields.q}}', fields: [{ name: 'q', label: 'Question', widget: 'string' }, { name: 'a', label: 'Answer', widget: 'text' }] },
        { name: 'draft', label: 'Draft (hide from the site)', widget: 'boolean', default: false, required: false },
        { name: 'body', label: 'Article', widget: 'markdown' },
      ],
    },
  ],
};

fs.mkdirSync(path.join(root, 'public/admin'), { recursive: true });
// JSON is valid YAML, so Decap reads this file as-is.
fs.writeFileSync(path.join(root, 'public/admin/config.yml'), '# Generated by scripts/make-cms-config.mjs. Do not edit by hand.\n' + JSON.stringify(cms, null, 2) + '\n');
console.log('Admin panel config written: public/admin/config.yml');
