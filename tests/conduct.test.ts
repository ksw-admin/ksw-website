// Code of conduct (src/content/conduct.json): ten rules, each with its Korean numeral and both languages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const conduct = JSON.parse(readFileSync(new URL('../src/content/conduct.json', import.meta.url), 'utf8'));

test('conduct.json has a title in German and English', () => {
  for (const lang of ['de', 'en']) {
    assert.ok(conduct[lang]?.title?.trim(), `${lang}.title`);
  }
});

test('conduct.json has ten complete rules', () => {
  assert.equal(conduct.rules.length, 10);
  for (const [i, r] of conduct.rules.entries()) {
    assert.match(r.sign, /^[가-힣]+$/, `rule ${i + 1}: sign is Hangul`);
    assert.ok(r.word?.trim(), `rule ${i + 1}: word`);
    for (const lang of ['de', 'en']) {
      assert.ok(r[lang]?.title?.trim(), `rule ${i + 1}: ${lang}.title`);
      assert.ok(r[lang]?.text?.trim(), `rule ${i + 1}: ${lang}.text`);
    }
  }
});
