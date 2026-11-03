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

## Notes

- Photos are optimized at build time (`astro:assets`); a reference to a missing image fails the build.
- Untranslated English URLs redirect to the German page (`i18n.fallback`); the sitemap lists only real pages.
- The service worker keeps the old URL `/service-worker.js`, so phones with the old site's worker update to the new one.
- YouTube loads only after a click (privacy); fonts are self-hosted.
