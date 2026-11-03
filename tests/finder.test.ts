// Age finder (home page hero). Slots mirror src/content/schedule.json; the last test checks the real file.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { findGroup, clampAge, type FinderSlot } from '../src/lib/finder.ts';

const slots: FinderSlot[] = [
  { id: 'ksw-4-6', discipline: 'kuksoolwon', ageMin: 4, ageMax: 6 },
  { id: 'ksw-7-8', discipline: 'kuksoolwon', ageMin: 7, ageMax: 8 },
  { id: 'ksw-9-11', discipline: 'kuksoolwon', ageMin: 9, ageMax: 11 },
  { id: 'ksw-12-14', discipline: 'kuksoolwon', ageMin: 12, ageMax: 14 },
  { id: 'ksw-15-80', discipline: 'kuksoolwon', ageMin: 15, ageMax: 80 },
  { id: 'taichi-di', discipline: 'taichi', ageMin: null, ageMax: null },
  { id: 'taichi-do', discipline: 'taichi', ageMin: null, ageMax: null },
];
const ids = (r: ReturnType<typeof findGroup>) => r.highlight.map((s) => s.id);

test('every age from 4 to 14 lands in exactly one children group', () => {
  for (let age = 4; age <= 14; age++) {
    const r = findGroup(slots, age);
    assert.equal(r.kind, 'group', `age ${age}`);
    assert.deepEqual(ids(r), [r.kind === 'group' ? r.group.id : ''], `age ${age}`);
  }
});

test('group edges: 6 -> 4-6, 7 -> 7-8, 11 -> 9-11, 12 -> 12-14', () => {
  const group = (age: number) => {
    const r = findGroup(slots, age);
    return r.kind === 'group' ? r.group.id : r.kind;
  };
  assert.equal(group(6), 'ksw-4-6');
  assert.equal(group(7), 'ksw-7-8');
  assert.equal(group(11), 'ksw-9-11');
  assert.equal(group(12), 'ksw-12-14');
});

test('3 years: too young, points to the youngest group, highlights nothing', () => {
  const r = findGroup(slots, 3);
  assert.equal(r.kind, 'tooYoung');
  assert.equal(r.kind === 'tooYoung' && r.first.id, 'ksw-4-6');
  assert.equal(r.kind === 'tooYoung' && r.minAge, 4);
  assert.deepEqual(ids(r), []);
});

test('15 and 80: adult group plus Tai Chi', () => {
  for (const age of [15, 80]) {
    const r = findGroup(slots, age);
    assert.equal(r.kind, 'group');
    assert.deepEqual(ids(r), ['ksw-15-80', 'taichi-di', 'taichi-do'], `age ${age}`);
  }
});

test('14: no Tai Chi yet', () => {
  assert.deepEqual(ids(findGroup(slots, 14)), ['ksw-12-14']);
});

test('81 and older: Tai Chi only', () => {
  const r = findGroup(slots, 81);
  assert.equal(r.kind, 'taichiOnly');
  assert.deepEqual(ids(r), ['taichi-di', 'taichi-do']);
});

test('a group without upper age limit takes everyone above its start', () => {
  const open = slots.map((s) => (s.id === 'ksw-15-80' ? { ...s, ageMax: null } : s));
  const r = findGroup(open, 95);
  assert.equal(r.kind === 'group' && r.group.id, 'ksw-15-80');
});

test('no Kuk Sool Won groups at all: Tai Chi only, no crash', () => {
  const r = findGroup(slots.filter((s) => s.discipline === 'taichi'), 30);
  assert.equal(r.kind, 'taichiOnly');
});

test('stepper input is clamped to 3..95; nonsense falls back to 9', () => {
  assert.equal(clampAge('2'), 3);
  assert.equal(clampAge('120'), 95);
  assert.equal(clampAge(''), 9);
  assert.equal(clampAge('abc'), 9);
  assert.equal(clampAge(12), 12);
});

test('real schedule.json: Kuk Sool Won groups cover 4..80 without gaps or overlaps', () => {
  const real = JSON.parse(readFileSync(new URL('../src/content/schedule.json', import.meta.url), 'utf8')).slots as FinderSlot[];
  for (let age = 4; age <= 80; age++) {
    const hits = real.filter((s) => s.discipline === 'kuksoolwon' && age >= (s.ageMin ?? Infinity) && age <= (s.ageMax ?? Infinity));
    assert.equal(hits.length, 1, `age ${age} matches ${hits.length} groups in schedule.json`);
  }
});
