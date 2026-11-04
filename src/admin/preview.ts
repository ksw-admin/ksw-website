// Live preview for the Decap CMS editor (loaded by src/pages/admin/index.astro).
// Against drift between preview and live site:
// - rules come from the same module as the site and the tests (src/lib/text.ts);
// - look comes from the site's own global.css and Archivo font, layout CSS below uses the site's tokens.
// The only thing written twice is the layout of the list row and the post page (NewsLedger.astro, PostPage.astro).
// The exact result is the Netlify deploy preview of a draft ("Vorschau ansehen" in the CMS).
import { cleanParagraphs, decideHasPage, isVisible, PAGE_MIN_CHARS } from '../lib/text';
import siteCss from '../styles/global.css?inline';
import fontCss from '@fontsource-variable/archivo/wdth.css?inline';

type Imm = { get(key: string): any; toJS?(): any };
declare global {
  interface Window {
    CMS: any;
    h: (type: any, props?: Record<string, unknown> | null, ...children: any[]) => any;
    createClass: (spec: { render(this: { props: any }): any }) => any;
  }
}
const { CMS, h, createClass } = window;

const layoutCss = `
  body { padding: 24px; }
  .hint { font-weight: 600; font-size: 13px; line-height: 1.4; padding: 10px 14px; border-radius: 4px; margin-bottom: 12px; color: #000; }
  .hint.page { background: #fff8c2; border: 2px solid #000; }
  .hint.list { background: #ddeae5; border: 2px solid var(--jade); }
  .hint.hidden { background: #e6e6e3; border: 2px dashed #5c5f59; }
  .hint.warn { background: #fde8e4; border: 2px solid #8a1c12; }
  .is-hidden .row, .is-hidden .page { opacity: 0.45; }

  /* List row, like src/components/NewsLedger.astro */
  .row { display: grid; grid-template-columns: 7.5rem 10rem minmax(0, 1fr) auto; gap: 24px; align-items: start;
         padding-block: 22px; border-top: 6px solid var(--gelb); border-bottom: 1px solid var(--linie); margin-top: 20px; }
  .row.noimg { grid-template-columns: 7.5rem minmax(0, 1fr) auto; }
  .row time { color: var(--stein); font-weight: 500; }
  .thumb { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 4px; display: block; }
  .kind { font-size: 0.85rem; font-weight: 600; color: var(--stein); display: block; margin-bottom: 2px; }
  .row h3 { font-size: var(--fs-item); font-weight: 700; line-height: 1.2; }
  .row p { color: var(--stein); margin-top: 6px; max-width: 62ch; }
  .row p.full { color: var(--fg); white-space: pre-line; }
  .more { font-weight: 700; color: var(--fg); text-decoration: underline; }
  .medals { display: flex; gap: 10px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .medals i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; margin-right: 5px; vertical-align: -2px; }
  .g { background: var(--gold); } .s { background: var(--silber); } .b { background: var(--bronze); }

  /* Own page, like src/components/PostPage.astro */
  .label { margin: 40px 0 12px; font-size: 13px; font-weight: 700; color: var(--stein); }
  .page { border: 1px solid var(--linie); border-radius: 4px; padding: 24px; }
  .page-head { border-bottom: 6px solid var(--gelb); padding-bottom: 16px; display: grid; gap: 10px; }
  .page-meta { color: var(--stein); display: flex; gap: 16px; flex-wrap: wrap; font-weight: 600; }
  .page h1 { font-size: var(--fs-page-title); line-height: 0.95; font-weight: 900; font-stretch: 62%; }
  .cols { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 48px; margin-top: 32px; align-items: start; }
  .desc { white-space: pre-line; }
  figure { margin: 0; }
  figure img { width: 100%; height: auto; border-radius: 4px; display: block; }
  figcaption { font-size: 0.85rem; color: var(--stein); margin-top: 8px; }
  @media (max-width: 760px) {
    .row, .row.noimg { grid-template-columns: minmax(0, 1fr) auto; }
    .row .thumb { grid-column: 1 / -1; aspect-ratio: 16 / 9; }
    .cols { grid-template-columns: 1fr; }
    .cols figure { order: -1; }
  }
`;

CMS.registerPreviewStyle(fontCss, { raw: true });
CMS.registerPreviewStyle(siteCss, { raw: true });
CMS.registerPreviewStyle(layoutCss, { raw: true });

