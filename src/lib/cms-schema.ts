// Small schema helpers for data written by the CMS (Decap), shared by the content collections
// (src/content.config.ts) and the JSON files read directly (closures-data.ts, events-data.ts).
import { z } from 'astro/zod';

/** Optional field: Decap writes "" or null for an empty one; treat both as "not set". */
export const opt = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

/** A date as YYYY-MM-DD; `context` starts the build error (e.g. "Termine"), so the editor knows where to look. */
export const isoDate = (context?: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, `${context ? `${context}: ` : ''}Datum als JJJJ-MM-TT`);
