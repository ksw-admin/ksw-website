// Photo blocks in reports: photo row Markdown round trip, album tile detection and label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { albumLabelHtml, albumLine, albumOfParagraph, photoRowBlock, photoRowFields, type MdNode } from '../src/lib/blocks.ts';

test('photo row: CMS fields -> Markdown -> CMS fields', () => {
  const images = [{ image: 'images/a.jpg', alt: 'Siegerehrung [Kumdo]' }, { image: 'images/b.jpg', alt: '' }];
  const md = photoRowBlock(images);
  assert.equal(md, '<div class="photo-row">\n\n![Siegerehrung  Kumdo](images/a.jpg)\n![](images/b.jpg)\n\n</div>');
  assert.deepEqual(photoRowFields(md), { images: [{ alt: 'Siegerehrung  Kumdo', image: 'images/a.jpg' }, { alt: '', image: 'images/b.jpg' }] });
});

const img = (alt: string): MdNode => ({ type: 'image', url: 'images/c.jpg', alt });
const link = (url: string, ...children: MdNode[]): MdNode => ({ type: 'link', url, children });

test('album: only a lone linked photo described "Fotoalbum: …"', () => {
  const a = albumOfParagraph([link('https://www.flickr.com/photos/x/albums/1', img('Fotoalbum: Turnier Arnsberg'))]);
  assert.equal(a?.title, 'Turnier Arnsberg');
  assert.equal(a?.url, 'https://www.flickr.com/photos/x/albums/1');
  assert.equal(albumOfParagraph([link('https://example.org/', img('Siegerehrung'))]), null); // a normal linked photo
  assert.equal(albumOfParagraph([{ type: 'text', value: 'Siehe ' }, link('https://example.org/', img('Fotoalbum: x'))]), null);
  assert.equal(albumOfParagraph([link('images/c.jpg', img('Fotoalbum: x'))]), null); // must be a web address
});

test('album label: Flickr or elsewhere, both languages, escaped', () => {
  assert.match(albumLabelHtml('A & B', 'https://www.flickr.com/photos/x'), /<strong>A &amp; B<\/strong><span>Alle Fotos auf Flickr<\/span>/);
  assert.match(albumLabelHtml('A', 'https://photos.app.goo.gl/x'), /Alle Fotos im Album/);
  assert.match(albumLabelHtml('A', 'https://flic.kr/s/x', 'en'), /All photos on Flickr/);
  assert.equal(albumLine(' Turnier ', 'images/c.jpg', 'https://flic.kr/s/x '), '[![Fotoalbum: Turnier](images/c.jpg)](https://flic.kr/s/x)');
});
