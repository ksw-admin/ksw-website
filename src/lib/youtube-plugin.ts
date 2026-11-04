// Markdown plugin for Astro's Sätteri processor (astro.config.mjs): a paragraph that is only a YouTube link
// becomes the click-to-load player. Logic and HTML: src/lib/youtube.ts (tested in tests/youtube.test.ts).
import { fileURLToPath } from 'node:url';
import { defineMdastPlugin } from 'satteri';
import { langOfPath, videoHtml, videoOfParagraph } from './youtube.ts';

export const youtubeVideos = defineMdastPlugin({
  name: 'ksw-youtube-videos',
  paragraph(node, ctx) {
    const video = videoOfParagraph(node.children as never);
    if (!video) return;
    const lang = ctx.fileURL ? langOfPath(fileURLToPath(ctx.fileURL)) : 'de';
    ctx.replaceNode(node, { type: 'html', value: videoHtml(video.id, video.title, lang) });
  },
});
