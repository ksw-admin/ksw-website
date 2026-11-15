// Code of conduct (src/content/conduct.json, CMS: Einstellungen › Verhaltenskodex) in a language. German is the
// source; an English text left empty in the CMS shows in German.
import conduct from '../content/conduct.json';
import type { Lang } from '../i18n/ui';

type Text = { title?: string; text?: string };
type Rule = { sign: string; word: string; de: Text; en?: Text };

export function getConduct(lang: Lang) {
  const rules = (conduct.rules as Rule[]).map((r) => ({
    sign: r.sign,
    word: r.word,
    title: r[lang]?.title?.trim() || r.de.title || '',
    text: r[lang]?.text?.trim() || r.de.text || '',
  }));
  const titles = conduct as { de: { title: string }; en?: { title?: string } };
  return { title: titles[lang]?.title?.trim() || titles.de.title, rules };
}
