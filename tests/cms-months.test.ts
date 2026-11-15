// CMS month select (Termine › ungefähres Datum): generated window, and the config template it is filled into.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { approxMonthOptions, optionsYaml } from '../src/lib/cms-months.ts';

test('window: 12 months back to 36 ahead, across year ends, German labels', () => {
  const o = approxMonthOptions('2026-11-09');
  assert.equal(o.length, 49);
  assert.deepEqual(o[0], { label: 'November 2025', value: '2025-11' });
  assert.deepEqual(o[12], { label: 'November 2026', value: '2026-11' });
  assert.deepEqual(o[14], { label: 'Januar 2027', value: '2027-01' });
  assert.deepEqual(o.at(-1), { label: 'November 2029', value: '2029-11' });
  assert.deepEqual(approxMonthOptions('2027-01-31', 1, 0).map((x) => x.value), ['2026-12', '2027-01']);
});

test('the config template has the placeholder once and is valid YAML once filled', () => {
  const tpl = readFileSync(new URL('../src/admin/config.yml', import.meta.url), 'utf8');
  assert.equal(tpl.split('__APPROX_MONTH_OPTIONS__').length, 2);
  const cfg = parse(tpl.replace('__APPROX_MONTH_OPTIONS__', optionsYaml(approxMonthOptions('2026-11-09'))));
  const events = cfg.collections.find((c: { name: string }) => c.name === 'settings').files.find((f: { name: string }) => f.name === 'events');
  const approx = events.fields[0].fields.find((f: { name: string }) => f.name === 'approx');
  const month = approx.fields.find((f: { name: string }) => f.name === 'month');
  assert.equal(month.options.length, 49);
  assert.deepEqual(month.options[12], { label: 'November 2026', value: '2026-11' });
});
