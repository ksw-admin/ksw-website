// Home page texts and photos (src/content/home.json, CMS: "Startseite").
// German is complete (checked here); English fields that are missing or empty fall back to German.
import { z } from 'astro/zod';
import raw from '../content/home.json';
import { resolveImage } from './images';
import type { Lang } from '../i18n/ui';

const HOME_FILE = 'src/content/home.json';

const fields = {
  headline: z.string(),
  lead: z.string(),
  description: z.string(),
  photo: z.string(),
  photoAlt: z.string(),
  photoCaption: z.string(),
  kswText: z.string(),
  taichiText: z.string(),
  videoHeading: z.string(),
  masterIntro: z.string(),
  masterPhoto: z.string(),
  masterPhotoAlt: z.string(),
  masterPhotoCaption: z.string(),
  contactHeading: z.string(),
  contactIntro: z.string(),
};
const German = z.object(Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v.min(1, `home.json › de › ${k} is empty`)])) as typeof fields);
const Other = z.object(fields).partial();
const Home = z.object({ de: German, en: Other.optional() });

const data = Home.parse(raw);
export type HomeContent = z.infer<typeof German>;

/** Texts for a language; empty or missing English fields use the German text. */
export function getHome(lang: Lang): HomeContent {
  const other = lang === 'de' ? {} : (data[lang] ?? {});
  const filled = Object.fromEntries(Object.entries(other).filter(([, v]) => typeof v === 'string' && v.trim() !== ''));
  return { ...data.de, ...filled } as HomeContent;
}

/** A photo from home.json (stored in src/content/images/). */
export const homeImage = (ref: string) => resolveImage(HOME_FILE, ref)!;

/** Text with blank lines into paragraphs. */
export const paragraphsOf = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
