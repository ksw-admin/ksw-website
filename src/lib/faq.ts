// FAQ in a language: German entries are the source (order, which questions exist), English text overlaid per entry
// once it has a question. Untranslated answers show in German (marked with lang="de").
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { splitId } from './posts';

type Entry = CollectionEntry<'faq'>;

export type Faq = {
  slug: string;
  question: string;
  questionLang: Lang;
  /** Entry whose answer (Markdown body) is shown. */
  answerEntry: Entry;
  answerLang: Lang;
};

export async function getFaq(lang: Lang): Promise<Faq[]> {
  const all = await getCollection('faq');
  const english = new Map(all.filter((e) => e.id.startsWith('en/')).map((e) => [splitId(e.id).slug, e]));
  return all
    .filter((e) => e.id.startsWith('de/'))
    .map((de) => {
      const slug = splitId(de.id).slug;
      if (!de.data.question?.trim()) throw new Error(`${de.filePath}: German FAQ entry needs a question.`);
      if (!de.body?.trim()) throw new Error(`${de.filePath}: German FAQ entry needs an answer.`);
      const en = lang === 'en' ? english.get(slug) : undefined;
      const q = en?.data.question?.trim();
      const answer = en?.body?.trim() ? en : de;
      return {
        slug,
        order: de.data.order ?? 999,
        question: q || de.data.question!.trim(),
        questionLang: q ? lang : 'de',
        answerEntry: answer,
        answerLang: answer === de ? 'de' : lang,
      } as Faq & { order: number };
    })
    .sort((a, b) => a.order - b.order || a.question.localeCompare(b.question, 'de'));
}

/** Markdown answer as plain text (schema.org FAQPage): links keep their text, formatting marks go. */
export const plainAnswer = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
