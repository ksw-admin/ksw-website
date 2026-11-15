// Upcoming dates ("Termine", CMS: Einstellungen › Termine): tournaments, gradings, seminars, club events.
// Pure functions (no Astro imports): used by the home page block, the calendar feeds and the tests.
// Dates are "YYYY-MM-DD" strings in German local time, times "HH:MM", like closures.
import { MONTHS, MONTHS_SHORT_EN, todayInGermany, WEEKDAYS_SHORT } from './dates.ts';

export type EventKind = 'Turnier' | 'Prüfung' | 'Seminar' | 'Verein';
export type MonthPart = 'Anfang' | 'Mitte' | 'Ende';
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
  /** Called off: stays in the list (struck through, "Abgesagt") until its date, STATUS:CANCELLED in the calendar. */
  cancelled?: boolean;
  /** Slug of the report under "Aktuelles" (CMS: relation field "Bericht"); past dates link to it. */
  report?: string;
  /** Approximate date: only the month (and maybe Anfang/Mitte/Ende) is shown, "Mitte Dezember". For a date that is not
   *  fixed yet, or whose day should not be public (a club party; the repo is public, so the day is never stored).
   *  `from` is then only a sort anchor (anchorOf), shown nowhere. No time, no calendar entry. */
  approx?: { month: string; part?: MonthPart };
};

const monthEnd = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
};

/** Sort anchor of an approximate date: Anfang the 1st, Mitte the 15th, Ende the last day, no part the 1st. */
export const anchorOf = (month: string, part?: MonthPart) =>
  part === 'Ende' ? monthEnd(month) : `${month}-${part === 'Mitte' ? '15' : '01'}`;

/** One entry as the CMS saves it (Einstellungen › Termine), after the format checks in events-data.ts. */
export type CmsEvent = Omit<SiteEvent, 'from' | 'approx'> & {
  from?: string;
  approx?: { month?: string; year?: number; part?: MonthPart };
  /** Older format (2026-11-09): top-level month "YYYY-MM" and part. */
  month?: string;
  part?: MonthPart;
};

/**
 * A CMS entry as a site date, settling what the CMS cannot prevent (it has no rules across fields), so the build
 * never fails on it; each case gives a note for the build log.
 * - exact date and approximate date both set: the exact date wins (the day is in the public repo anyway);
 * - "bis" before "von": a one-day date;
 * - neither: no date to show, the entry is left out.
 * Approximate: "YYYY-MM" from the CMS select, or { month "MM", year }, or the older top-level month.
 */
export function fromCms(item: CmsEvent): { event?: SiteEvent; notes: string[] } {
  const { approx, month: legacyMonth, part: legacyPart, ...rest } = item;
  const notes: string[] = [];
  const name = `"${item.title}"`;
  const m = approx?.month;
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : m && approx?.year ? `${approx.year}-${m}` : legacyMonth;
  const part = approx?.part ?? legacyPart;
  if (rest.from) {
    if (month) notes.push(`${name}: Datum und ungefähres Datum gesetzt, das Datum gilt`);
    let to = rest.to;
    if (to && to < rest.from) {
      notes.push(`${name}: "bis" liegt vor dem Datum, als eintägig behandelt`);
      to = undefined;
    }
    return { event: { ...rest, from: rest.from, to }, notes };
  }
  if (month) {
    return {
      event: { ...rest, from: anchorOf(month, part), to: undefined, time: undefined, time_to: undefined, approx: { month, part } },
      notes,
    };
  }
  notes.push(`${name}: kein Datum und kein ungefähres Datum, weggelassen`);
  return { notes };
}

/** Approximate dates last until the end of their month (shown as upcoming until then). */
export const lastDay = (e: SiteEvent) => (e.approx ? monthEnd(e.approx.month) : e.to && e.to >= e.from ? e.to : e.from);

/** Not over yet (shown until the end of its last day). */
export const isUpcoming = (e: SiteEvent, today: string) => lastDay(e) >= today;

export const titleOf = (e: SiteEvent, lang: 'de' | 'en') => (lang === 'en' && e.title_en?.trim() ? e.title_en.trim() : e.title.trim());

const KIND_EN: Record<EventKind, string> = { Turnier: 'Tournament', Prüfung: 'Grading', Seminar: 'Seminar', Verein: 'Club' };
export const kindOf = (e: SiteEvent, lang: 'de' | 'en') => (e.kind ? (lang === 'de' ? e.kind : KIND_EN[e.kind]) : undefined);

const parts = (d: string) => d.split('-').map(Number) as [number, number, number];
const wd = (d: string, lang: 'de' | 'en') => {
  const [y, m, day] = parts(d);
  return WEEKDAYS_SHORT[lang][new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
};
/** "9.5." / "9 May"; with the year when it is not the current one ("16.1.2027" / "16 Jan 2027"). */
const short = (d: string, lang: 'de' | 'en', thisYear: number) => {
  const [y, m, day] = parts(d);
  const year = y !== thisYear ? (lang === 'de' ? String(y) : ` ${y}`) : '';
  return lang === 'de' ? `${day}.${m}.${year}` : `${day} ${MONTHS_SHORT_EN[m - 1]}${year}`;
};

/** "Sa 9.5., 10:00 Uhr" / "Sa 9.5. bis So 10.5." (English: "Sat 9 May, 10:00" / "Sat 9 May to Sun 10 May").
 *  thisYear: dates in other years get the year (default: the current year in Germany). */
export function whenOf(e: SiteEvent, lang: 'de' | 'en', thisYear = Number(todayInGermany().slice(0, 4))): string {
  if (e.approx) return approxWhen(e.approx, lang, thisYear);
  const start = `${wd(e.from, lang)} ${short(e.from, lang, thisYear)}`;
  const end = lastDay(e);
  if (end !== e.from) return `${start} ${lang === 'de' ? 'bis' : 'to'} ${wd(end, lang)} ${short(end, lang, thisYear)}`;
  if (!e.time) return start;
  const range = e.time_to ? `${e.time}–${e.time_to}` : e.time;
  return lang === 'de' ? `${start}, ${range} Uhr` : `${start}, ${range}`;
}

const PART_EN: Record<MonthPart, string> = { Anfang: 'Early', Mitte: 'Mid', Ende: 'Late' };
/** "Mitte Dezember" / "Mid December", "Dezember", "Anfang Januar 2027" (year only when not thisYear). */
function approxWhen(v: NonNullable<SiteEvent['approx']>, lang: 'de' | 'en', thisYear: number): string {
  const [y, m] = v.month.split('-').map(Number);
  const part = v.part ? `${lang === 'de' ? v.part : PART_EN[v.part]} ` : '';
  return `${part}${MONTHS[lang][m - 1]}${y !== thisYear ? ` ${y}` : ''}`;
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

