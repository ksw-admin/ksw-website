// iCalendar (RFC 5545) feeds for the training times: one weekly repeating event per group, closures removed
// (EXDATE) and shown as all-day "Kein Training" events. Pure functions; the endpoint is src/pages/kalender/[feed].ics.ts.
import { affects, addDays, datesOf, endOf, headline, weekday, type Closure } from './closures.ts';

export type FeedSlot = {
  id: string;
  discipline: 'kuksoolwon' | 'taichi';
  days: string[];
  from: string;
  to: string;
  title: string;
};

const BYDAY: Record<string, string> = { mo: 'MO', di: 'TU', mi: 'WE', do: 'TH', fr: 'FR', sa: 'SA', so: 'SU' };
/** First week of the series. Fixed, so event UIDs and start dates stay the same from build to build. */
const ANCHOR = '2026-01-05';

/** Escape text values (RFC 5545 3.3.11). */
export const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold lines longer than 75 octets (RFC 5545 3.1), without splitting a UTF-8 character. */
export function fold(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let cur = '';
  let limit = 75;
  for (const ch of line) {
    if (enc.encode(cur + ch).length > limit) {
      parts.push(cur);
      cur = '';
      limit = 74; // continuation lines start with a space
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

const compact = (d: string) => d.replace(/-/g, '');
const local = (d: string, t: string) => `${compact(d)}T${t.replace(':', '')}00`;

// Europe/Berlin with the EU daylight saving rules (since 1996).
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Berlin',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** First date on or after ANCHOR that is one of the slot's days (DTSTART must be an occurrence). */
function firstDate(days: string[]): string {
  let d = ANCHOR;
  while (!days.includes(weekday(d))) d = addDays(d, 1);
  return d;
}

/** Dates on which this group's training falls out. */
export function cancelledDates(slot: FeedSlot, closures: Closure[]): string[] {
  const dates = closures.filter((c) => affects(c, slot.discipline)).flatMap(datesOf).filter((d) => slot.days.includes(weekday(d)));
  return [...new Set(dates)].sort();
}

export function buildCalendar(opts: {
  name: string;
  host: string;
  location: string;
  url: string;
  slots: FeedSlot[];
  closures: Closure[];
  now?: Date;
}): string {
  const stamp = (opts.now ?? new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${opts.host}//Trainingszeiten//DE`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(opts.name)}`,
    'X-WR-TIMEZONE:Europe/Berlin',
    // Ask calendar apps to refresh every 6 hours (many apps choose their own interval anyway).
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...VTIMEZONE,
  ];
  for (const s of opts.slots) {
    const first = firstDate(s.days);
    const ex = cancelledDates(s, opts.closures).filter((d) => d >= first);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}@${opts.host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Berlin:${local(first, s.from)}`,
      `DTEND;TZID=Europe/Berlin:${local(first, s.to)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${s.days.map((d) => BYDAY[d]).join(',')}`,
      ...(ex.length ? [`EXDATE;TZID=Europe/Berlin:${ex.map((d) => local(d, s.from)).join(',')}`] : []),
      `SUMMARY:${esc(s.title)}`,
      `LOCATION:${esc(opts.location)}`,
      `URL:${opts.url}`,
      'END:VEVENT',
    );
  }
  // Closures that touch at least one group in this feed, as all-day events (DTEND is the day after, exclusive).
  const disciplines = new Set(opts.slots.map((s) => s.discipline));
  for (const c of opts.closures.filter((c) => [...disciplines].some((d) => affects(c, d)))) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:ausfall-${c.from}-${c.groups ?? 'alle'}@${opts.host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(c.from)}`,
      `DTEND;VALUE=DATE:${compact(addDays(endOf(c), 1))}`,
      `SUMMARY:${esc(`${headline(c, 'de').replace(/ (am|vom) .*/, '')}: ${c.text.trim()}`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
