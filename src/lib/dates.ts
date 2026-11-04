// Calendar dates as plain "YYYY-MM-DD" strings in German local time: no time zone maths, no off-by-one at midnight
// UTC. Shared by closures, dates (Termine), the calendar page and the calendar feeds. Pure functions, no Astro imports.

const toUtc = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return Date.UTC(y, m - 1, day);
};
const fromUtc = (t: number) => new Date(t).toISOString().slice(0, 10);

/** The date n days later (n < 0: earlier). */
export const addDays = (d: string, n: number) => fromUtc(toUtc(d) + n * 86_400_000);

/** Weekday as in schedule.json: mo..so. */
export function weekday(d: string): 'mo' | 'di' | 'mi' | 'do' | 'fr' | 'sa' | 'so' {
  return (['so', 'mo', 'di', 'mi', 'do', 'fr', 'sa'] as const)[new Date(toUtc(d)).getUTCDay()];
}

/** Today in Germany as YYYY-MM-DD (sv-SE formats dates as ISO). */
export const todayInGermany = (now = new Date()) => now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

/** Month names, January first. */
export const MONTHS = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
} as const;

/** Short English month names ("9 May"); German short dates use numbers ("9.5."). */
export const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Short weekday names, Sunday first (index = Date#getUTCDay()). */
export const WEEKDAYS_SHORT = {
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
} as const;
