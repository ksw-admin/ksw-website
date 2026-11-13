// Kuk Sool Won / Tai Chi pages in a language: German entry as source, English text overlaid when translated.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { splitId } from './posts';
import { resolveImage } from './images';

type Entry = CollectionEntry<'disciplines'>;

export type Discipline = {
  slug: 'kuksoolwon' | 'taichi';
  lang: Lang;
  /** German entry: gallery always comes from here. */
  entry: Entry;
  /** Entry whose title and text are shown. */
  textEntry: Entry;
  textLang: Lang;
  translated: boolean;
  title: string;
  /** Title for search results and previews (search_title of the shown language's entry); else `title`. */
  searchTitle?: string;
  description?: string;
  /** Link preview photo (German entry's image, alt text in the shown language if translated). */
  preview?: { fsPath: string; alt?: string };
  alternate: { de: string; en?: string };
};

export async function getDisciplines(lang: Lang): Promise<Discipline[]> {
  const all = await getCollection('disciplines');
  const english = new Map(all.filter((e) => e.id.startsWith('en/')).map((e) => [splitId(e.id).slug, e]));
  return all
    .filter((e) => e.id.startsWith('de/'))
    .map((de) => {
      const slug = splitId(de.id).slug as Discipline['slug'];
      if (!de.data.title?.trim()) throw new Error(`${de.filePath}: German page needs a title.`);
      const en = english.get(slug);
      // An English file counts as a translation once it has a title; a missing text shows the German one.
      const translated = !!en?.data.title?.trim();
      const text = lang === 'en' && translated ? en! : de;
      return {
        slug,
        lang,
        entry: de,
        textEntry: text,
        textLang: text === de ? 'de' : lang,
        translated,
        title: text.data.title!.trim(),
        searchTitle: text.data.search_title?.trim() || undefined,
        description: text.data.description ?? de.data.description,
        preview: de.data.image
          ? { fsPath: resolveImage(de.filePath, de.data.image)!.fsPath, alt: text.data.image_text ?? de.data.image_text }
          : undefined,
        alternate: { de: `/category/${slug}/`, ...(translated ? { en: `/en/category/${slug}/` } : {}) },
      };
    });
}
