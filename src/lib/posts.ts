import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { resolveImage, type ContentImage } from './images';
import { cleanParagraphs, decideHasPage, isVisible } from './text';

export type Post = {
  collection: 'news' | 'articles';
  entry: CollectionEntry<'news'> | CollectionEntry<'articles'>;
  slug: string;
  lang: Lang;
  date: Date;
  /** Has its own detail page. Short posts (a sentence and a photo) show completely in the list instead. */
  hasPage: boolean;
  href?: string;
  image?: ContentImage;
  paragraphs: string[];
};

export { cleanParagraphs } from './text';

const DATE_IN_NAME = /^(\d{4}-\d{2}-\d{2})/;

/** "de/2026-05-31-gürtelprüfung-2026" -> { lang: "de", slug: "2026-05-31-gürtelprüfung-2026" } */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

function toPost(collection: Post['collection'], entry: Post['entry']): Post {
  const { lang, slug } = splitId(entry.id);
  const fromName = DATE_IN_NAME.exec(slug)?.[1];
  const date = entry.data.date ?? (fromName ? new Date(fromName + 'T12:00:00') : new Date(0));
  const base = collection === 'news' ? '/aktuelles/' : '/articles/';
  const prefix = lang === 'de' ? '' : `/${lang}`;
  const image = resolveImage(entry.filePath, entry.data.image);
  const paragraphs = cleanParagraphs(entry.data.description);
  const hasPage = decideHasPage({ collection, override: entry.data.page, description: entry.data.description, body: entry.body });
  return { collection, entry, slug, lang, date, hasPage, href: hasPage ? `${prefix}${base}${slug}/` : undefined, image, paragraphs };
}

/** News and articles merged, newest first. Hidden posts (CMS switch off) are left out everywhere. */
export async function getPosts(lang: Lang = 'de'): Promise<Post[]> {
  const [news, articles] = await Promise.all([getCollection('news'), getCollection('articles')]);
  return [...news.map((e) => toPost('news', e)), ...articles.map((e) => toPost('articles', e))]
    .filter((p) => p.lang === lang && isVisible(p.entry.data))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function medalTotal(posts: Post[]): number {
  return posts.reduce((n, p) => {
    const m = p.entry.data.medals;
    return n + (m ? m.gold + m.silver + m.bronze + m.other : 0);
  }, 0);
}
