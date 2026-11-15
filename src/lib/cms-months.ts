// Month options for the CMS select "Stattdessen: ungefähres Datum" (Termine): month and year in one choice, so a
// month without a year cannot be saved. Generated at every build (src/pages/admin/config.yml.ts), so the list
// moves with time and never runs out. Pure; tested in tests/cms-months.test.ts.
import { MONTHS } from './dates.ts';

/** { label: "November 2026", value: "2026-11" } from `back` months before `today`'s month to `ahead` after it. */
export function approxMonthOptions(today: string, back = 12, ahead = 36): { label: string; value: string }[] {
  const [y, m] = today.split('-').map(Number);
  const out: { label: string; value: string }[] = [];
  for (let i = -back; i <= ahead; i++) {
    const idx = y * 12 + (m - 1) + i;
    const year = Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    out.push({ label: `${MONTHS.de[month - 1]} ${year}`, value: `${year}-${String(month).padStart(2, '0')}` });
  }
  return out;
}

/** The options as a YAML flow sequence for the config template. */
export const optionsYaml = (opts: { label: string; value: string }[]) =>
  '[' + opts.map((o) => `{ label: '${o.label}', value: '${o.value}' }`).join(', ') + ']';
