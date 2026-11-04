// Videos in Markdown: link formats, the stored line, paragraph detection and the player HTML.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { langOfPath, videoHtml, videoLine, videoOfParagraph, youtubeId } from '../src/lib/youtube.ts';

test('video id from the usual link formats; other links are not videos', () => {
  for (const url of [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  ]) assert.equal(youtubeId(url), 'dQw4w9WgXcQ', url);
  assert.equal(youtubeId('https://www.youtube.com/@kuksoolwon'), null);
  assert.equal(youtubeId('https://example.org/watch?v=dQw4w9WgXcQ'), null);
});

test('the CMS line', () => {
  assert.equal(videoLine('dQw4w9WgXcQ', ' Prüfung '), '[Video: Prüfung](https://www.youtube.com/watch?v=dQw4w9WgXcQ)');
});

const link = (url: string, text: string) => ({ type: 'link', url, children: [{ type: 'text', value: text }] });

test('a paragraph that is only a YouTube link is a video; a link inside text is not', () => {
  assert.deepEqual(videoOfParagraph([link('https://youtu.be/dQw4w9WgXcQ', 'Video: Gürtelprüfung')]), { id: 'dQw4w9WgXcQ', title: 'Gürtelprüfung' });
  assert.equal(videoOfParagraph([{ type: 'text', value: 'Siehe ' }, link('https://youtu.be/dQw4w9WgXcQ', 'hier')]), null);
  assert.equal(videoOfParagraph([link('https://example.org/', 'Video: x')]), null);
});

test('player HTML: escaped title, labels by language', () => {
  const de = videoHtml('dQw4w9WgXcQ', 'Prüfung <2026>', 'de');
  assert.match(de, /data-yt="dQw4w9WgXcQ"/);
  assert.match(de, /<strong>Prüfung &lt;2026&gt;<\/strong>/);
  assert.match(de, /Video abspielen/);
  assert.match(videoHtml('dQw4w9WgXcQ', 'Grading', 'en'), /Play video/);
  assert.equal(langOfPath('C:\\site\\src\\content\\news\\en\\x.md'), 'en');
  assert.equal(langOfPath('/site/src/content/news/de/x.md'), 'de');
});
