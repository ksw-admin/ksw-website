// Pure text rules for posts (no Astro imports, so `npm test` can load this file directly).

/** Text longer than this (or a Markdown body) gets an own page. Keep in sync with the CMS preview in src/pages/admin/index.astro. */
export const PAGE_MIN_CHARS = 500;

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
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 3 && lines.every((l) => l.length < 70)) return lines.join('\n');
      return lines.reduce((out, line, i) => (i === 0 ? line : out + (keepBreak(lines[i - 1], line) ? '\n' : ' ') + line), '');
    })
    .filter(Boolean);
}

/**
 * Is a post shown on the website? The CMS switch "Auf der Website anzeigen" (featured) wins;
 * without it, the old site's rule applies: only posts tagged "featured" were shown.
 */
export function isVisible(post: { featured?: boolean; tags?: string[] }): boolean {
  if (post.featured !== undefined) return post.featured;
  return (post.tags ?? []).includes('featured');
}

/** True if a Markdown body has real content (HTML comments from the old editor don't count). */
export const hasRealBody = (body: string | undefined) => (body ?? '').replace(/<!--.*?-->/gs, '').trim().length > 0;

/**
 * Does a post get its own detail page?
 * - "page" set in the CMS (ja/nein -> true/false) always wins;
 * - old articles always keep their page (their /articles/ URLs exist since the old site);
 * - otherwise only posts with a long text (Markdown body, or a description over PAGE_MIN_CHARS).
 */
export function decideHasPage(post: {
  collection: 'news' | 'articles';
  override?: boolean;
  description: string;
  body?: string;
}): boolean {
  if (post.override !== undefined) return post.override;
  if (post.collection === 'articles') return true;
  return hasRealBody(post.body) || post.description.length > PAGE_MIN_CHARS;
}
