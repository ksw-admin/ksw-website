// Run: npm test. Texts are real CMS descriptions (shortened where the length doesn't matter).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanParagraphs, decideHasPage, hasRealBody, PAGE_MIN_CHARS } from '../src/lib/text.ts';

test('joins a line that was only wrapped mid-sentence', () => {
  // World Martial Arts Championship 2026: "bedankt sich bei" / "den Coach"
  const text =
    'In Soft Style Formen und Frontfall 1 x den 1. und 2. Platz. \n' +
    'Der Meister ist sehr erfreut über die gute Leistung seiner Schüler und bedankt sich bei \n' +
    'den Coach für die Unterstützung.';
  assert.deepEqual(cleanParagraphs(text), [
    'In Soft Style Formen und Frontfall 1 x den 1. und 2. Platz.\n' +
      'Der Meister ist sehr erfreut über die gute Leistung seiner Schüler und bedankt sich bei den Coach für die Unterstützung.',
  ]);
});

test('keeps one result per line when each line is a full sentence', () => {
  const text =
    'In Point Fight erhielten meine Schüler den 1. + 2. Platz. \n' +
    'In Kumdo 3 x den 1. Platz und jeweils 2x den 2. und 3. Platz. \n' +
    'In Soft Style Formen und Frontfall 1 x den 1. und 2. Platz. ';
  assert.equal(cleanParagraphs(text)[0].split('\n').length, 3);
});

test('keeps short heading-like lines apart (regression: "Championships In Arnsberg In soft Style")', () => {
  // International Open German Championships 2026
  const text =
    'International Open German Championships \n' +
    'In Arnsberg \n' +
    'In soft Style Formens haben wir den ersten Platz und zweiten Platz belegt.\n' +
    'In Kumdo Schwertkampf haben wir den ersten Platz belegt.';
  const [p] = cleanParagraphs(text);
  assert.ok(p.startsWith('International Open German Championships\nIn Arnsberg\nIn soft Style'), p);
});

test('keeps a list of short lines as a list', () => {
  // Best Martial Art Fighter 2026: placings without punctuation
  const text = 'Unsere Ergebnisse:\nPlatz Leichtkontakt bis 10 Jahre\nPlatz Kumdo bis 15 Jahre\nPlatz Soft Form bis 8 Jahre';
  assert.deepEqual(cleanParagraphs(text), [text]);
});

test('splits paragraphs on blank lines and drops empty ones', () => {
  const text = 'Erster Absatz.\n\n\n  \nZweiter Absatz.\n\n';
  assert.deepEqual(cleanParagraphs(text), ['Erster Absatz.', 'Zweiter Absatz.']);
});

test('handles Windows line endings from pasted text', () => {
  assert.deepEqual(cleanParagraphs('Satz eins und\r\nweiter.\r\n\r\nNeu.'), ['Satz eins und weiter.', 'Neu.']);
});

test('empty description gives no paragraphs', () => {
  assert.deepEqual(cleanParagraphs(''), []);
  assert.deepEqual(cleanParagraphs('   \n\n  '), []);
});

test('a Markdown body counts only with real content', () => {
  assert.equal(hasRealBody(undefined), false);
  assert.equal(hasRealBody('\n<!--StartFragment-->\n\n<!--EndFragment-->\n'), false);
  assert.equal(hasRealBody('## Bericht\n\nText.'), true);
});

test('own page: short news stay in the list', () => {
  assert.equal(decideHasPage({ collection: 'news', description: 'Am 29.05 fand die Gürtelprüfung statt.' }), false);
});

test('own page: long description or a body gives a page', () => {
  assert.equal(decideHasPage({ collection: 'news', description: 'x'.repeat(PAGE_MIN_CHARS + 1) }), true);
  assert.equal(decideHasPage({ collection: 'news', description: 'x'.repeat(PAGE_MIN_CHARS) }), false);
  assert.equal(decideHasPage({ collection: 'news', description: 'kurz', body: 'Langer Bericht.' }), true);
});

test('own page: the CMS choice wins in both directions', () => {
  assert.equal(decideHasPage({ collection: 'news', override: true, description: 'kurz' }), true);
  assert.equal(decideHasPage({ collection: 'news', override: false, description: 'x'.repeat(900) }), false);
});

test('visibility: the CMS switch wins, otherwise the old "featured" tag decides', async () => {
  const { isVisible } = await import('../src/lib/text.ts');
  assert.equal(isVisible({ featured: true }), true);
  assert.equal(isVisible({ featured: false, tags: ['featured'] }), false);
  assert.equal(isVisible({ tags: ['articles', 'featured'] }), true); // old site: tagged = shown
  assert.equal(isVisible({ tags: ['articles'] }), false); // old site: untagged = not shown
  assert.equal(isVisible({}), false);
});
