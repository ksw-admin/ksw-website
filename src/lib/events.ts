// Upcoming dates ("Termine", CMS: Einstellungen › Termine): tournaments, gradings, seminars, club events.
// Pure functions (no Astro imports): used by the home page block, the calendar feeds and the tests.
// Dates are "YYYY-MM-DD" strings in German local time, times "HH:MM", like closures.
import { addDays } from './closures.ts';

export type EventKind = 'Turnier' | 'Prüfung' | 'Seminar' | 'Verein';
export type SiteEvent = {
  from: string;
  to?: string;
  time?: string;
  time_to?: string;
  title: string;
  title_en?: string;
  kind?: EventKind;
  place?: string;
  link?: string;
};

export const lastDay = (e: SiteEvent) => (e.to && e.to >= e.from ? e.to : e.from);

/** Not over yet (shown until the end of its last day). */
export const isUpcoming = (e: SiteEvent, today: string) => lastDay(e) >= today;

export const titleOf = (e: SiteEvent, lang: 'de' | 'en') => (lang === 'en' && e.title_en?.trim() ? e.title_en.trim() : e.title.trim());

const KIND_EN: Record<EventKind, string> = { Turnier: 'Tournament', Prüfung: 'Grading', Seminar: 'Seminar', Verein: 'Club' };
export const kindOf = (e: SiteEvent, lang: 'de' | 'en') => (e.kind ? (lang === 'de' ? e.kind : KIND_EN[e.kind]) : undefined);

const WD = { de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (d: string) => d.split('-').map(Number) as [number, number, number];
const wd = (d: string, lang: 'de' | 'en') => {
  const [y, m, day] = parts(d);
  return WD[lang][new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
};
const short = (d: string, lang: 'de' | 'en') => {
  const [, m, day] = parts(d);
  return lang === 'de' ? `${day}.${m}.` : `${day} ${MON[m - 1]}`;
};

/** "Sa 9.5., 10:00 Uhr" / "Sa 9.5. bis So 10.5." (English: "Sat 9 May, 10:00" / "Sat 9 May to Sun 10 May"). */
export function whenOf(e: SiteEvent, lang: 'de' | 'en'): string {
  const start = `${wd(e.from, lang)} ${short(e.from, lang)}`;
  const end = lastDay(e);
  if (end !== e.from) return `${start} ${lang === 'de' ? 'bis' : 'to'} ${wd(end, lang)} ${short(end, lang)}`;
  if (!e.time) return start;
  const range = e.time_to ? `${e.time}–${e.time_to}` : e.time;
  return lang === 'de' ? `${start}, ${range} Uhr` : `${start}, ${range}`;
}

/** Calendar end for a timed one-day event: the given end time, else two hours after the start. */
export function endTime(e: SiteEvent): string | undefined {
  if (!e.time) return undefined;
  if (e.time_to && e.time_to > e.time) return e.time_to;
  const [h, m] = e.time.split(':').map(Number);
  const t = Math.min(h * 60 + m + 120, 23 * 60 + 59);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/** Stable calendar UID part: date plus a slug of the title. */
export const eventKey = (e: SiteEvent) =>
  `${e.from}-${e.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`;

export { addDays };
