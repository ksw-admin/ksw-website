// Photo blocks in Markdown reports (CMS editor components in src/admin/preview.ts). Pure functions, no dependencies.
//
// Fotoreihe (2 to 4 photos side by side), plain Markdown inside an HTML wrapper, so Astro still optimizes the photos:
//   <div class="photo-row">
//
//   ![Siegerehrung](images/a.jpg)
//   ![Team](images/b.jpg)
//
//   </div>
// Styles: global.css .photo-row. No plugin needed.
//
// Fotoalbum (tile linking to an album, like the gallery on the discipline pages), a linked photo on its own line:
//   [![Fotoalbum: New Generation Turnier](images/cover.jpg)](https://www.flickr.com/photos/…)
// The Markdown plugin (src/lib/markdown-blocks.ts) turns it into the tile; without it, it is just a clickable photo.

/** The part of a Markdown (mdast) node the block detection reads. */
export type MdNode = { type: string; url?: string; alt?: string | null; value?: string; children?: readonly MdNode[] };
type Node = MdNode;

const ALBUM = /^\s*Fotoalbum:\s*/i;

/** A paragraph that is only a link around one photo whose description starts with "Fotoalbum:". */
export function albumOfParagraph(children: readonly Node[]): { url: string; title: string; link: Node; image: Node } | null {
  const parts = children.filter((c) => !(c.type === 'text' && !c.value?.trim()));
  const link = parts.length === 1 && parts[0].type === 'link' ? parts[0] : null;
  const inner = (link?.children ?? []).filter((c) => !(c.type === 'text' && !c.value?.trim()));
  const image = inner.length === 1 && inner[0].type === 'image' ? inner[0] : null;
  if (!link?.url || !image || !ALBUM.test(image.alt ?? '') || !/^https?:\/\//.test(link.url)) return null;
  return { url: link.url, title: (image.alt ?? '').replace(ALBUM, '').trim() || 'Fotoalbum', link, image };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Text under the album photo: title, and where the album is ("auf Flickr" when it is Flickr). */
export function albumLabelHtml(title: string, url: string, lang: 'de' | 'en' = 'de'): string {
  const flickr = /(^|\.)flickr\.com$/.test(new URL(url).hostname) || /flic\.kr$/.test(new URL(url).hostname);
  const where = lang === 'de' ? (flickr ? 'Alle Fotos auf Flickr' : 'Alle Fotos im Album') : flickr ? 'All photos on Flickr' : 'All photos in the album';
  return `<span class="album-text"><strong>${esc(title)}</strong><span>${where}</span></span>`;
}

/** The Markdown the CMS writes for a photo row (photos one per line, inside the wrapper). */
export function photoRowBlock(images: { image?: string; alt?: string }[]): string {
  const lines = images.filter((i) => i.image).map((i) => `![${(i.alt ?? '').replace(/[[\]\n]/g, ' ').trim()}](${i.image})`);
  return `<div class="photo-row">\n\n${lines.join('\n')}\n\n</div>`;
}

/** Back from the stored Markdown to the CMS fields. */
export function photoRowFields(inner: string): { images: { image: string; alt: string }[] } {
  return { images: [...inner.matchAll(/!\[([^\]\n]*)\]\(([^)\s]+)\)/g)].map((m) => ({ alt: m[1], image: m[2] })) };
}

/** The Markdown the CMS writes for an album tile. */
export const albumLine = (title: string, image: string, url: string) =>
  `[![Fotoalbum: ${title.replace(/[[\]\n]/g, ' ').trim()}](${image})](${url.trim()})`;

/** Display sizes for the browser to pick a photo version (global.css: .photo-row, .album-card). */
export const PHOTO_ROW_SIZES = '(max-width: 600px) 50vw, 260px';
export const ALBUM_SIZES = '144px';
