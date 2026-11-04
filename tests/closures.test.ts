// Closure dates (banner) and the calendar feed built from them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addDays, datesOf, headline, isShown, isCurrent, showFrom, weekday, todayInGermany, type Closure } from '../src/lib/closures.ts';
import { buildCalendar, cancelledDates, esc, fold, type FeedSlot } from '../src/lib/ics.ts';

const ferien: Closure = { from: '2026-10-19', to: '2026-10-25', text: 'Herbstferien' };
const tc: Closure = { from: '2026-11-05', text: 'Halle belegt', groups: 'taichi' };

test('dates: month ends, leap years and weekdays without time zone drift', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2026-03-29', 1), '2026-03-30'); // daylight saving switch
  assert.equal(weekday('2026-11-03'), 'di');
  assert.deepEqual(datesOf(ferien).length, 7);
  assert.deepEqual(datesOf(tc), ['2026-11-05']); // no "to" = one day
});

test('banner: shown 14 days ahead until the last day, gone the day after', () => {
  assert.equal(isShown(ferien, '2026-10-04'), false);
  assert.equal(isShown(ferien, '2026-10-05'), true);
  assert.equal(isShown(ferien, '2026-10-25'), true);
  assert.equal(isShown(ferien, '2026-10-26'), false);
  assert.equal(isCurrent(ferien, '2026-10-25'), true);
  assert.equal(isCurrent(ferien, '2026-10-26'), false);
});

test('today is the German date, also late in the evening UTC', () => {
  assert.equal(todayInGermany(new Date('2026-11-03T23:30:00Z')), '2026-11-04');
  assert.equal(todayInGermany(new Date('2026-07-01T21:59:00Z')), '2026-07-01');
});

test('headline wording', () => {
  assert.equal(headline(ferien, 'de'), 'Kein Training vom 19.10. bis 25.10.');
  assert.equal(headline(tc, 'de'), 'Kein Tai Chi am 5.11.');
  assert.equal(headline(tc, 'en'), 'No Tai Chi on 5 Nov');
});

const ksw: FeedSlot = { id: 'ksw-9-11', discipline: 'kuksoolwon', days: ['mo', 'fr'], from: '18:00', to: '19:00', title: 'Kuk Sool Won, 9–11 Jahre' };
const taichi: FeedSlot = { id: 'taichi-do', discipline: 'taichi', days: ['do'], from: '19:15', to: '20:15', title: 'Tai Chi, Qi Gong' };

test('calendar: only the group\'s own weekdays are cancelled, and only for affected groups', () => {
  assert.deepEqual(cancelledDates(ksw, [ferien, tc]), ['2026-10-19', '2026-10-23']);
  assert.deepEqual(cancelledDates(taichi, [ferien, tc]), ['2026-10-22', '2026-11-05']);
});

test('calendar: valid structure, CRLF, folded lines, escaped text', () => {
  const ics = buildCalendar({
    name: 'Training', host: 'example.org', location: 'Beethovenstr. 18a, 47226 Duisburg', url: 'https://example.org/',
    slots: [ksw, taichi], closures: [ferien, tc], now: new Date('2026-11-03T12:00:00Z'),
  });
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  assert.equal(ics.split('BEGIN:VEVENT').length - 1, 4); // 2 groups + 2 closures
  assert.match(ics, /DTSTART;TZID=Europe\/Berlin:20260105T180000/); // first Monday of the series
  assert.match(ics, /DTSTART;TZID=Europe\/Berlin:20260108T191500/); // first Thursday
  assert.match(ics, /EXDATE;TZID=Europe\/Berlin:20261019T180000,20261023T180000/);
  assert.match(ics, /DTEND;VALUE=DATE:20261026/); // exclusive end of the holiday event
  assert.match(ics, /LOCATION:Beethovenstr. 18a\\, 47226 Duisburg/);
  assert.ok(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75), 'a line is longer than 75 octets');
  assert.ok(!/[^\r]\n/.test(ics), 'bare LF found');
});

test('escape and fold helpers', () => {
  assert.equal(esc('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
  const long = 'SUMMARY:' + 'Ü'.repeat(60);
  const folded = fold(long);
  assert.ok(folded.split('\r\n ').every((l) => new TextEncoder().encode(l).length <= 75));
  assert.equal(folded.replace(/\r\n /g, ''), long);
});

test('closures.json (as edited in the CMS) is valid', () => {
  const { items } = JSON.parse(readFileSync(new URL('../src/content/closures.json', import.meta.url), 'utf8')) as { items: Closure[] };
  for (const c of items) {
    assert.match(c.from, /^\d{4}-\d{2}-\d{2}$/);
    if (c.to) assert.ok(c.to >= c.from, `${c.from}: "bis" liegt vor "von"`);
    assert.ok(c.text.trim(), `${c.from}: Text fehlt`);
  }
});

test('banner: each closure can set its own lead time (CMS: Vorher anzeigen)', () => {
  const sommer: Closure = { from: '2026-07-06', to: '2026-08-18', text: 'Sommerferien', announce: 28 };
  const heute: Closure = { from: '2026-11-04', text: 'Halle belegt', announce: 0 };
  assert.equal(showFrom(sommer), '2026-06-08');
  assert.equal(isShown(sommer, '2026-06-07'), false);
  assert.equal(isShown(sommer, '2026-06-08'), true);
  assert.equal(isShown(heute, '2026-11-03'), false);
  assert.equal(isShown(heute, '2026-11-04'), true);
  assert.equal(showFrom(ferien), addDays(ferien.from, -14)); // no value = default 14
});
