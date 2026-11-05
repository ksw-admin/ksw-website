// Calendar page: slots, closures and dates expanded into days (same rules as the calendar feeds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAgenda, byWeek, disciplineLines, mondayOf, weekLabel } from '../src/lib/agenda.ts';
import type { FeedSlot } from '../src/lib/ics.ts';

const kids: FeedSlot = { id: 'ksw-4-6', discipline: 'kuksoolwon', days: ['mo', 'fr'], from: '16:00', to: '17:00', title: 'Kuk Sool Won, 4–6 Jahre' };
const adults: FeedSlot = { id: 'ksw-15-80', discipline: 'kuksoolwon', days: ['mo', 'fr'], from: '20:00', to: '21:30', title: 'Kuk Sool Won, ab 15 Jahre' };
const taichi: FeedSlot = { id: 'taichi-di', discipline: 'taichi', days: ['di'], from: '18:00', to: '19:30', title: 'Tai Chi und Qi Gong' };
const slots = [adults, kids, taichi];

test('training days only, in time order; empty days left out', () => {
  // 2026-11-02 is a Monday.
  const days = buildAgenda({ slots, closures: [], events: [], from: '2026-11-02', days: 7 });
  assert.deepEqual(days.map((d) => d.date), ['2026-11-02', '2026-11-03', '2026-11-06']);
  assert.deepEqual(days[0].training.map((t) => t.slot.id), ['ksw-4-6', 'ksw-15-80']);
  assert.ok(days.every((d) => d.training.every((t) => !t.off)));
});

test('a closure cancels only the groups it affects, and only on training days', () => {
  const closures = [{ from: '2026-11-02', to: '2026-11-04', text: 'Halle belegt', groups: 'kuksoolwon' as const }];
  const days = buildAgenda({ slots, closures, events: [], from: '2026-11-02', days: 7 });
  assert.ok(days[0].training.every((t) => t.off));
  assert.equal(days[0].closures.length, 1);
  assert.equal(days[1].training[0].off, false); // Tai Chi on Tuesday still on
  assert.equal(days[1].closures.length, 0); // nothing cancelled that day: no notice
  assert.ok(!days.some((d) => d.date === '2026-11-04')); // Wednesday: no training, no entry
});

test('dates appear on each of their days, also without training', () => {
  const events = [{ from: '2026-11-07', to: '2026-11-08', title: 'Seminar' }];
  const days = buildAgenda({ slots, closures: [], events, from: '2026-11-02', days: 7 });
  assert.deepEqual(days.filter((d) => d.events.length).map((d) => d.date), ['2026-11-07', '2026-11-08']);
});

test('weeks start on Monday', () => {
  assert.equal(mondayOf('2026-11-08'), '2026-11-02');
  assert.equal(mondayOf('2026-11-02'), '2026-11-02');
  const weeks = byWeek(buildAgenda({ slots, closures: [], events: [], from: '2026-11-06', days: 10 }));
  assert.deepEqual(weeks.map((w) => w.monday), ['2026-11-02', '2026-11-09']);
});

test('week label: one month, two months, other year', () => {
  assert.equal(weekLabel('2026-11-09', 'de', 2026), '9. bis 15. November');
  assert.equal(weekLabel('2026-11-30', 'de', 2026), '30. November bis 6. Dezember');
  assert.equal(weekLabel('2026-11-09', 'en', 2026), '9 to 15 November');
  assert.equal(weekLabel('2026-12-28', 'de', 2026), '28. Dezember 2026 bis 3. Januar 2027');
  assert.equal(weekLabel('2027-01-04', 'de', 2026), '4. bis 10. Januar 2027');
});

test('discipline lines: one per discipline; partly cancelled shows singly; fully cancelled marked', () => {
  // Monday 2026-11-02 (both Kuk Sool Won groups), with the given groups marked as cancelled.
  const monday = buildAgenda({ slots, closures: [], events: [], from: '2026-11-02', days: 1 })[0];
  const day = (offIds: string[]) => ({ ...monday, training: monday.training.map((t) => ({ ...t, off: offIds.includes(t.slot.id) })) });
  const all = disciplineLines(day([]), ['kuksoolwon', 'taichi']);
  assert.deepEqual(all, [{ discipline: 'kuksoolwon', singly: false, from: '16:00', to: '21:30', count: 2, only: undefined, off: false }]);
  assert.deepEqual(disciplineLines(day(['ksw-4-6']), ['kuksoolwon']), [{ discipline: 'kuksoolwon', singly: true }]);
  assert.equal((disciplineLines(day(['ksw-4-6', 'ksw-15-80']), ['kuksoolwon'])[0] as { off: boolean }).off, true);
  const tue = buildAgenda({ slots, closures: [], events: [], from: '2026-11-03', days: 1 })[0];
  assert.equal((disciplineLines(tue, ['kuksoolwon', 'taichi'])[0] as { only?: FeedSlot }).only?.id, 'taichi-di');
});
