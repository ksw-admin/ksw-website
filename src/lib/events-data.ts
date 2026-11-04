// Upcoming dates from the CMS (src/content/events.json), read directly like closures (an empty list is normal).
// A broken entry fails the build with the message below.
import { z } from 'astro/zod';
import raw from '../content/events.json';
import { FEED_HISTORY_DAYS } from './closures';
import { addDays, todayInGermany } from './dates';
import { isUpcoming, lastDay, type SiteEvent } from './events';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Termine: Datum als JJJJ-MM-TT');
const time = z.string().regex(/^\d{2}:\d{2}$/, 'Termine: Uhrzeit als HH:MM, z.B. 10:00');
const opt = <T extends z.ZodType>(s: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), s.optional());
const Events = z.object({
  items: z
    .array(
      z
        .object({
          from: date,
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
        .refine((e) => !e.to || e.to >= e.from, { message: 'Termine: "bis" muss am oder nach "von" liegen' }),
    )
    .default([]),
});

const all: SiteEvent[] = Events.parse(raw).items;

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

/** For the calendar feeds: upcoming dates plus those of the last year (like closures), so a past tournament
 *  stays in subscribers' calendars instead of being deleted at the next rebuild. Cancelled ones stay too (marked). */
export async function getFeedEvents(): Promise<SiteEvent[]> {
  const from = addDays(todayInGermany(), -FEED_HISTORY_DAYS);
  return all
    .filter((e) => lastDay(e) >= from)
    .sort((a, b) => a.from.localeCompare(b.from) || (a.time ?? '').localeCompare(b.time ?? ''));
}
