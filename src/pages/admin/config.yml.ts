// /admin/config.yml for Decap CMS, generated at build time from the template src/admin/config.yml: fills in the
// month options of the Termine select (12 months back to 36 ahead), so the list never runs out. Every CMS publish
// triggers a build, so it stays current on its own.
import type { APIRoute } from 'astro';
import template from '../../admin/config.yml?raw';
import { approxMonthOptions, optionsYaml } from '../../lib/cms-months';
import { todayInGermany } from '../../lib/dates';

export const prerender = true;

export const GET: APIRoute = () => {
  if (template.split('__APPROX_MONTH_OPTIONS__').length !== 2) throw new Error('src/admin/config.yml: __APPROX_MONTH_OPTIONS__ must occur exactly once');
  const body = template.replace('__APPROX_MONTH_OPTIONS__', optionsYaml(approxMonthOptions(todayInGermany())));
  return new Response(body, { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
};
