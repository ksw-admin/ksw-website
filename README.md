# kuk-sool-won-griepentrog.de

Website of the Kampfkunst Academy Peter Griepentrog (Kuk Sool Won, Tai Chi, Qi Gong) in Duisburg-Rheinhausen.
Static site built with [Astro](https://astro.build), content edited with [Decap CMS](https://decapcms.org), hosted on Netlify.

## Develop

```sh
nvm use            # Node 26 (.nvmrc)
npm ci
npm run dev        # site on http://localhost:4321
npm run cms        # second terminal: local CMS backend, then open /admin/ (no login needed)
npm run check      # type check (astro check)
npm run build      # astro build + Netlify redirects (scripts/netlify-redirects.mjs) + service worker (scripts/build-sw.mjs)
```

CI (`.github/workflows/ci.yml`) runs the type check, the build and an output check on every push and pull request.
Netlify does the deploys.

## Where things live

| What | Where |
|---|---|
| News, old articles | `src/content/news/de/`, `src/content/articles/de/` (photos in `images/` next to them) |
| Kuk Sool Won / Tai Chi pages | `src/content/disciplines/de/` |
| Training times | `src/content/schedule.json` (week planner, age finder, discipline pages, offline page) |
| Contact, credentials, social links, video | `src/content/site.json` |
| Impressum, Datenschutz | `src/content/pages/de/` |
| Interface texts (de/en) | `src/i18n/ui.ts` |
| CMS config | `public/admin/config.yml` (branch: `astro-redesign` until the merge, then `main`) |
| Design tokens | `src/styles/global.css` |

## CMS

- Online (GitHub login via Netlify): changes are drafts (Entwurf → In Prüfung → Bereit → Veröffentlichen). Each draft is a
  pull request; CI checks it and Netlify builds a deploy preview, linked in the CMS as "Vorschau ansehen".
- Locally (`npm run cms`): no drafts, saving writes the files directly.
- The live preview in the editor (`src/admin/preview.ts`) uses the site's rules (`src/lib/text.ts`), CSS and font.
  Only the layout of the list row and the post page is written twice; the deploy preview is the exact result.
- **Startseite** (`src/content/home.json`): headline, intro, both discipline texts, photos with captions, master intro,
  contact heading, German and English side by side. Times and numbers on the home page come from the training times.

### Translating

- In the CMS, open a post, the Kuk Sool Won / Tai Chi page or the Startseite and switch to the **en** tab. Translate
  the text fields (title, short text, report, photo description). Date, type, place, medals, photo and gallery are
  only in German; the English page uses them.
- Files: `src/content/<collection>/en/<same name>.md`. An English post needs a title and a short text, else the site
  ignores it and shows German.
- Every German page also exists under `/en/…`. Untranslated, it shows the German text with English navigation and the
  note "This page is only available in German" (noindex, canonical to German). Translated, it is a normal English
  page with hreflang links and is listed in the sitemap.
- Impressum and Datenschutz stay German only.

## Design system

`design-system/` is the design system (brand book, tokens, fonts, logo, component previews). It is the source;
the claude.ai Design System artifact is its published view: https://claude.ai/artifact/4vfpAacfAhcZxVURsH5WHo

- Start with `design-system/README.md` (the brand book). Colours, type, spacing: `design-system/tokens.json`.
- `tests/design-tokens.test.ts` checks that every colour in `tokens.json` matches `src/styles/global.css` (light and
  dark). Change a colour in both places, or CI fails.
- To republish after a change: ask Claude Code to publish `design-system/` to the artifact URL above (the folder maps
  1:1 to the artifact's `project/` files; `design-system.json` is the index and goes last). The logo is an upload
  in the artifact; `assets/Logos/Logo.svg` is the same file.
- The folder is not part of the website build.

## Notes

- Photos are optimized at build time (`astro:assets`); a reference to a missing image fails the build.
- Untranslated English URLs redirect to the German page (`i18n.fallback`); the sitemap lists only real pages.
- The service worker keeps the old URL `/service-worker.js`, so phones with the old site's worker update to the new one.
- YouTube loads only after a click (privacy); fonts are self-hosted.
