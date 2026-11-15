// Checks the real training times (src/content/schedule.json), as edited in the CMS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type Slot = { id: string; discipline: string; days: string[]; from: string; to: string; ageMin?: number; ageMax?: number };
const slots = JSON.parse(readFileSync(new URL('../src/content/schedule.json', import.meta.url), 'utf8')).slots as Slot[];
const ksw = slots.filter((s) => s.discipline === 'kuksoolwon');

test('Kuk Sool Won groups cover every age from the youngest group to 80, without gaps or overlaps', () => {
  const youngest = Math.min(...ksw.map((s) => s.ageMin ?? Infinity));
  for (let age = youngest; age <= 80; age++) {
    const hits = ksw.filter((s) => age >= (s.ageMin ?? Infinity) && age <= (s.ageMax ?? Infinity));
    assert.equal(hits.length, 1, `age ${age} matches ${hits.length} groups`);
  }
});

test('group ids are unique (the timetable selects a group by its id)', () => {
  const ids = slots.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, `duplicate id in ${ids.join(', ')}`);
});

test('groups on the same day do not overlap in time', () => {
  for (const a of slots)
    for (const b of slots)
      if (a !== b && a.discipline === b.discipline)
        for (const d of a.days.filter((x) => b.days.includes(x)))
          assert.ok(a.to <= b.from || b.to <= a.from, `${a.id} and ${b.id} overlap on ${d}`);
});
