import { getCollection } from 'astro:content';
import type { Lang } from '../i18n/ui';
import type { FeedSlot } from './ics';

export const WEEKDAYS = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const DAY_NAMES: Record<Lang, Record<Weekday, [short: string, long: string]>> = {
  de: { mo: ['Mo', 'Montag'], di: ['Di', 'Dienstag'], mi: ['Mi', 'Mittwoch'], do: ['Do', 'Donnerstag'], fr: ['Fr', 'Freitag'], sa: ['Sa', 'Samstag'], so: ['So', 'Sonntag'] },
  en: { mo: ['Mon', 'Monday'], di: ['Tue', 'Tuesday'], mi: ['Wed', 'Wednesday'], do: ['Thu', 'Thursday'], fr: ['Fri', 'Friday'], sa: ['Sat', 'Saturday'], so: ['Sun', 'Sunday'] },
};

export const dayShort = (d: Weekday, lang: Lang) => DAY_NAMES[lang][d][0];
export const dayLong = (d: Weekday, lang: Lang) => DAY_NAMES[lang][d][1];

/** ["mo","fr"] -> "Montag und Freitag" */
export function dayList(days: Weekday[], lang: Lang): string {
  const names = days.map((d) => dayLong(d, lang));
  const and = lang === 'de' ? ' und ' : ' and ';
  return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + and + names.at(-1);
}

export const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export async function getSchedule(discipline?: 'kuksoolwon' | 'taichi') {
  const all = (await getCollection('schedule')).map((e) => e.data);
  const list = discipline ? all.filter((s) => s.discipline === discipline) : all;
  return list.sort((a, b) => WEEKDAYS.indexOf(a.days[0]) - WEEKDAYS.indexOf(b.days[0]) || minutes(a.from) - minutes(b.from));
}

export type Slot = Awaited<ReturnType<typeof getSchedule>>[number];

export function ageLabel(s: Slot, lang: Lang): string | undefined {
  if (s.ageMin === undefined) return undefined;
  const y = lang === 'de' ? 'Jahre' : 'years';
  if (s.ageMax === undefined || s.ageMax >= 80) return lang === 'de' ? `ab ${s.ageMin} ${y}` : `${s.ageMin}+ ${y}`;
  return `${s.ageMin}–${s.ageMax} ${y}`;
}

/** A slot as the calendar feeds and the calendar page use it (German title: feeds are German). */
export const toFeed = (s: Slot): FeedSlot => ({
  id: s.id,
  discipline: s.discipline,
  days: s.days,
  from: s.from,
  to: s.to,
  title: s.discipline === 'taichi' ? 'Tai Chi und Qi Gong' : ['Kuk Sool Won', ageLabel(s, 'de')].filter(Boolean).join(', '),
});
