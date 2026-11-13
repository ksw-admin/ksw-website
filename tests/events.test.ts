// Upcoming dates (Termine): wording, end times, "upcoming" and the calendar entries built from them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { anchorOf, endTime, isUpcoming, kindOf, lastDay, titleOf, whenOf, type SiteEvent } from '../src/lib/events.ts';
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
  const { items } = JSON.parse(readFileSync(new URL('../src/content/events.json', import.meta.url), 'utf8')) as {
    items: (Omit<Partial<SiteEvent>, 'approx'> & { month?: string; part?: string; approx?: { month?: string; year?: number } })[];
  };
  for (const e of items) {
    // Approximate date, never a day: CMS group approx { month "YYYY-MM" } (month list generated at every build),
    // the earlier form approx { month "MM", year }, or the oldest top-level month "YYYY-MM". Same order as fromCms().
    const m = e.approx?.month;
    const approx = m && /^\d{4}-\d{2}$/.test(m) ? m : m && e.approx?.year ? `${e.approx.year}-${m}` : e.month;
    const at = e.from || approx;
    assert.ok(!!e.from !== !!approx, `${at} ${e.title}: entweder Datum oder ungefähres Datum`);
    if (m && !/^\d{4}-\d{2}$/.test(m)) assert.ok(e.approx?.year, `${e.title}: ungefähres Datum braucht Monat und Jahr`);
    if (e.from) assert.match(e.from, /^\d{4}-\d{2}-\d{2}$/);
    else assert.match(approx!, /^\d{4}-(0[1-9]|1[0-2])$/);
    assert.ok(e.title?.trim(), `${at}: Titel fehlt`);
    if (e.to && e.from) assert.ok(e.to >= e.from, `${e.from}: "bis" liegt vor "von"`);
  }
});

const party: SiteEvent = { from: anchorOf('2026-12', 'Mitte'), title: 'Weihnachtsfeier', kind: 'Verein', approx: { month: '2026-12', part: 'Mitte' } };

test('approximate date: month (and part) only, in both languages; year only when not the current one', () => {
  assert.equal(whenOf(party, 'de', 2026), 'Mitte Dezember');
  assert.equal(whenOf(party, 'en', 2026), 'Mid December');
  assert.equal(whenOf({ ...party, approx: { month: '2026-12' } }, 'de', 2026), 'Dezember');
  assert.equal(whenOf({ ...party, approx: { month: '2027-01', part: 'Anfang' } }, 'de', 2026), 'Anfang Januar 2027');
  assert.equal(whenOf({ ...party, approx: { month: '2028-02', part: 'Ende' } }, 'en', 2026), 'Late February 2028');
  assert.equal(whenOf({ ...party, time: '19:00' }, 'de', 2026), 'Mitte Dezember'); // a time never shows
});

test('approximate date: sort anchor, upcoming until the end of its month', () => {
  assert.equal(anchorOf('2026-12'), '2026-12-01');
  assert.equal(anchorOf('2026-12', 'Anfang'), '2026-12-01');
  assert.equal(anchorOf('2026-12', 'Mitte'), '2026-12-15');
  assert.equal(anchorOf('2026-12', 'Ende'), '2026-12-31');
  assert.equal(anchorOf('2028-02', 'Ende'), '2028-02-29'); // leap year
  assert.equal(lastDay(party), '2026-12-31');
  assert.equal(isUpcoming(party, '2026-12-31'), true);
  assert.equal(isUpcoming(party, '2027-01-01'), false);
});

test('calendar feed: no entry for an approximate date (it has no day)', () => {
  const ics = buildCalendar({
    name: 'Training', host: 'example.org', location: 'Halle', url: 'https://example.org/',
    slots: [], closures: [], events: [party, turnier], now: new Date('2026-05-01T12:00:00Z'),
  });
  assert.doesNotMatch(ics, /Weihnachtsfeier/);
  assert.match(ics, /New Generation Turnier/);
});

test('calendar: a cancelled date keeps its UID and is marked cancelled', () => {
  const ics = buildCalendar({
    name: 'Training', host: 'example.org', location: 'Halle', url: 'https://example.org/',
    slots: [], closures: [], events: [{ ...turnier, cancelled: true }], now: new Date('2026-05-01T12:00:00Z'),
  });
  assert.match(ics, /UID:termin-2026-05-09-new-generation-turnier@example.org/);
  assert.match(ics, /SUMMARY:Abgesagt: Turnier: New Generation Turnier\r\nSTATUS/);
  assert.match(ics, /STATUS:CANCELLED\r\nSEQUENCE:1\r\nTRANSP:TRANSPARENT/);
  const normal = buildCalendar({
    name: 'Training', host: 'example.org', location: 'Halle', url: 'https://example.org/',
    slots: [], closures: [], events: [turnier], now: new Date('2026-05-01T12:00:00Z'),
  });
  assert.doesNotMatch(normal, /STATUS:CANCELLED/);
});

test('CMS entry: nothing the CMS can save stops the build', async () => {
  const { fromCms } = await import('../src/lib/events.ts');
  const both = fromCms({ title: 'Prüfung', from: '2026-11-13', approx: { month: '2026-11', part: 'Mitte' } });
  assert.equal(both.event?.from, '2026-11-13'); // the exact date wins
  assert.equal(both.event?.approx, undefined);
  assert.match(both.notes[0], /das Datum gilt/);
  const back = fromCms({ title: 'Camp', from: '2026-06-14', to: '2026-06-13' });
  assert.equal(back.event?.to, undefined); // "bis" before "von": one day
  assert.match(back.notes[0], /eintägig/);
  const none = fromCms({ title: 'Ohne Datum', approx: {} });
  assert.equal(none.event, undefined);
  assert.match(none.notes[0], /weggelassen/);
  const approx = fromCms({ title: 'Feier', approx: { month: '2026-12', part: 'Mitte' }, time: '19:00' });
  assert.equal(approx.event?.from, '2026-12-15');
  assert.equal(approx.event?.time, undefined);
  assert.deepEqual(approx.event?.approx, { month: '2026-12', part: 'Mitte' });
  assert.deepEqual(approx.notes, []);
  // older shapes are still read
  assert.equal(fromCms({ title: 'A', approx: { month: '11', year: 2026 } }).event?.approx?.month, '2026-11');
  assert.equal(fromCms({ title: 'B', month: '2026-11', part: 'Ende' }).event?.from, '2026-11-30');
});
