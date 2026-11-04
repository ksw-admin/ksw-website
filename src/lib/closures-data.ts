// Closures from the CMS (src/content/closures.json), only those not over yet at build time.
// Read directly (not a content collection): an empty list is the normal state, and Astro would warn about an empty
// collection on every page. The build still fails on a broken entry, with the message below.
import { z } from 'astro/zod';
import raw from '../content/closures.json';
import { isCurrent, todayInGermany, type Closure } from './closures';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum als JJJJ-MM-TT');
// Decap writes "" or null for empty optional fields.
const opt = <T extends z.ZodType>(s: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), s.optional());
const Closures = z.object({
  items: z
    .array(
      z
        .object({
          from: date,
          to: opt(date),
          text: z.string().min(1),
          text_en: opt(z.string()),
          groups: opt(z.enum(['alle', 'kuksoolwon', 'taichi'])),
          announce: opt(z.number().int().min(0, 'Vorher anzeigen: mindestens 0 Tage').max(365, 'Vorher anzeigen: höchstens 365 Tage')),
        })
        .refine((c) => !c.to || c.to >= c.from, { message: 'Trainingsausfälle: "bis" muss am oder nach "von" liegen' }),
    )
    .default([]),
});

const all: Closure[] = Closures.parse(raw).items;

export async function getClosures(): Promise<Closure[]> {
  const today = todayInGermany();
  return all.filter((c) => isCurrent(c, today)).sort((a, b) => a.from.localeCompare(b.from));
}
