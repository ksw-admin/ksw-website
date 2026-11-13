// Upcoming dates from the CMS (src/content/events.json), read directly like closures (an empty list is normal).
// A broken entry fails the build with the message below.
import { z } from 'astro/zod';
import { isoDate, opt } from './cms-schema';
import raw from '../content/events.json';
import { FEED_HISTORY_DAYS } from './closures';
import { addDays, todayInGermany } from './dates';
import { fromCms, isUpcoming, lastDay, type SiteEvent } from './events';

const date = isoDate('Termine');
const time = z.string().regex(/^\d{2}:\d{2}$/, 'Termine: Uhrzeit als HH:MM, z.B. 10:00');
// The CMS cannot enforce rules across fields, so nothing it can save stops the build: fromCms (src/lib/events.ts)
// settles the cases (date and approximate date both set, "bis" before "von", no date) and the build log says so.
const Events = z.object({
  items: z
    .array(
      z.object({
        from: opt(date),
        // CMS group "Stattdessen: ungefähres Datum": month "YYYY-MM" from one select (no day is ever stored);
        // also read: { month "MM", year } (2026-11-09) and a top-level month "YYYY-MM" with part (2026-11-09).
        approx: opt(
          z.object({
            month: opt(z.string().regex(/^(\d{4}-)?(0[1-9]|1[0-2])$/, 'Termine: Monat als JJJJ-MM')),
            year: opt(z.coerce.number().int().min(2000).max(2100)),
            part: opt(z.enum(['Anfang', 'Mitte', 'Ende'])),
          }),
        ),
        month: opt(z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Termine: Monat als JJJJ-MM')),
        part: opt(z.enum(['Anfang', 'Mitte', 'Ende'])),
        to: opt(date),
        time: opt(time),
        time_to: opt(time),
        title: z.string().min(1, 'Termine: Titel fehlt'),
        title_en: opt(z.string()),
        kind: opt(z.enum(['Turnier', 'Prüfung', 'Seminar', 'Verein'])),
        place: opt(z.string()),
        link: opt(z.url({ protocol: /^https?$/, message: 'Termine: Link als vollständige Adresse mit https://' })),
        cancelled: z.preprocess((v) => (v === null ? undefined : v), z.boolean().optional()),
        report: opt(z.string()),
      }),
    )
    .default([]),
});

const all: SiteEvent[] = Events.parse(raw).items.flatMap((item) => {
  const { event, notes } = fromCms(item);
  for (const n of notes) console.warn(`[events] ${n}`);
  return event ? [event] : [];
});

/** Not over yet at build time, soonest first. */
export async function getEvents(): Promise<SiteEvent[]> {
  const today = todayInGermany();
  return all
    .filter((e) => isUpcoming(e, today))
    .sort((a, b) => a.from.localeCompare(b.from) || (a.time ?? '').localeCompare(b.time ?? ''));
}

/** Over already, this calendar year, not cancelled: "Früher in <Jahr>" on the calendar page. Oldest first. */
export async function getPastEvents(): Promise<SiteEvent[]> {
  const today = todayInGermany();
  const year = today.slice(0, 4);
  return all
    .filter((e) => !isUpcoming(e, today) && e.from.startsWith(year) && !e.cancelled)
    .sort((a, b) => a.from.localeCompare(b.from) || (a.time ?? '').localeCompare(b.time ?? ''));
}

/** For the calendar feeds (approximate dates left out): upcoming dates plus those of the last year (like closures), so a past tournament
 *  stays in subscribers' calendars instead of being deleted at the next rebuild. Cancelled ones stay too (marked). */
export async function getFeedEvents(): Promise<SiteEvent[]> {
  const from = addDays(todayInGermany(), -FEED_HISTORY_DAYS);
  return all
    .filter((e) => !e.approx && lastDay(e) >= from) // a calendar entry needs a day
    .sort((a, b) => a.from.localeCompare(b.from) || (a.time ?? '').localeCompare(b.time ?? ''));
}
