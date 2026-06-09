# Gardinovački — new site content (`site/`)

This folder is the **content-as-data definition** of the rebuilt site. It is not a built website — it's the spec a frontend developer (or another agent) renders into actual pages.

All content here is **Serbian** (the live site is bilingual; this rebuild drops the `/sr/` prefix and serves Serbian by default).

## Folder layout

```
site/
├── README.md              # this file
├── sitemap.json           # every page in the new site, its template, its file
├── globals.json           # header, footer, and shared contact-form section
├── components/            # 11 component specs (what each block looks like)
└── pages/                 # 25 page instances composed of components
```

## How a page is structured

```jsonc
{
  "path": "/usluge/vencanja/",
  "template": "T3-service",
  "lang": "sr",
  "meta": { "title": "...", "description": "...", "ogImage": "...", "canonical": "..." },
  "sections": [
    { "component": "standard-banner",          "props": { ... } },
    { "component": "intro-text",               "props": { ... } },
    { "component": "service-carousel-gallery", "props": { ... } }
  ],
  "globalSections": ["header", "footer", "contact-form-section"]
}
```

`sections` are page-specific blocks (in render order). `globalSections` lists keys from `globals.json` that wrap every page — explicit per page so there are no hidden defaults.

## Component model

Each `components/<name>.json` is a self-describing spec with three top-level keys:
- `componentType` — string used in page `sections[].component`
- `description` — what it renders
- `props` — shape of the data the component expects
- `example` — a realistic instance (so a developer can copy-paste and start)

These are intentionally not formal JSON Schema — they're scannable specs, not validators.

## Templates (T1–T8)

| ID | Template | Used by |
|---|---|---|
| T1 | Homepage | `pages/home.json` |
| T2 | Services landing | `pages/usluge.json` |
| T3 | Service | `pages/usluge/{vencanja, rodjendani-i-ostalo, video}.json` |
| T4 | Gallery | `pages/galerija/<slug>.json` (10 examples) |
| T5 | Packages landing | `pages/paketi.json` |
| T6 | Package | `pages/paketi/{family, platinum, gold, silver, mini}.json` |
| T7 | About me | `pages/o-meni.json` |
| T8 | Contact | `pages/kontakt.json` |

A page declares its template via the `template` field. Templates aren't separate files — the section list in each page IS the template instantiation.

## Where the content comes from

Every page in `pages/` is populated from the static crawl in `../data/` (specifically the Serbian variants under `data/pages/sr/` and the language-neutral portfolio gallery pages under `data/pages/portfolio/`). See the plan doc for the per-page source mapping.

## Adding more galleries later

This first cut includes 10 portfolio galleries. To add more:
1. Pick a slug from `../data/extract-summary.json` (the `category: "portfolio"` entries)
2. Add it to `_tools/build.js` in the `GALLERY_SLUGS` array
3. Re-run `node site/_tools/build.js`

## Regenerating

```
node site/_tools/build.js
```

That overwrites `sitemap.json` and every file under `pages/`. Component specs and `globals.json` are hand-authored — the generator does not touch them.

## Known gaps (carried over from the crawl)

- **Instagram feed:** the `instagram-feed` component is a structural spec only; real posts must be fetched at runtime by the rebuilt site (the static crawl couldn't capture the JS-rendered feed)
- **Videos:** the `usluge/video.json` page has the service intro and standard banner, but the live video page didn't expose actual playable embeds in the static crawl — `media-gallery.items` for the video service is a placeholder shape until real video URLs are sourced
- **Spam:** the `ladys.one` link injected on the live homepage is NOT carried into `home.json` — verified by `verify.js`
