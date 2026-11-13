// Code of conduct (src/content/conduct.json, edited in the CMS): each rule with its Korean numeral and German text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const conduct = JSON.parse(readFileSync(new URL('../src/content/conduct.json', import.meta.url), 'utf8'));

test('conduct.json has a German title', () => {
  assert.ok(conduct.de?.title?.trim(), 'de.title');
});

test('conduct.json rules are complete (German needed, English optional: falls back to German)', () => {
  assert.ok(conduct.rules.length >= 1);
  for (const [i, r] of conduct.rules.entries()) {
    assert.match(r.sign, /^[가-힣]+$/, `rule ${i + 1}: sign is Hangul`);
    assert.ok(r.word?.trim(), `rule ${i + 1}: word`);
    assert.ok(r.de?.title?.trim(), `rule ${i + 1}: de.title`);
    assert.ok(r.de?.text?.trim(), `rule ${i + 1}: de.text`);
  }
});
