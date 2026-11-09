import { z } from 'astro/zod';
import raw from '../content/site.json';

// site.json is the one home for contact data and the master's credentials (CMS file collection later).
const Site = z.object({
  name: z.string(),
  shortName: z.string(),
  description: z.string(),
  contactName: z.string(),
  email: z.email(),
  phones: z.array(z.object({ label: z.string(), value: z.string(), primary: z.boolean().optional() })).min(1),
  hall: z.object({ street: z.string(), note: z.string().optional().or(z.literal('')), city: z.string(), osm: z.url() }),
  master: z.object({
    dan: z.number().int(),
    since: z.number().int(),
    // Area + qualification, worded as on the old site's "Über mich" list.
    credentials: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  // Profiles (Instagram, Facebook, YouTube, Flickr ...): footer, contact band, schema.org sameAs.
  social: z.array(z.object({ name: z.string(), url: z.url(), label: z.string().optional() })).default([]),
  // Home page video. Either our own file (src, e.g. /video/x.mp4, plus a poster image; nothing loads before "play")
  // or a YouTube id (loads from YouTube only after a click). src wins if both are set.
  // The heading above the video is a home page text (home.json › videoHeading).
  video: z
    .object({
      src: z.string().regex(/^\/.+\.mp4$/, 'path like /video/name.mp4').optional().or(z.literal('')),
      poster: z.string().optional().or(z.literal('')),
      youtubeId: z.string().regex(/^[\w-]{11}$/).optional().or(z.literal('')),
      title: z.string(),
    })
    .refine((v) => v.src || v.youtubeId, 'video: set a file (src) or a YouTube id')
    .optional(),
  // Footer credit for whoever built the site; the link (e.g. a LinkedIn profile) is optional.
  credit: z
    .object({ text: z.string().min(1), url: z.url().optional().or(z.literal('')) })
    .default({ text: 'Website: Jonah L.', url: '' }),
  // Contact form on the contact page (Netlify Forms "kontakt"). Off: phone and email only.
  contactForm: z.boolean().default(false),
  // Calendar subscriptions (/calendar/*.ics, links under the timetable, FAQ answer). Off: none of it is built.
  calendar: z.boolean().default(true),
  // Calendar page /dates/ (training, closures and dates by week; links from the timetable and "Demnächst"). Off: not built.
  calendarPage: z.boolean().default(false),
  // FAQ question form (Netlify Forms). Off: the FAQ points to phone and email instead.
  questionForm: z.boolean().default(false),
  // Cloudflare Web Analytics (cookieless, no consent banner needed). Empty token = no analytics.
  analytics: z.object({ cloudflareToken: z.string().regex(/^([0-9a-f]{32})?$/, '32 hex characters from the Cloudflare dashboard') }).default({ cloudflareToken: '' }),
});

export const site = Site.parse(raw);

export const primaryPhone = site.phones.find((p) => p.primary) ?? site.phones[0];

export { telHref } from './phone';
