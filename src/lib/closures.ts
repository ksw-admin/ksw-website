// Training closures ("Trainingsausfälle", CMS: Einstellungen). Pure functions, no Astro imports: used by the banner
// (Base.astro), the calendar feeds (src/pages/calendar/) and the tests.
// Dates are plain "YYYY-MM-DD" strings in local (German) time: no time zone maths, no off-by-one at midnight UTC.

export type Group = 'alle' | 'kuksoolwon' | 'taichi';
export type Closure = { from: string; to?: string; text: string; text_en?: string; groups?: Group };

/** The banner appears this many days before a closure starts. */
export const ANNOUNCE_DAYS = 14;

const toUtc = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y, m - 1, day);
};
const fromUtc = (t: number) => new Date(t).toISOString().slice(0, 10);

export const addDays = (d: string, n: number) => fromUtc(toUtc(d) + n * 86_400_000);
export const endOf = (c: Closure) => (c.to && c.to >= c.from ? c.to : c.from);

/** Weekday as in schedule.json: mo..so. */
export function weekday(d: string): 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so' {
  return (['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'] as const)[new Date(toUtc(d)).getUTCDay()];
}

/** Every date of the closure, first to last. */
export function datesOf(c: Closure): string[] {
  const out: string[] = [];
  for (let d = c.from; d <= endOf(c); d = addDays(d, 1)) out.push(d);
  return out;
}

/** Banner visible on this day: from ANNOUNCE_DAYS before the start until the last day. */
export const isShown = (c: Closure, today: string) => addDays(c.from, -ANNOUNCE_DAYS) <= today && today <= endOf(c);

/** Still relevant (not over yet): only these go into the pages and the calendar. */
export const isCurrent = (c: Closure, today: string) => endOf(c) >= today;

export const affects = (c: Closure, discipline: 'kuksoolwon' | 'taichi') => !c.groups || c.groups === 'alle' || c.groups === discipline;

/** Today in Germany as YYYY-MM-DD (sv-SE formats dates as ISO). */
export const todayInGermany = (now = new Date()) => now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

const dm = (d: string, lang: 'de' | 'en') => {
  const [, m, day] = d.split('-').map(Number);
  return lang === 'de' ? `${day}.${m}.` : `${day} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]}`;
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
