// Sitemap <lastmod>: posts by their date, home and post list by the newest post, other pages none.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lastmodFor, readPostDates } from '../src/lib/sitemap-dates.ts';

const dates = new Map([
  ['2026-05-31-new-generation-turnier', '2026-05-31'],
  ['2026-10-24-best-fighter', '2026-10-24'],
  ['2022-01-03-the-way-of-the-warrior´s-seminar', '2022-01-03'],
]);

test('posts get their own date, also in English and with encoded characters', () => {
  assert.equal(lastmodFor('/articles/2026-05-31-new-generation-turnier/', dates), '2026-05-31');
  assert.equal(lastmodFor('/en/articles/2026-05-31-new-generation-turnier/', dates), '2026-05-31');
  assert.equal(lastmodFor('/articles/2022-01-03-the-way-of-the-warrior%C2%B4s-seminar/', dates), '2022-01-03');
});

test('home page and post list: newest post; other pages: none', () => {
  for (const p of ['/', '/en/', '/articles/', '/en/articles/']) assert.equal(lastmodFor(p, dates), '2026-10-24', p);
  for (const p of ['/faq/', '/dates/', '/category/kuksoolwon/', '/other/imprint/']) assert.equal(lastmodFor(p, dates), undefined, p);
});

test('every German post has a readable date', () => {
  const real = readPostDates(new URL('../src/content/news/de', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  assert.ok(real.size > 0);
  for (const [slug, d] of real) assert.match(d, /^\d{4}-\d{2}-\d{2}$/, slug);
});
