// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { blockImageSizes, markdownBlocks } from './src/lib/markdown-blocks.ts';
import { lastmodFor, readPostDates } from './src/lib/sitemap-dates.ts';

const postDates = readPostDates('./src/content/news/de');

// https://astro.build/config
export default defineConfig({
  site: 'https://www.kuk-sool-won-griepentrog.de',
  // Photos inside Markdown texts (report blocks, images in reports) get several sizes and a srcset like the
  // components; components that set their own widths/sizes keep them.
  image: { layout: 'constrained' },
  // Astro's default Markdown processor, plus the report blocks: video player, album tile (src/lib/markdown-blocks.ts).
  markdown: { processor: satteri({ mdastPlugins: [markdownBlocks], hastPlugins: [blockImageSizes] }) },
  integrations: [
    sitemap({
      // Untranslated English pages (noindex) and redirect pages are removed after the build
      // by scripts/netlify-redirects.mjs, which reads each page's robots tag.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.includes('/offline/') && !path.includes('/404');
      },
      // <lastmod> only where it is known: posts, home page and post list (src/lib/sitemap-dates.ts).
      serialize: (item) => {
        const lastmod = lastmodFor(new URL(item.url).pathname, postDates);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
  // Video.js (loaded only when someone plays the home video, ~50 language chunks) goes to _astro/vjs/, which the
  // service worker leaves out of its precache (scripts/build-sw.mjs).
  vite: {
    environments: {
      client: {
        build: {
          rollupOptions: {
            output: {
              chunkFileNames: (chunk) =>
                chunk.moduleIds.some((id) => id.includes('@videojs')) ? '_astro/vjs/[name].[hash].js' : '_astro/[name].[hash].js',
            },
          },
        },
      },
    },
  },
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
