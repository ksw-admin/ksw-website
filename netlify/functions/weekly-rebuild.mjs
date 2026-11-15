// Weekly rebuild (Mondays 03:00 UTC, so 04:00/05:00 in Germany), even when nothing changed in the CMS.
// Why: the calendar page (/dates/) lays out 13 weeks from the build day; without a deploy it would slowly run out.
// The calendar feeds, "Demnächst" and the closure banner need no rebuild (rules, or hidden in the browser).
// Netlify runs scheduled functions only on the published (production) deploy, not on branch deploys.
// Setup (Netlify UI): Site configuration › Build & deploy › Build hooks › branch main; store the hook URL as the
// environment variable REBUILD_HOOK_URL (secret: anyone with it can start deploys, so never in the repo).
export default async () => {
  const hook = process.env.REBUILD_HOOK_URL;
  if (!hook) {
    console.error('weekly-rebuild: REBUILD_HOOK_URL is not set, no rebuild started');
    return;
  }
  const res = await fetch(hook, { method: 'POST' });
  console.log(`weekly-rebuild: build hook answered ${res.status}`);
};

export const config = { schedule: '0 3 * * 1' };
