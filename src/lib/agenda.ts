// Calendar page (/dates/): training slots, closures and dates expanded into actual days. Pure functions, no Astro
// imports: used by the page and the tests. Same inputs and rules as the calendar feeds (src/lib/ics.ts), so the page
// and the subscriptions never disagree: a closure cancels the training of the groups it affects on those days,
// dates (tournaments ...) are in every view.
import { addDays, affects, datesOf, weekday, type Closure } from './closures.ts';
import { lastDay, type SiteEvent } from './events.ts';
import type { FeedSlot } from './ics.ts';

export type AgendaTraining = { slot: FeedSlot; off: boolean };
export type AgendaDay = {
  date: string;
  training: AgendaTraining[];
  /** Closures touching this day (at least one group's training falls out, or the closure covers a training-free day). */
  closures: Closure[];
  /** Dates on this day; a multi-day date appears on each of its days. */
  events: SiteEvent[];
};

/** Monday of the week containing d. */
export const mondayOf = (d: string) => addDays(d, -['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'].indexOf(weekday(d)));

/**
 * Every day from `from` for `days` days that has something on it: training, a closure that cancels training,
 * or a date. Closures on days without training are left out (nothing changes for anyone).
 */
export function buildAgenda(opts: { slots: FeedSlot[]; closures: Closure[]; events: SiteEvent[]; from: string; days: number }): AgendaDay[] {
  const out: AgendaDay[] = [];
  const closed = new Map<string, Closure[]>();
  for (const c of opts.closures) for (const d of datesOf(c)) closed.set(d, [...(closed.get(d) ?? []), c]);
  for (let i = 0; i < opts.days; i++) {
    const date = addDays(opts.from, i);
    const wd = weekday(date);
    const dayClosures = closed.get(date) ?? [];
    const training = opts.slots
      .filter((s) => s.days.includes(wd))
      .sort((a, b) => a.from.localeCompare(b.from))
      .map((slot) => ({ slot, off: dayClosures.some((c) => affects(c, slot.discipline)) }));
    const closures = dayClosures.filter((c) => training.some((t) => t.off && affects(c, t.slot.discipline)));
    const events = opts.events.filter((e) => e.from <= date && date <= lastDay(e));
    if (training.length || events.length) out.push({ date, training, closures, events });
  }
  return out;
}

/** Days grouped into weeks (Monday first), in order. */
export function byWeek(days: AgendaDay[]): { monday: string; days: AgendaDay[] }[] {
  const weeks: { monday: string; days: AgendaDay[] }[] = [];
  for (const d of days) {
    const monday = mondayOf(d.date);
    if (weeks.at(-1)?.monday !== monday) weeks.push({ monday, days: [] });
    weeks.at(-1)!.days.push(d);
  }
  return weeks;
}

const MONTHS = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
/** "9. bis 15. November" / "30. November bis 6. Dezember" (English "9 to 15 November"); the year when not thisYear. */
export function weekLabel(monday: string, lang: 'de' | 'en', thisYear: number): string {
  const sunday = addDays(monday, 6);
  const [y1, m1, d1] = monday.split('-').map(Number);
  const [y2, m2, d2] = sunday.split('-').map(Number);
  const dot = lang === 'de' ? '.' : '';
  const to = lang === 'de' ? 'bis' : 'to';
  const M = MONTHS[lang];
  const year = y2 !== thisYear ? ` ${y2}` : '';
  const start = m1 === m2 ? `${d1}${dot}` : `${d1}${dot} ${M[m1 - 1]}${y1 !== y2 ? ` ${y1}` : ''}`;
  return `${start} ${to} ${d2}${dot} ${M[m2 - 1]}${year}`;
}

/** One discipline on one day in the all-groups view (calendar page). */
export type DisciplineLine =
  /** Only some of its groups are cancelled that day: show the groups singly instead. */
  | { discipline: FeedSlot['discipline']; singly: true }
  | {
      discipline: FeedSlot['discipline'];
      singly: false;
      /** First start and last end of the discipline's training that day. */
      from: string;
      to: string;
      /** Groups training that day, and the slot when it is only one. */
      count: number;
      only?: FeedSlot;
      /** All its groups are cancelled. */
      off: boolean;
    };

/** All-groups view: one line per discipline that trains on the day, in the order given. */
export function disciplineLines(day: AgendaDay, disciplines: readonly FeedSlot['discipline'][]): DisciplineLine[] {
  const out: DisciplineLine[] = [];
  for (const discipline of disciplines) {
    const ts = day.training.filter((t) => t.slot.discipline === discipline);
    if (!ts.length) continue;
    const off = ts.filter((t) => t.off).length;
    if (off && off < ts.length) {
      out.push({ discipline, singly: true });
      continue;
    }
    out.push({
      discipline,
      singly: false,
      from: ts.map((t) => t.slot.from).sort()[0],
      to: ts.map((t) => t.slot.to).sort().at(-1)!,
      count: ts.length,
      only: ts.length === 1 ? ts[0].slot : undefined,
      off: off === ts.length,
    });
  }
  return out;
}