const fmt = (v: unknown, long = false) => {
  if (!v) return '';
  const d = new Date(v as string);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('de-DE', long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const teaser = (s: string) => (s.length > 220 ? s.slice(0, 217).replace(/\s+\S*$/, '') + ' …' : s);

function postPreview(collection: 'news' | 'articles') {
  return createClass({
    render() {
      const data: Imm = this.props.entry.get('data');
      // English tab: the entry holds only the translated text fields. Like the site, everything else (and any text
      // not translated yet) comes from the German entry, when Decap hands it to the preview.
      const deData: Imm | undefined = this.props.entry.getIn?.(['i18n', 'de', 'data']);
      const own = (v: unknown) => v !== undefined && v !== null && v !== '';
      const get = (k: string) => (own(data.get(k)) ? data.get(k) : deData?.get(k));
      const text = String(get('description') ?? '');
      const body = String(get('body') ?? '');
      const choice = get('page') ?? 'auto';
      const override = choice === 'ja' ? true : choice === 'nein' ? false : choice === true || choice === false ? choice : undefined;
      const hasPage = decideHasPage({ collection, override, description: text, body });
      const tags = get('tags');
      const featured = get('featured');
      // No switch and no old tags here (an English entry without the German data): the German entry decides on the
      // site, so the preview must not claim the post is hidden.
      const visible = featured === undefined && tags === undefined ? true : isVisible({ featured: featured ?? undefined, tags: tags?.toJS ? tags.toJS() : tags ?? [] });
      const paragraphs = cleanParagraphs(text);
      const imgPath = get('image');
      const img = imgPath && !String(imgPath).includes('placeholder') ? String(this.props.getAsset(imgPath)) : '';
      const alt = get('image_text') || '';
      const medals: Imm | undefined = get('medals');
      const m = (k: string) => (medals ? Number(medals.get(k) || 0) : 0);
      const medalEls = [
        m('gold') ? h('span', { key: 'g' }, h('i', { className: 'g' }), m('gold')) : null,
        m('silver') ? h('span', { key: 's' }, h('i', { className: 's' }), m('silver')) : null,
        m('bronze') ? h('span', { key: 'b' }, h('i', { className: 'b' }), m('bronze')) : null,
        m('other') ? h('span', { key: 'o' }, '+' + m('other')) : null,
      ];
      const meta = [get('kind'), get('place')].filter(Boolean).join(', ');

      const hints = [];
      if (!visible) hints.push(h('div', { className: 'hint hidden', key: 'v' }, 'Ausgeblendet: Dieser Beitrag erscheint nirgends auf der Website. „Auf der Website anzeigen“ einschalten, um ihn zu zeigen.'));
      else if (hasPage)
        hints.push(h('div', { className: 'hint page', key: 'p' }, 'Eigene Seite: ja. In der Liste stehen der erste Absatz und „Weiterlesen“.' +
          (override === undefined ? (body.trim() ? ' (Grund: Bericht ist ausgefüllt.)' : ` (Grund: Kurztext länger als ${PAGE_MIN_CHARS} Zeichen.)`) : '')));
      else
        hints.push(h('div', { className: 'hint list', key: 'p' }, 'Eigene Seite: nein. Der Beitrag steht komplett in der Liste.' +
          (override === undefined ? ` (${text.length} von ${PAGE_MIN_CHARS} Zeichen, kein Bericht.)` : '')));
      if (get('kind') === 'Turnier' && !medalEls.some(Boolean))
        hints.push(h('div', { className: 'hint warn', key: 'm' }, 'Tipp: Turnier ohne Medaillen. Unter „Medaillen und Platzierungen“ eintragen, dann zählt die Website sie mit.'));
      if (img && !alt) hints.push(h('div', { className: 'hint warn', key: 'a' }, 'Tipp: Bildbeschreibung ausfüllen (für Screenreader und Linkvorschau).'));
      if (hasPage && text.length > 300) hints.push(h('div', { className: 'hint warn', key: 't' }, 'Tipp: Der Kurztext ist lang. Ein, zwei Sätze reichen; der Rest gehört in den „Bericht“.'));

      const row = h('div', { className: 'row' + (img ? '' : ' noimg') },
        h('time', {}, fmt(get('date'))),
        img ? h('img', { className: 'thumb', src: img, alt: '' }) : null,
        h('div', {},
          meta ? h('span', { className: 'kind' }, meta) : null,
          h('h3', {}, get('title') || 'Titel fehlt'),
          hasPage
            ? h('p', {}, teaser(paragraphs[0] ?? ''), ' ', h('span', { className: 'more' }, 'Weiterlesen'))
            : paragraphs.map((p, i) => h('p', { className: 'full', key: i }, p))),
        h('div', { className: 'medals' }, medalEls));

      const page = hasPage
        ? h('div', {},
            h('div', { className: 'label' }, 'So sieht die eigene Seite aus:'),
            h('div', { className: 'page' },
              h('div', { className: 'page-head' },
                h('div', { className: 'page-meta' }, h('span', {}, fmt(get('date'), true)), get('kind') ? h('span', {}, get('kind')) : null, get('place') ? h('span', {}, get('place')) : null),
                h('h1', {}, get('title') || 'Titel fehlt'),
                h('div', { className: 'medals' }, medalEls)),
              h('div', { className: 'cols' },
                h('div', { className: 'prose' },
                  paragraphs.map((p, i) => h('p', { className: 'desc', key: i }, p)),
                  body.trim() ? this.props.widgetFor('body') : null),
                img ? h('figure', {}, h('img', { src: img, alt }), alt ? h('figcaption', {}, alt) : null) : null)))
        : null;

      return h('div', { className: visible ? '' : 'is-hidden' }, hints, row, page);
    },
  });
}

CMS.registerPreviewTemplate('news', postPreview('news'));
CMS.registerPreviewTemplate('articles', postPreview('articles'));

// config.yml is loaded and merged with this. Local mode (`npm run cms` on localhost) has no drafts: save directly there.
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
CMS.init({ config: isLocal ? { publish_mode: 'simple' } : {} });
