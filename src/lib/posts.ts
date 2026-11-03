import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { resolveImage, type ContentImage } from './images';

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

/** Text longer than this (or a Markdown body) gets an own page. */
const PAGE_MIN_CHARS = 500;

const DATE_IN_NAME = /^(\d{4}-\d{2}-\d{2})/;

/** "de/2026-05-31-gürtelprüfung-2026" -> { lang: "de", slug: "2026-05-31-gürtelprüfung-2026" } */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

/**
 * CMS texts carry hard line breaks from the old editor ("bedankt sich bei" / "den Coach").
 * Blank lines separate paragraphs. Inside a paragraph:
 * - a list (3+ lines, all short, like "Platz Leichtkontakt bis 10 Jahre") keeps its line breaks;
 * - otherwise a line break stays after a full sentence (. ! ? :) or after a short heading-like line followed by a
 *   capital letter ("International Open German Championships" / "In Arnsberg"); wrapped lines are joined with a space.
 */
const keepBreak = (prev: string, next: string) => /[.!?:]$/.test(prev) || (prev.length < 45 && /^\p{Lu}/u.test(next));
export function cleanParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 3 && lines.every((l) => l.length < 70)) return lines.join('\n');
      return lines.reduce((out, line, i) => (i === 0 ? line : out + (keepBreak(lines[i - 1], line) ? '\n' : ' ') + line), '');
    })
    .filter(Boolean);
}

function toPost(collection: Post['collection'], entry: Post['entry']): Post {
  const { lang, slug } = splitId(entry.id);
  const fromName = DATE_IN_NAME.exec(slug)?.[1];
  const date = entry.data.date ?? (fromName ? new Date(fromName + 'T12:00:00') : new Date(0));
  const base = collection === 'news' ? '/aktuelles/' : '/articles/';
  const prefix = lang === 'de' ? '' : `/${lang}`;
  const image = resolveImage(entry.filePath, entry.data.image);
  const paragraphs = cleanParagraphs(entry.data.description);
  const hasBody = (entry.body ?? '').replace(/<!--.*?-->/gs, '').trim().length > 0;
  // Articles always keep their page: their URLs exist since the old site.
  const hasPage = entry.data.page ?? (collection === 'articles' || hasBody || entry.data.description.length > PAGE_MIN_CHARS);
  return { collection, entry, slug, lang, date, hasPage, href: hasPage ? `${prefix}${base}${slug}/` : undefined, image, paragraphs };
}

/** News and articles merged, newest first. */
export async function getPosts(lang: Lang = 'de'): Promise<Post[]> {
  const [news, articles] = await Promise.all([getCollection('news'), getCollection('articles')]);
  return [...news.map((e) => toPost('news', e)), ...articles.map((e) => toPost('articles', e))]
    .filter((p) => p.lang === lang)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function medalTotal(posts: Post[]): number {
  return posts.reduce((n, p) => {
    const m = p.entry.data.medals;
    return n + (m ? m.gold + m.silver + m.bronze + m.other : 0);
  }, 0);
}
