// Upcoming dates from the CMS (src/content/events.json), read directly like closures (an empty list is normal).
// A broken entry fails the build with the message below.
import { z } from 'astro/zod';
import { isoDate, opt } from './cms-schema';
import raw from '../content/events.json';
import { FEED_HISTORY_DAYS } from './closures';
import { addDays, todayInGermany } from './dates';
import { anchorOf, isUpcoming, lastDay, type SiteEvent } from './events';

const date = isoDate('Termine');
const time = z.string().regex(/^\d{2}:\d{2}$/, 'Termine: Uhrzeit als HH:MM, z.B. 10:00');
const Events = z.object({
  items: z
    .array(
      z
        .object({
          // Either an exact date (from) or an approximate one (month, optional part). For the approximate one only
          // the month is stored: the day of a not-yet-fixed or not-public date never reaches the public repo.
          from: opt(date),
          month: opt(z.string().regex(/^\d{4}-\d{2}$/, 'Termine: Monat als JJJJ-MM')),
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
        })
        .refine((e) => !!e.from !== !!e.month, { message: 'Termine: entweder ein Datum oder (für ein ungefähres Datum) einen Monat angeben, nicht beides' })
        .refine((e) => !e.to || !e.from || e.to >= e.from, { message: 'Termine: "bis" muss am oder nach "von" liegen' }),
    )
    .default([]),
});

/** Approximate dates: sort anchor as from; bis, Uhrzeit are ignored (they would pretend a day). */
const all: SiteEvent[] = Events.parse(raw).items.map(({ month, part, ...e }) =>
  month
    ? { ...e, from: anchorOf(month, part), to: undefined, time: undefined, time_to: undefined, approx: { month, part } }
    : { ...e, from: e.from! },
);

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
