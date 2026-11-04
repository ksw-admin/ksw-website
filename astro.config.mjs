// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { markdownBlocks } from './src/lib/markdown-blocks.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.kuk-sool-won-griepentrog.de',
  // Astro's default Markdown processor, plus the report blocks: video player, album tile (src/lib/markdown-blocks.ts).
  markdown: { processor: satteri({ mdastPlugins: [markdownBlocks] }) },
  integrations: [
    sitemap({
      // Untranslated English pages (noindex) and redirect pages are removed after the build
      // by scripts/netlify-redirects.mjs, which reads each page's robots tag.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.includes('/offline/') && !path.includes('/404');
      },
    }),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    // German keeps today's URLs (/category/kuksoolwon, /articles/...); English lives under /en/
    routing: { prefixDefaultLocale: false, fallbackType: 'rewrite' },
    // Untranslated English pages show the German content with English navigation and a note (Base.astro);
    // they point to the German page as canonical and are noindex, so no duplicate content.
    fallback: { en: 'de' },
  },
});
