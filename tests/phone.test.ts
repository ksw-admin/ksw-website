import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { phoneLabel, telHref } from '../src/lib/phone.ts';

test('German numbers in the notations used on the site', () => {
  assert.equal(telHref('0170 - 90 42 408'), 'tel:+491709042408'); // site.json, mobile
  assert.equal(telHref('020 65 - 67 96 31'), 'tel:+492065679631'); // site.json, landline
  assert.equal(telHref('02065 - 61 256'), 'tel:+49206561256'); // sponsor
  assert.equal(telHref('+49 (0)203 44005952'), 'tel:+4920344005952'); // sponsor: "(0)" must go
  assert.equal(telHref('0049 2065 679631'), 'tel:+492065679631');
  assert.equal(telHref('+43 1 234567'), 'tel:+431234567'); // other countries stay as they are
});

test('every phone number in site.json gives a valid tel: link', () => {
  const site = JSON.parse(readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'));
  for (const p of site.phones) assert.match(telHref(p.value), /^tel:\+\d{8,15}$/, p.value);
});

test('shown number: dash groups become spaces, nothing else changes', () => {
  assert.equal(phoneLabel('0170 - 90 42 408'), '0170 90 42 408');
  assert.equal(phoneLabel('02065 - 679631'), '02065 679631');
  assert.equal(phoneLabel('+49 (0)203 44005952'), '+49 (0)203 44005952');
});
