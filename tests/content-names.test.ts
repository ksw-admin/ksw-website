// Content file names become addresses (/articles/<file name>/). Netlify answers every address in lower case, so a
// capital letter in a file name gives a page whose canonical address redirects to itself in lower case, and Google
// does not index it (seen in Search Console, 2026-11-13: 2022-01-02-Kampfrichter-Lehrgang).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

const FOLDERS = ['news/de', 'news/en', 'faq/de', 'faq/en', 'disciplines/de', 'pages/de', 'sponsors'];

test('content file names have no capital letters', () => {
  for (const folder of FOLDERS) {
    let names: string[];
    try {
      names = readdirSync(new URL(`../src/content/${folder}/`, import.meta.url)).filter((n) => n.endsWith('.md'));
    } catch {
      continue; // folder not there (e.g. no English news yet)
    }
    for (const name of names) assert.equal(name, name.toLowerCase(), `src/content/${folder}/${name}`);
  }
});
