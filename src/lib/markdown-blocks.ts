// Markdown plugin for Astro's Sätteri processor (astro.config.mjs): turns special paragraphs into site blocks.
// - a lone YouTube link: the click-to-load player (src/lib/youtube.ts);
// - a lone linked photo described "Fotoalbum: …": an album tile (src/lib/blocks.ts).
// Logic is in those pure modules and tested in tests/youtube.test.ts and tests/blocks.test.ts.
import { fileURLToPath } from 'node:url';
import { defineMdastPlugin } from 'satteri';
import { albumLabelHtml, albumOfParagraph } from './blocks.ts';
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
