# M.S. Graphics Studio website

Static website built with [Astro](https://astro.build). It builds to plain HTML and CSS with very little JavaScript, so it is fast and can be hosted free on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

## Logins: admin panel, orders, staff

- **`/admin/`**: edit all website text, photos, testimonials and blog posts in the browser.
- **`/staff/`**: staff create orders, update their status and (admins) create staff IDs.
- **`/track/`**: clients check their order with the order ID and the last 4 digits of their phone.

One-time setup (GitHub, Netlify, Supabase) is explained step by step in **`SETUP-ADMIN-AND-ORDERS.md`**.

## Quick start

You need [Node.js](https://nodejs.org) 18.20 or newer.

```bash
npm install        # once
npm run dev        # live preview at http://localhost:4321
npm run build      # makes the final site in the /dist folder
```

## Where things are

| What | File |
|---|---|
| **All text, numbers, services, machines, projects, testimonials, clients** | `src/data/content/*.json` (one file per section), or edit them at `/admin/` |
| Order steps shown to staff and clients | `src/config/order-steps.js` |
| Order database and security rules | `supabase/schema.sql` |
| **Form endpoint, Google Analytics, Meta Pixel, shop link, map, domain** | `src/config/site.config.js` |
| **All photos** | `public/images/` |
| Pages | `src/pages/` |
| Reusable parts (Header, Footer, ServiceCard, MachineCard, BeforeAfterSlider, Gallery, QuoteForm, WhatsAppButton, StatsCounter, Logo…) | `src/components/` |
| Colours, fonts, spacing | `src/styles/global.css` |

## Editing content

The easiest way is the admin panel at `/admin/`. To edit by hand, open the matching file in `src/data/content/` (business, home, services, testimonials, unit, work, about, contact) in any text editor (VS Code is easiest: it warns you if a comma or quote is missing).

- Change only the text **between quotes**.
- Anything in `[square brackets]` is a placeholder that still needs real information. The site shows placeholders highlighted in yellow so they are easy to spot. Search the file for `[` to find them all.
- **Stats** (About page): replace `"[year]"` with a plain number like `"2012"`. Numbers count up on scroll.
- **Machines**: copy one `{ ... }` block in `unit.json` → `machines`, paste it after a comma, edit it. Delete a block to remove a machine.
- **Projects** (Work page): each item in `work.json` → `items` has a `category` (`in-store`, `signage`, `outdoor`, `events`, `print`), a caption and a photo.
- **Client logos**: in `home.json` → `clients`, set `"logo": "/images/client-name.png"`. Logos show greyscale and turn colour on hover.
- **Testimonials**: in `testimonials.json` or *Admin → Website pages → Client testimonials*. Only add real quotes from real clients, with their permission.
- **Video** (Our Unit page): put the YouTube video ID (the part after `v=` in the link) in `unit.json` → `video.youtubeId`.
- **Working hours / registrations (GST, MSME) / social links**: in `business.json`. Also add hours to `openingHours` in `site.config.js` so Google shows them.

## Replacing photos

Every picture spot currently shows a **3D illustration** in the brand colours, rendered with three.js by `scripts/render3d/`. `IMAGE-PROMPTS.md` lists every file and says which ones need **real photos of your own work** (Work page, case studies, Our Unit, About, before/after) and which generic scenes can stay 3D or use a realistic image.

1. Take the real photo. Landscape (4:3) works best; the founder photo is portrait (4:5).
2. Copy it into `public/images/` with the same name as the image it replaces, but ending in `.jpg`, e.g. `work-signage-1.jpg`.
3. Run `npm run optimize-images`. This writes a compressed `work-signage-1.webp` (max 1920 px wide) over the 3D version, so no file path needs changing.
4. In the admin panel (or the file in `src/data/content/`), give that image a real `"alt"` (what is in the photo, for Google and screen readers) and delete its `"label"` line.
5. You can delete the `.jpg` afterwards; only the `.webp` is used.

**Re-rendering the 3D images (developers, optional).** Scenes are defined in `scripts/render3d/scenes.js`. Install the extra tools once with `npm i --no-save three@0.169.0 playwright && npx playwright install chromium`, then run `node scripts/render3d/render.mjs` (all images that still have a `"label"`) or `node scripts/render3d/render.mjs shop-front` (only matching files). Images without a `"label"` (your real photos) are never touched. For a quick plain labelled box instead, point the new entry at a `.svg` name and run `node scripts/make-placeholders.mjs`.

Logo: `src/components/Logo.astro` (inline SVG, light and dark versions). Standalone copies are in `public/images/logo-light.svg` and `logo-dark.svg`; they use the Poppins font, so convert text to outlines in a design tool before sending them to a printer. Social share image: `public/images/og-default.png` (1200×630).

## Blog

Posts are Markdown files in `src/content/blog/`. To add one, copy an existing file, rename it (the file name becomes the URL), and edit:

- `title`, `description` (used for Google and social sharing)
- `date` (and `updated` when you revise a post)
- `cover`: image and alt text
- `service`: the slug of the related service page, so the post shows on that page
- `faq`: 2–4 short questions and answers; these appear as "Quick answers" and are marked up for Google and AI assistants

Write the body in plain Markdown (`##` for headings, `-` for lists). New posts appear automatically on the blog page, the home page, the related service page, `sitemap.xml`, `rss.xml` and `llms.txt`.

## Quote form

1. Create a free account at [formspree.io](https://formspree.io) with `msgraphicsstudio@gmail.com` and create a form.
2. Copy the form endpoint (looks like `https://formspree.io/f/abcdwxyz`) into `formEndpoint` in `src/config/site.config.js`.
3. Rebuild and deploy. Submissions arrive by email.

Notes:
- File uploads on Formspree need a paid plan. On the free plan, the form still works; the file is just not attached. Any other service that accepts a normal form POST (Getform, Basin, your own PHP script) also works.
- Spam protection: a hidden honeypot field (`_gotcha`) that bots fill in and people don't.
- Until an endpoint is added, the form validates and then offers "Send on WhatsApp instead", which opens WhatsApp with all the form details filled in.
- Links can pre-select a service: `/contact/?service=Bulk%20printing`. Each service page has the form with its service already selected.

## Analytics

In `src/config/site.config.js`:
- `ga4Id`: your Google Analytics 4 ID (`G-XXXXXXXXXX`)
- `metaPixelId`: your Meta Pixel ID

Scripts load only when an ID is filled in. Events tracked automatically:
- `quote_form_submit` (GA4) / `Lead` (Pixel) when the form is sent
- `whatsapp_click` (GA4) / `Contact` (Pixel) on any WhatsApp button or the form's WhatsApp option
- `call_click` on phone links

In GA4, mark `quote_form_submit` and `whatsapp_click` as key events (Admin → Events).

## SEO and AI search

- `llms.txt` (generated from the content files and the blog) gives AI assistants like ChatGPT, Claude, Perplexity and Gemini an accurate summary of the business to cite.
- `robots.txt` explicitly allows Google, Bing and the main AI crawlers.
- Schema on every page: LocalBusiness (with founding year, team size, areas served, services, hours), WebSite, BreadcrumbList; FAQPage on the home page, service pages and blog posts; BlogPosting on articles.
- After launch: add the site to Google Search Console and Bing Webmaster Tools and submit `/sitemap.xml`; create or claim the Google Business Profile with the same name, address and phone as the site.

- Each page has its own title, description and Open Graph tags (service pages: `metaTitle` / `metaDescription` in `services.json`).
- LocalBusiness schema (JSON-LD) is on every page; FAQ schema on service pages (only for answers without placeholders).
- `sitemap.xml` and `robots.txt` are generated automatically from `siteUrl`.
- Set the exact map pin (`geo`) and your Google Business map link (`mapEmbedUrl`) in `site.config.js`.

## Deploying

**Netlify (easiest):** push this folder to a GitHub repository, then in Netlify choose "Add new site → Import from Git". Settings are already in `netlify.toml` (build `npm run build`, publish `dist`). Or run `npm run build` and drag the `dist` folder onto app.netlify.com/drop.

**Vercel / Cloudflare Pages:** import the repository; they detect Astro automatically.

**GitHub Pages:** use the official Astro GitHub Action (see docs.astro.build → Deploy → GitHub Pages). If the site lives at `username.github.io/repo` instead of your own domain, set `base: '/repo'` in `astro.config.mjs`.

**Any web host (cPanel etc.):** run `npm run build` and upload the contents of `dist/` to `public_html`.

Point your domain at the host and make sure `siteUrl` in `site.config.js` matches it. If the existing shop runs on the same domain at `/shop`, keep it on its current host and put this site on the main domain, or change `shopUrl`.
