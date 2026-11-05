import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { resolveImage, type ContentImage } from './images';
import { cleanParagraphs, decideHasPage, isVisible } from './text';

type Entry = CollectionEntry<'news'>;

export type Post = {
  collection: 'news';
  /** The German entry: date, type, place, medals, photo and visibility always come from here. */
  entry: Entry;
  /** The entry whose text is shown: the English one when the post is translated and shown in English. */
  textEntry: Entry;
  slug: string;
  /** Language of the page the post is listed on / rendered for. */
  lang: Lang;
  /** Language of the shown title ('de' on an English page means: not translated yet). */
  textLang: Lang;
  /** Language of the shown short text (an English translation may have only a title). */
  descriptionLang: Lang;
  /** An English translation exists (for hreflang and the language switch). */
  translated: boolean;
  title: string;
  description: string;
  imageText?: string;
  date: Date;
  /** Has its own detail page. Short posts (a sentence and a photo) show completely in the list instead. */
  hasPage: boolean;
  href?: string;
  /** Addresses of the post's page in each language that really exists (no entry = untranslated). */
  alternate?: { de?: string; en?: string };
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

/** An English file counts as a translation once it has a title; its missing fields show the German text. */
const isTranslation = (e?: Entry) => !!e?.data.title?.trim();

function toPost(collection: Post['collection'], de: Entry, en: Entry | undefined, lang: Lang): Post {
  const { slug } = splitId(de.id);
  if (!de.data.title?.trim() || !de.data.description?.trim()) {
    throw new Error(`${de.filePath}: German posts need a title and a short text (Titel, Kurztext).`);
  }
  const translated = isTranslation(en);
  const text = lang === 'en' && translated ? en! : de;
  const title = text.data.title!.trim();
  const descriptionEntry = text.data.description?.trim() ? text : de;
  const description = descriptionEntry.data.description!;
  const fromName = DATE_IN_NAME.exec(slug)?.[1];
  const date = de.data.date ?? (fromName ? new Date(fromName + 'T12:00:00') : new Date(0));
  const base = '/articles/';
  const prefix = lang === 'de' ? '' : `/${lang}`;
  // Page or not is decided on the German post, so both languages have the same pages.
  const hasPage = decideHasPage({ collection, override: de.data.page, description: de.data.description!, body: de.body });
  const alternate = hasPage ? { de: `${base}${slug}/`, ...(translated ? { en: `/en${base}${slug}/` } : {}) } : undefined;
  return {
    collection,
    entry: de,
    textEntry: text,
    slug,
    lang,
    textLang: text === de ? 'de' : lang,
    descriptionLang: descriptionEntry === de ? 'de' : lang,
    translated,
    title,
    description,
    imageText: text.data.image_text ?? de.data.image_text,
    date,
    hasPage,
    href: hasPage ? `${prefix}${base}${slug}/` : undefined,
    alternate,
    image: resolveImage(de.filePath, de.data.image),
    paragraphs: cleanParagraphs(description),
  };
}

/**
 * All posts (Aktuelles; the old "Artikel" were moved in on 2026-11-04), newest first, for a page in `lang`. German entries are the source; on English pages a
 * post shows its English text if translated, else its German text. Hidden posts are left out everywhere.
 */
export async function getPosts(lang: Lang = 'de'): Promise<Post[]> {
  const out: Post[] = [];
  for (const collection of ['news'] as const) {
    const entries = (await getCollection(collection)) as Entry[];
    const english = new Map(entries.filter((e) => e.id.startsWith('en/')).map((e) => [splitId(e.id).slug, e]));
    for (const de of entries.filter((e) => e.id.startsWith('de/'))) {
      if (!isVisible(de.data)) continue;
      out.push(toPost(collection, de, english.get(splitId(de.id).slug), lang));
    }
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function medalTotal(posts: Post[]): number {
  return posts.reduce((n, p) => {
    const m = p.entry.data.medals;
    return n + (m ? m.gold + m.silver + m.bronze + m.other : 0);
  }, 0);
}
