// Generates dist/service-worker.js after `astro build` (see package.json "build").
// Same URL as the old Eleventy worker, so phones that installed the old one get this one on their next visit.
import { generateSW } from 'workbox-build';

const { count, size, warnings } = await generateSW({
  globDirectory: 'dist',
  // Precache: the app shell (CSS/JS/Latin font), offline page, manifest, icons. No HTML pages: precached pages are
  // answered from the cache first, so after a deploy a returning visitor would see the old home page once (and could
  // miss a same-day "Kein Training" notice). Pages go network-first below; offline they come from that cache.
  globPatterns: [
    '_astro/*.{css,js}',
    '_astro/archivo-latin-*.woff2',
    'offline/index.html',
    'manifest.json',
    'favicon.ico',
    'images/Logo.svg',
    'images/icons/manifest-icon-*.png',
  ],
  globIgnores: ['admin/**', 'service-worker.js'],
  swDest: 'dist/service-worker.js',
  inlineWorkboxRuntime: true, // one file, no workbox-*.js chunk, no CDN (the old worker loaded Workbox from Google)
  skipWaiting: true, // new versions take over at once, nobody stays on old pages
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  sourcemap: false,
  navigateFallback: null,
  runtimeCaching: [
    {
      // Pages: network first, so new posts show at once; cached copy or the offline page without network.
      urlPattern: ({ request, url }) => request.mode === 'navigate' && !url.pathname.startsWith('/admin'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 4,
        expiration: { maxEntries: 50 },
        precacheFallback: { fallbackURL: '/offline/index.html' },
      },
    },
    {
      // Photos: cache first, but with a limit (the old worker cached images forever).
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600, purgeOnQuotaError: true } },
    },
    {
      // Korean font subsets (many small files, only a few are used): cache on demand.
      urlPattern: ({ request }) => request.destination === 'font',
      handler: 'CacheFirst',
      options: { cacheName: 'fonts', expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 3600 } },
    },
  ],
});

for (const w of warnings) console.warn('[sw]', w);
console.log(`[sw] service-worker.js: ${count} files precached, ${(size / 1024).toFixed(0)} KiB`);
