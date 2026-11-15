// Rule: every notice the layout puts on all pages outside <main> (closure banner, beta banner, language note, any
// future announcement) carries data-nosnippet. Otherwise Google may use its text as snippet or sitelink label:
// in Nov 2026 the sitelink of /category/kuksoolwon/ read "Fällt aus" (closure banner text).
// Google honours data-nosnippet only on div, span and section (not on aside or p), so the test checks the element.
// Header (navigation) is exempt; Footer and MobileBar sit after <main> and are not checked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8');
const EXEMPT = new Set(['Header']);
const SUPPORTED = /<(div|span|section)\b[^>]*\sdata-nosnippet\b/;
const UNSUPPORTED = /<(?!div\b|span\b|section\b)([a-z][\w-]*)\b[^>]*\sdata-nosnippet\b/;

/** Markup only: drop the frontmatter, scripts and styles. */
const markup = (src: string) =>
  src.replace(/^---[\s\S]*?---/, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');

const base = read('layouts/Base.astro');
const beforeMain = base.slice(base.indexOf('<body'), base.indexOf('<main'));

test('site-wide notices before <main> carry data-nosnippet on a div/span/section', () => {
  const parts: [string, string][] = [];
  for (const [, name] of beforeMain.matchAll(/<([A-Z]\w*)\b/g)) {
    if (EXEMPT.has(name)) continue;
    const body = markup(read(`components/${name}.astro`));
    if (!/<[a-z]/.test(body)) continue; // script-only component (e.g. BetaSwitch): nothing visible
    parts.push([`components/${name}.astro`, body]);
  }
  for (const [, block] of beforeMain.matchAll(/(<(aside|div|section|p)\b[\s\S]*?<\/\2>)/g)) parts.push(['layouts/Base.astro (inline notice)', block]);
  assert.ok(parts.length >= 2, 'expected at least the closure banner and the language note');
  for (const [where, body] of parts) {
    assert.match(body, SUPPORTED, `${where}: wrap the notice text in <div data-nosnippet>`);
    const bad = body.match(UNSUPPORTED);
    assert.equal(bad, null, `${where}: data-nosnippet on <${bad?.[1]}> is ignored by Google; put it on a div/span/section`);
  }
});
