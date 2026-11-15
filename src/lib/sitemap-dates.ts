// <lastmod> for the sitemap (astro.config.mjs › sitemap serialize). Only where the date is known and honest:
// a post: its date; the home page and the post list: the newest post (they show it). Everything else: none,
// because Google ignores lastmod once it proves unreliable. Pure; tested in tests/sitemap-dates.test.ts.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Post slug (file name without .md) -> date YYYY-MM-DD, from the German posts' frontmatter. */
export function readPostDates(dir: string): Map<string, string> {
  const dates = new Map<string, string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const m = /^date:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(path.join(dir, file), 'utf8'));
    if (m) dates.set(file.slice(0, -3).normalize('NFC'), m[1]);
  }
  return dates;
}

/** lastmod for a URL path ("/articles/<slug>/", "/en/", ...), or undefined. */
export function lastmodFor(urlPath: string, dates: Map<string, string>): string | undefined {
  const p = decodeURIComponent(urlPath).normalize('NFC');
  const post = /^\/(?:en\/)?articles\/([^/]+)\/$/.exec(p);
  if (post) return dates.get(post[1]);
  if (['/', '/en/', '/articles/', '/en/articles/'].includes(p)) {
    let newest: string | undefined;
    for (const d of dates.values()) if (!newest || d > newest) newest = d;
    return newest;
  }
  return undefined;
}
