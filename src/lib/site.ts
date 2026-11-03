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
    credentials: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  // Profiles (Instagram, Facebook, YouTube, Flickr ...): footer, contact band, schema.org sameAs.
  social: z.array(z.object({ name: z.string(), url: z.url(), label: z.string().optional() })).default([]),
  // Home page video. Loads from YouTube only after a click (privacy, no Google request on page view).
  video: z.object({ youtubeId: z.string().regex(/^[\w-]{11}$/), title: z.string(), heading: z.string() }).optional(),
});

export const site = Site.parse(raw);

export const primaryPhone = site.phones.find((p) => p.primary) ?? site.phones[0];

/** "0170 - 90 42 408" -> "+491709042408" for tel: links (German numbers). */
export function telHref(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  return 'tel:' + (digits.startsWith('0') ? '+49' + digits.slice(1) : digits);
}
