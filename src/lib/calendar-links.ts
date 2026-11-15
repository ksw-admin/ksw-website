// Subscribe links for the calendar feeds (src/pages/calendar/[feed].ics.ts): used by the calendar page and, when
// that page is off, under the timetable. webcal:// opens the subscribe dialog of Apple Calendar and Outlook; Google
// takes the feed as "cid" and shows its own "add calendar" dialog (in the browser; Android then syncs it).

/** webcal:// address of a feed: "training" (all groups) or a group id. */
export const webcalUrl = (host: string, feed: string) => `webcal://${host}/calendar/${feed}.ics`;

/** Google Calendar's "add calendar" page for a feed. */
export const googleCalendarUrl = (host: string, feed: string) =>
  `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl(host, feed))}`;
