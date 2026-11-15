// Training closures ("Trainingsausfälle", CMS: Einstellungen). Pure functions, no Astro imports: used by the banner
// (Base.astro), the calendar feeds (src/pages/calendar/) and the tests.
// Dates are plain "YYYY-MM-DD" strings in German local time (helpers: src/lib/dates.ts).
import { addDays, MONTHS_SHORT_EN } from './dates.ts';

export type Group = 'alle' | 'kuksoolwon' | 'taichi';
/** announce: days before "from" the banner appears (CMS: "Vorher anzeigen (Tage)"); missing = ANNOUNCE_DAYS. */
export type Closure = { from: string; to?: string; text: string; text_en?: string; groups?: Group; announce?: number };

/** Default: the banner appears this many days before a closure starts (each entry can set its own). */
export const ANNOUNCE_DAYS = 14;

export const endOf = (c: Closure) => (c.to && c.to >= c.from ? c.to : c.from);

/** Every date of the closure, first to last. */
export function datesOf(c: Closure): string[] {
  const out: string[] = [];
  for (let d = c.from; d <= endOf(c); d = addDays(d, 1)) out.push(d);
  return out;
}

/** First day the banner shows: the entry's own lead time, else ANNOUNCE_DAYS before the start. */
export const showFrom = (c: Closure) => addDays(c.from, -(c.announce ?? ANNOUNCE_DAYS));

/** Banner visible on this day: from showFrom() until the last day. */
export const isShown = (c: Closure, today: string) => showFrom(c) <= today && today <= endOf(c);

/** Still relevant (not over yet): only these go into the pages and the calendar. */
export const isCurrent = (c: Closure, today: string) => endOf(c) >= today;

/** How long past closures stay in the calendar feeds. */
export const FEED_HISTORY_DAYS = 365;
/** For the calendar feeds: current closures plus those of the last year. Without them, subscribed calendars would
 *  show training again on past holidays (the EXDATEs would be gone). */
export const inFeed = (c: Closure, today: string) => endOf(c) >= addDays(today, -FEED_HISTORY_DAYS);

export const affects = (c: Closure, discipline: 'kuksoolwon' | 'taichi') => !c.groups || c.groups === 'alle' || c.groups === discipline;

const dm = (d: string, lang: 'de' | 'en') => {
  const [, m, day] = d.split('-').map(Number);
  return lang === 'de' ? `${day}.${m}.` : `${day} ${MONTHS_SHORT_EN[m - 1]}`;
};

/** "Kein Training vom 20.10. bis 26.10." / "Kein Tai Chi am 3.11." (English likewise). */
export function headline(c: Closure, lang: 'de' | 'en'): string {
  const what =
    c.groups === 'taichi' ? (lang === 'de' ? 'Kein Tai Chi' : 'No Tai Chi')
    : c.groups === 'kuksoolwon' ? (lang === 'de' ? 'Kein Kuk Sool Won' : 'No Kuk Sool Won')
    : lang === 'de' ? 'Kein Training' : 'No training';
  const end = endOf(c);
  if (end === c.from) return lang === 'de' ? `${what} am ${dm(c.from, lang)}` : `${what} on ${dm(c.from, lang)}`;
  return lang === 'de' ? `${what} vom ${dm(c.from, lang)} bis ${dm(end, lang)}` : `${what} from ${dm(c.from, lang)} to ${dm(end, lang)}`;
}

export const textOf = (c: Closure, lang: 'de' | 'en') => (lang === 'en' && c.text_en?.trim() ? c.text_en.trim() : c.text.trim());
