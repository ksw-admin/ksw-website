// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync } from 'node:fs';

// Real English pages = files under src/pages/en. Everything else under /en/ is a fallback redirect (not in the sitemap).
const enPages = new Set(
  readdirSync('src/pages/en', { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.astro') && !f.includes('['))
    .map((f) => '/en/' + f.replaceAll('\\', '/').replace(/(^|\/)index\.astro$/, '').replace(/\.astro$/, '/')),
);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.kuk-sool-won-griepentrog.de',
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        if (path.includes('/offline/') || path.includes('/404')) return false;
        return !path.startsWith('/en/') || enPages.has(path);
      },
    }),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    // German keeps today's URLs (/category/kuksoolwon, /articles/...); English lives under /en/
    routing: { prefixDefaultLocale: false, fallbackType: 'redirect' },
    // Untranslated English pages forward to the German page (no 404, no duplicate content).
    fallback: { en: 'de' },
  },
});
