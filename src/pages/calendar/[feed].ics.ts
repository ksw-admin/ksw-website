// Calendar subscriptions: /calendar/training.ics (all groups) and /calendar/<group id>.ics (one group, e.g. for
// parents). Times from schedule.json, closures from closures.json. Calendar apps re-read the file every few hours.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getSchedule, toFeed, type Slot } from '../../lib/schedule';
import { getClosures } from '../../lib/closures-data';
import { getEvents } from '../../lib/events-data';
import { buildCalendar } from '../../lib/ics';
import { site } from '../../lib/site';

export const getStaticPaths = (async () => {
  // Switched off in the CMS: no feeds at all.
  if (!site.calendar) return [];
  const slots = await getSchedule();
  return [
    { params: { feed: 'training' }, props: { slots, name: `${site.shortName}: Training` } },
    ...slots.map((s) => ({ params: { feed: s.id }, props: { slots: [s], name: `${site.shortName}: ${toFeed(s).title}` } })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props, site: base }) => {
  const { slots, name } = props as { slots: Slot[]; name: string };
  const body = buildCalendar({
    name,
    host: base!.host,
    location: [site.hall.street, site.hall.note, site.hall.city].filter(Boolean).join(', '),
    url: new URL('/#schedule', base).href,
    slots: slots.map(toFeed),
    closures: await getClosures(),
    events: await getEvents(),
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
