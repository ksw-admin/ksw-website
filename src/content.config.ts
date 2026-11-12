import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { opt } from './lib/cms-schema';

// Keep the raw file name as id (no slugify), so old URLs with umlauts and ´ stay the same.
const keepName = ({ entry }: { entry: string }) => entry.replace(/\.md$/, '');


// Decap/Netlify CMS wrote tags as a list, older files as a single string.
const tags = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((t) => (t === undefined ? [] : Array.isArray(t) ? t : [t]));

// German entries must have title and description (checked in lib/posts.ts); an English translation file may
// hold only some text fields, so they are optional here.
const post = z.object({
  title: opt(z.string()),
  description: opt(z.string()),
  image: opt(z.string()),
  image_text: opt(z.string()),
  tags,
  // Optional: if missing, the date comes from the file name (YYYY-MM-DD-...).
  date: opt(z.coerce.date()),
  kind: opt(z.enum(['Turnier', 'Prüfung', 'Seminar', 'Verein'])),
  place: opt(z.string()),
  // Shown on the website? Old site: only posts tagged "featured" appeared. See isVisible() in lib/text.ts.
  featured: z.boolean().optional(),
  // Own detail page? Default ("auto"): only if the post has real article text (see lib/posts.ts).
  // CMS select writes "auto" | "ja" | "nein"; true/false also accepted.
  page: z
    .union([z.boolean(), z.enum(['auto', 'ja', 'nein'])])
    .optional()
    .transform((v) => (v === 'ja' ? true : v === 'nein' ? false : v === 'auto' ? undefined : v)),
  // Results as data (feature idea 9): the site adds them up per season.
  medals: z
    .object({
      gold: z.number().int().min(0).default(0),
      silver: z.number().int().min(0).default(0),
      bronze: z.number().int().min(0).default(0),
      other: z.number().int().min(0).default(0),
    })
    .optional(),
});

const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.md', generateId: keepName }),
  schema: post,
});

const disciplines = defineCollection({
  loader: glob({ base: './src/content/disciplines', pattern: '**/*.md', generateId: keepName }),
  schema: z.object({
    title: opt(z.string()),
    description: opt(z.string()),
    tags,
    // Title for search results and link previews (browser tab, Google): may name place and audience. The page
    // heading stays `title`. Empty: `title` is used.
    search_title: opt(z.string()),
    // Title image (CMS "Titelbild"): top of the page next to the title, and the link preview /og/discipline-<slug>.jpg.
    image: opt(z.string()),
    image_text: opt(z.string()),
    galleryImages: z
      .array(z.object({ image: z.string(), link: z.url(), link_text: z.string() }))
      .default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md', generateId: keepName }),
  schema: z.object({ title: z.string(), tags }),
});

const sponsors = defineCollection({
  loader: glob({ base: './src/content/sponsors', pattern: '*.md', generateId: keepName }),
  schema: z.object({
    name: z.string(),
    adresse_1: opt(z.string()),
    adresse_2: opt(z.string()),
    telefon: opt(z.string()),
    link: opt(z.string()),
    image: opt(z.string()),
    image_text: opt(z.string()),
    tags,
  }),
});

// One home for training times (home page week, discipline pages, offline page, schema.org opening hours).
const time = z.string().regex(/^\d{2}:\d{2}$/, 'Zeit als HH:MM, z.B. 18:30');
const schedule = defineCollection({
  // { "slots": [...] }: the CMS can only edit an object at the top level of a file.
  loader: file('src/content/schedule.json', { parser: (text) => JSON.parse(text).slots }),
  schema: z
    .object({
      id: z.string(),
      discipline: z.enum(['kuksoolwon', 'taichi']),
      days: z.array(z.enum(['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'])).min(1),
      from: time,
      to: time,
      ageMin: opt(z.number().int()),
      ageMax: opt(z.number().int()),
      note: opt(z.string()),
    })
    .refine((s) => s.from < s.to, { message: '"to" muss nach "from" liegen' }),
});

// FAQ: one Markdown file per question (src/content/faq/de/, English translations in .../en/).
const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/*.md', generateId: keepName }),
  schema: z.object({
    question: opt(z.string()),
    // Position on the page (small numbers first). Taken from the German entry.
    order: opt(z.number()),
    // Also shown on these pages (Kuk Sool Won / Tai Chi), below the text. Taken from the German entry.
    show_on: z.array(z.enum(['kuksoolwon', 'taichi'])).default([]),
    // Only shown while this website feature is switched on (site.json).
    requires: opt(z.enum(['calendar'])),
  }),
});

export const collections = { news, disciplines, pages, sponsors, schedule, faq };
