// Closures from the CMS (src/content/closures.json), only those not over yet at build time.
import { getCollection } from 'astro:content';
import { isCurrent, todayInGermany, type Closure } from './closures';

export async function getClosures(): Promise<Closure[]> {
  const today = todayInGermany();
  return (await getCollection('closures'))
    .map((e) => e.data as Closure)
    .filter((c) => isCurrent(c, today))
    .sort((a, b) => a.from.localeCompare(b.from));
}
