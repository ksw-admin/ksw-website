// Upcoming dates (Termine): wording, end times, "upcoming" and the calendar entries built from them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { endTime, isUpcoming, kindOf, titleOf, whenOf, type SiteEvent } from '../src/lib/events.ts';
import { buildCalendar } from '../src/lib/ics.ts';

const turnier: SiteEvent = { from: '2026-05-09', time: '10:00', title: 'New Generation Turnier', kind: 'Turnier', place: 'Arnsberg', link: 'https://example.org/ausschreibung' };
const seminar: SiteEvent = { from: '2026-06-13', to: '2026-06-14', title: 'Way of the Warrior', title_en: 'Way of the Warrior seminar', kind: 'Seminar' };
const feier: SiteEvent = { from: '2026-12-18', title: 'Weihnachtsfeier' };

test('date wording: weekday, range, time; year only when not the current one', () => {
  assert.equal(whenOf(turnier, 'de', 2026), 'Sa 9.5., 10:00 Uhr');
  assert.equal(whenOf(turnier, 'en', 2026), 'Sat 9 May, 10:00');
  assert.equal(whenOf(seminar, 'de', 2026), 'Sa 13.6. bis So 14.6.');
  assert.equal(whenOf(feier, 'de', 2026), 'Fr 18.12.');
  assert.equal(whenOf({ ...turnier, time_to: '16:00' }, 'de', 2026), 'Sa 9.5., 10:00–16:00 Uhr');
  assert.equal(whenOf({ from: '2027-01-16', title: 'Neujahr' }, 'de', 2026), 'Sa 16.1.2027');
  assert.equal(whenOf({ from: '2027-01-16', title: 'Neujahr' }, 'en', 2026), 'Sat 16 Jan 2027');
  assert.equal(whenOf({ from: '2026-12-30', to: '2027-01-02', title: 'Camp' }, 'de', 2026), 'Mi 30.12. bis Sa 2.1.2027');
});

test('end time: given, else two hours, never past midnight', () => {
  assert.equal(endTime(turnier), '12:00');
  assert.equal(endTime({ ...turnier, time_to: '16:30' }), '16:30');
  assert.equal(endTime({ ...turnier, time: '23:00' }), '23:59');
  assert.equal(endTime(feier), undefined);
});

test('upcoming until the end of the last day; English title and kind', () => {
  assert.equal(isUpcoming(seminar, '2026-06-14'), true);
  assert.equal(isUpcoming(seminar, '2026-06-15'), false);
  assert.equal(titleOf(seminar, 'en'), 'Way of the Warrior seminar');
  assert.equal(titleOf(turnier, 'en'), 'New Generation Turnier'); // no translation: German title
  assert.equal(kindOf(turnier, 'en'), 'Tournament');
});

test('calendar: timed event, multi-day all-day event, place and link', () => {
  const ics = buildCalendar({
    name: 'Training', host: 'example.org', location: 'Halle', url: 'https://example.org/',
    slots: [], closures: [], events: [turnier, seminar], now: new Date('2026-05-01T12:00:00Z'),
  });
  assert.match(ics, /DTSTART;TZID=Europe\/Berlin:20260509T100000\r\nDTEND;TZID=Europe\/Berlin:20260509T120000/);
  assert.match(ics, /SUMMARY:Turnier: New Generation Turnier/);
  assert.match(ics, /LOCATION:Arnsberg/);
  assert.match(ics, /URL:https:\/\/example.org\/ausschreibung/);
  assert.match(ics, /DTSTART;VALUE=DATE:20260613\r\nDTEND;VALUE=DATE:20260615/); // exclusive end
  assert.match(ics, /UID:termin-2026-05-09-new-generation-turnier@example.org/);
});

test('events.json (as edited in the CMS) is valid', () => {
  const { items } = JSON.parse(readFileSync(new URL('../src/content/events.json', import.meta.url), 'utf8')) as { items: SiteEvent[] };
  for (const e of items) {
    assert.match(e.from, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(e.title?.trim(), `${e.from}: Titel fehlt`);
    if (e.to) assert.ok(e.to >= e.from, `${e.from}: "bis" liegt vor "von"`);
  }
});
