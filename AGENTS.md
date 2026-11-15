## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Site rules

- **Notices get `data-nosnippet`.** Any text injected on many pages that is not the page's own content (closure banner, beta banner, language note, announcements, cookie or status bars) goes inside a `<div data-nosnippet>` (or `span`/`section`; Google ignores the attribute on `aside`, `p` and others). Reason: in Nov 2026 Google showed the sitelink of `/category/kuksoolwon/` as "Fällt aus", the text of the closure banner. `tests/nosnippet.test.ts` enforces this for everything `Base.astro` renders before `<main>`. For a notice placed elsewhere, add it to that test.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
