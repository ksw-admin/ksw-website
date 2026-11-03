// Kuk Sool Won / Tai Chi pages in a language: German entry as source, English text overlaid when translated.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { splitId } from './posts';

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
  description?: string;
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
      // An English file counts as a translation only with a title and a text.
      const translated = !!(en?.data.title?.trim() && en.body?.trim());
      const text = lang === 'en' && translated ? en! : de;
      return {
        slug,
        lang,
        entry: de,
        textEntry: text,
        textLang: text === de ? 'de' : lang,
        translated,
        title: text.data.title!.trim(),
        description: text.data.description ?? de.data.description,
        alternate: { de: `/category/${slug}/`, ...(translated ? { en: `/en/category/${slug}/` } : {}) },
      };
    });
}
