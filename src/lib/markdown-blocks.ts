// Markdown plugin for Astro's Sätteri processor (astro.config.mjs): turns special paragraphs into site blocks.
// - a lone YouTube link: the click-to-load player (src/lib/youtube.ts);
// - a lone linked photo described "Fotoalbum: …": an album tile (src/lib/blocks.ts).
// Logic is in those pure modules and tested in tests/youtube.test.ts and tests/blocks.test.ts.
import { fileURLToPath } from 'node:url';
import { defineHastPlugin, defineMdastPlugin } from 'satteri';
import { ALBUM_SIZES, albumLabelHtml, albumOfParagraph, PHOTO_ROW_SIZES } from './blocks.ts';
import { langOfPath, videoHtml, videoOfParagraph } from './youtube.ts';

export const markdownBlocks = defineMdastPlugin({
  name: 'ksw-markdown-blocks',
  paragraph(node, ctx) {
    const lang = ctx.fileURL ? langOfPath(fileURLToPath(ctx.fileURL)) : 'de';
    const video = videoOfParagraph(node.children as never);
    if (video) {
      ctx.replaceNode(node, { type: 'html', value: videoHtml(video.id, video.title, lang) });
      return;
    }
    const album = albumOfParagraph(node.children as never);
    if (album) {
      // The tile: the paragraph becomes <div class="album-card">, the photo's description moves into visible text.
      ctx.setProperty(node, 'data', { hName: 'div', hProperties: { className: ['album-card'] } });
      ctx.setProperty(album.link as never, 'data', { hProperties: { rel: 'noopener' } });
      ctx.setProperty(album.image as never, 'alt' as never, '' as never);
      ctx.appendChild(album.link as never, { type: 'html', value: albumLabelHtml(album.title, album.url, lang) });
    }
  },
});

type El = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: readonly El[] };
const classes = (n: El | undefined) => (Array.isArray(n?.properties?.className) ? (n!.properties!.className as string[]) : []);

/**
 * Display sizes for photos in the blocks, so the browser loads a small version (image.layout in astro.config.mjs
 * gives Markdown photos several versions; without this it assumes full screen width). Runs before Astro's own
 * image step, which keeps a given `sizes`.
 * - photo row: a paragraph of two or more photos and nothing else;
 * - album tile: the photo inside div.album-card.
 */
export const blockImageSizes = defineHastPlugin({
  name: 'ksw-block-image-sizes',
  element: [
    {
      filter: ['img'],
      visit(node, ctx) {
        const parent = ctx.parent(node) as El | undefined;
        if (parent?.tagName === 'a' && classes(ctx.parent(parent as never) as El).includes('album-card')) {
          ctx.setProperty(node, 'sizes', ALBUM_SIZES);
          return;
        }
        const kids = (parent?.children ?? []).filter((c) => !(c.type === 'text' && !String((c as { value?: string }).value ?? '').trim()));
        if (parent?.tagName === 'p' && kids.length >= 2 && kids.every((c) => c.type === 'element' && c.tagName === 'img')) {
          ctx.setProperty(node, 'sizes', PHOTO_ROW_SIZES);
        }
      },
    },
  ],
});
