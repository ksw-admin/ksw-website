// Videos in Markdown texts (posts, discipline pages). Stored as a plain link on its own line:
//   [Video: Gürtelprüfung 2026](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
// so the text stays readable anywhere (GitHub, an old build: just a link). The Markdown plugin turns such a
// paragraph (src/lib/markdown-blocks.ts) into the click-to-load player of the home page (no request to Google before the click; script and
// styles: PostPage.astro / global.css .yt-embed). CMS: editor component "Video" in src/admin/preview.ts.
// Pure functions, no dependencies (also bundled into the CMS preview).

/** The 11-character video id from any usual YouTube link (watch, youtu.be, shorts, embed, nocookie), else null. */
export function youtubeId(url: string): string | null {
  const m =
    /^https?:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec(url) ??
    /^https?:\/\/youtu\.be\/([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

/** The Markdown line the CMS writes. */
export const videoLine = (id: string, title: string) => `[Video: ${title.trim() || 'Video'}](https://www.youtube.com/watch?v=${id})`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Player placeholder HTML (German and English labels: the page language decides via the lang of the text). */
export function videoHtml(id: string, title: string, lang: 'de' | 'en' = 'de'): string {
  const de = lang === 'de';
  const t = esc(title);
  return (
    `<figure class="yt-embed" data-yt="${id}" data-title="${t}">` +
    `<button type="button" class="yt-play"><span class="yt-icon" aria-hidden="true"></span><span class="yt-text">` +
    `<strong>${t}</strong><small>${de ? 'Video abspielen. Lädt den Player von YouTube, dabei werden Daten an Google übertragen.' : 'Play video. Loads the player from YouTube, which sends data to Google.'}</small>` +
    `</span></button>` +
    `<figcaption><a href="https://www.youtube.com/watch?v=${id}" rel="noopener">${de ? 'Auf YouTube ansehen' : 'Watch on YouTube'}</a></figcaption>` +
    `</figure>`
  );
}

type Node = { type: string; url?: string; value?: string; children?: readonly Node[] };
const textOf = (n: Node): string => (n.value ?? '') + (n.children ?? []).map(textOf).join('');

/**
 * A paragraph that is only a YouTube link (whitespace around it allowed) is a video: its id and title
 * (the link text without a leading "Video: "). Anything else: null. Used by the Markdown plugin
 * (src/lib/markdown-blocks.ts) and the tests.
 */
export function videoOfParagraph(children: readonly Node[]): { id: string; title: string } | null {
  const parts = children.filter((c) => !(c.type === 'text' && !c.value?.trim()));
  const link = parts.length === 1 && parts[0].type === 'link' ? parts[0] : null;
  const id = link?.url ? youtubeId(link.url) : null;
  if (!link || !id) return null;
  return { id, title: textOf(link).replace(/^\s*Video:\s*/i, '').trim() || 'Video' };
}

/** Language of a Markdown file from its path (src/content/<collection>/en/... = English). */
export const langOfPath = (path: string): 'de' | 'en' => (/[\\/]en[\\/]/.test(path) ? 'en' : 'de');
