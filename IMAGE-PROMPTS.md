# Image guide

Every picture on the site is currently a **3D illustration** rendered in the brand colours (navy, magenta, yellow, cyan). They are honest placeholders: they show the kind of work you do without pretending to be a real job.

Some spots should get **real photos of your own work** as soon as you have them, because customers will read them as proof. Others can stay 3D, or be swapped for a **realistic AI image or stock photo** of a generic scene.

## How to swap an image

1. Save the new image in `public/images/` as a `.jpg` with the file name shown below (for example `work-signage-1.jpg`). Landscape 4:3 works best; the founder photo is portrait 4:5.
2. Run `npm run optimize-images`. This writes `work-signage-1.webp` over the 3D version.
3. In the admin panel (`/admin/`) or the file in `src/data/content/`, find that image, write a real `"alt"` (what is in the photo) and delete its `"label"` line so the 3D renderer never overwrites it.

## 1. Real photos needed (your own unit, team and jobs)

These appear on the Work page, case studies, Our Unit and About. Use only real photos here. A generated image in these spots would show customers work you did not do.

| File | What to shoot |
|---|---|
| `unit-printing-floor` | Printing floor |
| `unit-large-format-printer` | Large-format printer |
| `unit-fabrication-workshop` | Fabrication workshop |
| `unit-dispatch` | Dispatch area |
| `unit-entrance` | Unit entrance |
| `work-instore-1` | In-store project 1 |
| `work-instore-2` | In-store project 2 |
| `work-signage-1` | Signage project 1 |
| `work-signage-2` | Signage project 2 |
| `work-outdoor-1` | Hoarding project 1 |
| `work-outdoor-2` | Vehicle branding project |
| `work-events-1` | Event project 1 |
| `work-events-2` | Exhibition stall project |
| `work-print-1` | Print project 1 |
| `work-print-2` | Corporate gifts project |
| `work-instore-3` | In-store project 3 |
| `work-signage-3` | Office signage project |
| `shop-front-before` | Shop front – BEFORE |
| `shop-front-after` | Shop front – AFTER |
| `store-interior-before` | Store interior – BEFORE |
| `store-interior-after` | Store interior – AFTER |
| `case-1-photo-1` | Case study 1 – photo 1 |
| `case-1-photo-2` | Case study 1 – photo 2 |
| `case-1-photo-3` | Case study 1 – photo 3 |
| `case-2-photo-1` | Case study 2 – photo 1 |
| `case-2-photo-2` | Case study 2 – photo 2 |
| `case-3-photo-1` | Case study 3 – photo 1 |
| `case-3-photo-2` | Case study 3 – photo 2 |
| `case-3-photo-3` | Case study 3 – photo 3 |
| `case-3-photo-4` | Case study 3 – photo 4 |
| `about-team-at-unit` | Team at the unit |
| `founder-portrait` | Founder portrait |

## 2. Generic scenes (3D is fine; realistic image optional)

These illustrate a service in general. Keep the 3D version, or replace it with a realistic AI image or a licensed stock photo.

| File | Scene |
|---|---|
| `home-hero-installation` | Installation or printing machine in action (hero background) |
| `service-printing` | Printed brochures, cards & flex |
| `printing-visiting-cards` | Visiting cards & stationery |
| `printing-brochures` | Brochures & catalogues |
| `printing-packaging` | Packaging & labels |
| `printing-flex-vinyl` | Flex & vinyl printing |
| `service-in-store` | In-store branding / POSM at a counter |
| `instore-standee-dangler` | Standees & danglers |
| `instore-counter-display` | Counter top display |
| `instore-window-graphics` | Window graphics |
| `instore-gondola-branding` | Gondola / end-cap branding |
| `service-signage` | Glow sign / shop front signage |
| `signage-glow-sign` | Glow sign board |
| `signage-acp-led-letters` | ACP with LED letters |
| `signage-shutter-branding` | Shutter branding |
| `signage-office-directional` | Office / directional signage |
| `service-hoardings` | Hoarding / unipole |
| `outdoor-hoarding` | Hoarding mounting |
| `outdoor-pole-kiosk` | Pole kiosks |
| `outdoor-vehicle-branding` | Vehicle branding |
| `outdoor-site-branding` | Construction-site branding |
| `service-events` | Event stage / exhibition stall |
| `events-stage-backdrop` | Stage & backdrop |
| `events-exhibition-stall` | Exhibition stall |
| `events-rwa-activation` | RWA / mall activation |
| `events-canopy-promo-table` | Canopy & promo table |
| `service-corporate` | Corporate gift kit / office branding |
| `corporate-office-branding` | Office interior branding |
| `corporate-gift-kit` | Corporate gift kit |
| `corporate-tshirts-mugs` | T-shirts & mugs |
| `corporate-brand-identity` | Logo / brand identity work |
| `machine-offset-press` | Offset press |
| `machine-digital-press` | Digital press |
| `machine-large-format-printer` | Large-format flex/vinyl printer |
| `machine-uv-printer` | Eco-solvent / UV printer |
| `machine-cutting-cnc-laser` | Cutting plotter / CNC / laser |
| `machine-lamination` | Lamination & finishing |
| `machine-fabrication-tools` | Fabrication tools |

## Prompts

**To make more images in the same 3D style** (for new pages, social posts or ads), start the prompt with:

> 3D isometric diorama, soft clay render, rounded shapes, soft studio lighting and shadows, warm off-white background, brand colours navy #14213D, magenta #E6007E, yellow #FFC20E and cyan #00A0E3, small stylised people, no real brand logos, no readable text except "MS",

then add the scene from the table, for example: *"…a shop front in Delhi with a new glow sign board and a fitter on a ladder"*.

**For a realistic image** of a generic scene, use:

> realistic photo, Delhi, India, natural daylight, 35mm, shallow depth of field, no brand logos, no readable text, no watermark,

then the scene. Check that hands, faces and any text look right before using it, and never use a realistic AI image in section 1.

The site's own 3D images are rendered by `scripts/render3d/` (see the README) and can be re-rendered at any time.
