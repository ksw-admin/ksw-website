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
| News (all posts; the old "Artikel" moved in 2026-11-04, all post pages at `/articles/<slug>/`; old `/aktuelles/<slug>/` URLs 301 there via `public/_redirects`) | `src/content/news/de/` (photos in `images/` next to them) |
| Kuk Sool Won / Tai Chi pages | `src/content/disciplines/de/` |
| Training times | `src/content/schedule.json` (week planner, age finder, discipline pages, offline page) |
| Contact, credentials, social links, video | `src/content/site.json` |
| Impressum, Datenschutz | `src/content/pages/de/` |
| FAQ | `src/content/faq/de/` (one file per question, `order` sets the position; English in `.../en/`) |
| Training closures ("Kein Training" banner) | `src/content/closures.json` (banner from 14 days before; also removed from the calendar feeds) |
| Upcoming dates (Termine) | `src/content/events.json` (CMS: Einstellungen › Termine): next 3 in "Demnächst" in the home news section (`/#dates`; none upcoming: one-line empty state "keine Turniere oder Prüfungen angekündigt"), and in every calendar feed. "Abgesagt" (cancelled) keeps the date in the list, struck through, until its day; the feeds send it as STATUS:CANCELLED with the same UID |
| Calendar page | `/dates/` (CMS switch: Einstellungen › Kontakt und Allgemeines › Kalender-Seite, `site.json › calendarPage`): training, closures and dates for 13 weeks by week, "Später" for anything after, "Früher in <Jahr>" (collapsed, top) for this year's past dates (not cancelled ones); filter by group (`?group=<slot id>`, linked from the selected timetable group), subscribe links live here (under the timetable only when the page is off) and follow the filter; "Anzeigen" switches training and each kind of date on and off (`?show=turnier,pruefung`). Same rules as the feeds (`src/lib/agenda.ts`). Not under `/calendar/` because `_headers` serves that folder as `text/calendar` |
| Weekly rebuild | `netlify/functions/weekly-rebuild.mjs`: Mondays 03:00 UTC, calls a Netlify build hook so the calendar page never runs out of weeks. Production only. **Setup once, after the merge:** Netlify › Build hooks › add hook for `main`, store its URL as env var `REBUILD_HOOK_URL` (secret). Check: Netlify › Logs › Functions › weekly-rebuild shows "build hook answered 200" |
| Videos in texts | CMS: "+" › "Video (YouTube)" in a report (also works as a plain line `[Video: Titel](https://www.youtube.com/watch?v=…)` in any Markdown text). The Sätteri plugin `src/lib/youtube-plugin.ts` turns it into the click-to-load player (nothing loads from Google before the click), logic in `src/lib/youtube.ts`, script `VideoEmbeds.astro`, styles `.yt-embed` in `global.css` |
| Calendar feeds | `/calendar/training.ics` and `/calendar/<group id>.ics`, built from training times + closures (`src/lib/ics.ts`) |
| Links to home page sections | `/#schedule` (timetable), `/#ksw`, `/#taichi`, `/#video`, `/#dates`, `/#news`, `/#master`, `/#contact` (contact, trial lesson); FAQ answers `/faq/#<file name>`, e.g. `/faq/#kalender`. Same with `/en/`. |
| Question form | FAQ page, Netlify Forms, form name `frage`. Notifications: Netlify › Forms. Nothing sent appears on the site by itself. |
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
- Files: `src/content/<collection>/en/<same name>.md`. An English version counts once it has a title; fields not yet
  translated (short text, report) show the German text, marked as German for screen readers.
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
- **Private beta (until the merge):** Netlify split test with 0 % to `astro-redesign`; testers opt in with
  `https://www.kuk-sool-won-griepentrog.de/?beta=1` (snippet injected on the live site in Netlify) and opt out with the
  banner or `/beta/`. Banner, `/beta/` and the `?beta=` switch are only built for the `astro-redesign` branch
  (`src/lib/split-test.ts`; locally `PUBLIC_BETA_PREVIEW=1`). While the test runs, Netlify sets a cookie (`nf_ab`) on
  every visitor. **At the merge:** end the split test (Netlify › Split testing) and remove the injected snippet, then the
  Datenschutz sentence "Diese Website setzt keine Cookies" is true again.
