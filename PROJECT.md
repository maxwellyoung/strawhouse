# Strawhouse Website — Project Spec

## Overview

Strawhouse is a local art gallery based in Mt Eden, Auckland. The website will serve as a minimal, archival platform to document past and current shows, provide basic contact info, and link to the gallery's Instagram.

**Core goals:**

- Minimal, fast-loading site
- Artistically neutral — lets the artwork speak
- Easy for non-technical editors to add/update shows via Sanity Studio
- Archive of past exhibitions with images, press text, and details
- Simple "About" page with address, hours, email, Instagram
- Optional hero/homepage → can just redirect to archive

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript, TailwindCSS)
- **Sanity CMS** (Studio embedded at `/studio`)
- **@sanity/client** + GROQ queries
- **@portabletext/react** for rich text
- Deployed to **Vercel**
- Public dataset (read without token), private write access via Sanity Studio

---

## Content Model (Sanity Schemas)

### `show` (document)

Represents one exhibition.
Fields:

- `title` (string, required)
- `subtitle` (string, optional)
- `artists` (array of strings)
- `start` (date, required)
- `end` (date)
- `venue` (string, default "Strawhouse")
- `press` (array of blocks — rich text)
- `hero` (image with hotspot)
- `gallery` (array of images with optional captions)
- `links` (array of `{label, url}`)
- `slug` (slug, from title, required)
- `year` (number, read-only, auto from `start`)

### `site` (document)

Singleton for site-wide info.
Fields:

- `aboutBlurb` (rich text)
- `address` (string)
- `hours` (string)
- `email` (string)
- `instagram` (url)

---

## Pages & Routes

### `/archive`

- Lists all shows (most recent first)
- Each item: title, start date, link to `/shows/[slug]`

### `/shows/[slug]`

- Full show detail: title, subtitle, artists, press (rich text), gallery images

### `/about`

- Displays site settings: about blurb, address, hours, email, instagram link

### `/studio`

- Embedded Sanity Studio for content management

### `/` (root)

- Redirects to `/archive` (minimal homepage)

---

## Folder Structure

```
src/
  app/
    (site)/
      archive/page.tsx
      shows/[slug]/page.tsx
      about/page.tsx
      page.tsx  # redirect
    studio/[[...index]]/page.tsx  # Sanity Studio
  lib/
    sanity.client.ts
    sanity.queries.ts
  styles/
    globals.css
sanity/
  schemaTypes/
    show.ts
    site.ts
    index.ts
  sanity.config.ts
```

---

## Queries (GROQ)

```ts
export const SHOW_LIST = groq`*[_type=="show"] | order(start desc){
  title, "artists": artists[], start, end, "slug": slug.current, hero
}`;

export const SHOW_BY_SLUG = groq`*[_type=="show" && slug.current==$slug][0]{
  title, subtitle, artists, start, end, press, hero,
  gallery[]{..., "url": asset->url}, links, "slug": slug.current, year
}`;

export const SITE_SINGLETON = groq`*[_type=="site"][0]`;
```

---

## Sanity Environment Variables

In `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-10-01
# For seeding/writes from scripts (keep private, do not expose publicly)
SANITY_API_TOKEN=xxxxx
```

---

## Design Notes

- Layout: centered, generous white space, grid for gallery images
- Typography: clean sans-serif for UI, optional serif for body text
- Color: mostly black/white, allow images to dominate
- Tailwind utility classes for rapid iteration
- Mobile-first, fully responsive
- Light/dark mode optional later

---

## MVP Checklist

- [x] Next.js scaffold with Tailwind
- [x] Sanity Studio at `/studio`
- [x] Show schema + site schema
- [x] Queries + client in `lib/`
- [x] Archive page lists shows
- [x] Show detail page
- [x] About page from site singleton
- [ ] Styling & layout pass
- [ ] Deploy to Vercel
- [ ] Populate content for launch

---

## References

- [Envy Gallery](https://www.envy6011.net)
- [Treadler Gallery](https://treadler-gal.net)
- [Final Hot Desert](https://finalhotdesert.co.uk)
- [Strawhouse Instagram](https://instagram.com/strawhouse4)
- Address: 15 Tawari St, Mt Eden
- Email: [strawhouse1024@gmail.com](mailto:strawhouse1024@gmail.com)
