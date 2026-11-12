// schema.org data for local search ("Kampfsport Kinder Rheinhausen", "Tai Chi Duisburg").
import { site, primaryPhone } from './site';
import type { Slot } from './schedule';
import type { Post } from './posts';

const SITE_URL = 'https://www.kuk-sool-won-griepentrog.de';
const DAY_URI = { mo: 'Monday', di: 'Tuesday', mi: 'Wednesday', do: 'Thursday', fr: 'Friday', sa: 'Saturday', so: 'Sunday' } as const;

const intlPhone = (v: string) => {
  const d = v.replace(/[^\d]/g, '');
  return d.startsWith('0') ? '+49 ' + d.slice(1) : '+' + d;
};

/** The master as one entity (same @id everywhere): founder of the academy, author of the posts. Facts from site.json. */
export function personLd() {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#master`,
    name: site.contactName,
    jobTitle: `Kuk Sool Won Meister, ${site.master.dan}. Dan`,
    knowsAbout: ['Kuk Sool Won', 'Tai Chi', 'Qi Gong'],
    worksFor: { '@id': `${SITE_URL}/#academy` },
  };
}

// The art a discipline page is about, tied to its Wikipedia article so search engines know which "Kuk Sool Won" is meant.
const ART = {
  kuksoolwon: { name: 'Kuk Sool Won', sameAs: 'https://de.wikipedia.org/wiki/Kuk_Sool_Won' },
  taichi: { name: 'Tai Chi', sameAs: 'https://de.wikipedia.org/wiki/Taijiquan' },
} as const;

/** Kuk Sool Won / Tai Chi page: what it is about and who offers it (the academy entity from the home page). */
export function disciplineLd(page: { slug: keyof typeof ART; lang: string; title: string; description?: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    ...(page.description ? { description: page.description } : {}),
    url: SITE_URL + page.path,
    inLanguage: page.lang,
    about: { '@type': 'Thing', ...ART[page.slug] },
    publisher: { '@id': `${SITE_URL}/#academy` },
  };
}

export function organizationLd(slots: Slot[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${SITE_URL}/#academy`,
    name: site.name,
    description: site.description,
    url: SITE_URL + '/',
    logo: `${SITE_URL}/images/icons/manifest-icon-512.png`,
    image: `${SITE_URL}/og/default.jpg`,
    telephone: intlPhone(primaryPhone.value),
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.hall.street,
      postalCode: site.hall.city.split(' ')[0],
      addressLocality: site.hall.city.split(' ').slice(1).join(' '),
      addressCountry: 'DE',
    },
    ...(site.hall.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.hall.geo.lat, longitude: site.hall.geo.lng } } : {}),
    hasMap: site.hall.osm,
    sport: ['Kuk Sool Won', 'Tai Chi', 'Qi Gong'],
    ...(site.social.length ? { sameAs: site.social.map((s) => s.url) } : {}),
    founder: personLd(),
    openingHoursSpecification: slots.flatMap((s) =>
      s.days.map((d) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${DAY_URI[d]}`, opens: s.from, closes: s.to })),
    ),
  };
}

export function articleLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.paragraphs[0]?.slice(0, 300) ?? '',
    datePublished: post.date.toISOString().slice(0, 10),
    inLanguage: post.textLang,
    ...(post.href ? { url: SITE_URL + post.href } : {}),
    ...(post.image && post.hasPage ? { image: [SITE_URL + encodeURI(`/og/${post.slug}.jpg`)] } : {}),
    author: { '@type': 'Person', '@id': `${SITE_URL}/#master`, name: site.contactName },
    publisher: { '@id': `${SITE_URL}/#academy` },
  };
}
