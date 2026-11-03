export const languages = { de: 'Deutsch', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'de';

// Interface texts only. Page content lives in src/content/<collection>/<lang>/.
export const ui = {
  de: {
    'nav.ksw': 'Kuk Sool Won',
    'nav.taichi': 'Tai Chi & Atemschulung',
    'nav.news': 'Aktuelles',
    'nav.contact': 'Kontakt',
    'nav.main': 'Hauptmenü',
    'nav.menu': 'Menü',
    'cta.trial': 'Probetraining anfragen',
    'cta.call': 'Anrufen',
    'cta.times': 'Zeiten',
    'week.title': 'Trainingswoche',
    'week.none': 'kein Training',
    'week.yours': 'Deine Gruppe',
    'finder.label': 'Wie alt ist die Person, die trainieren möchte?',
    'finder.years': 'Jahre',
    'finder.older': 'Ein Jahr älter',
    'finder.younger': 'Ein Jahr jünger',
    'news.title': 'Turniere, Prüfungen, Verein',
    'news.all': 'Alle Beiträge',
    'news.placings': 'Platzierungen',
    'times.title': 'Trainingszeiten',
    'gallery.title': 'Bilder',
    'footer.impressum': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.sponsors': 'Sponsoren',
    'lang.switch': 'English version',
    'notfound.title': 'Diese Seite gibt es nicht.',
    'notfound.back': 'Zur Startseite',
  },
  en: {
    'nav.ksw': 'Kuk Sool Won',
    'nav.taichi': 'Tai Chi & breathing',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.main': 'Main menu',
    'nav.menu': 'Menu',
    'cta.trial': 'Book a free trial lesson',
    'cta.call': 'Call',
    'cta.times': 'Times',
    'week.title': 'Training week',
    'week.none': 'no training',
    'week.yours': 'Your group',
    'finder.label': 'How old is the person who wants to train?',
    'finder.years': 'years',
    'finder.older': 'One year older',
    'finder.younger': 'One year younger',
    'news.title': 'Tournaments, gradings, club life',
    'news.all': 'All posts',
    'news.placings': 'placings',
    'times.title': 'Training times',
    'gallery.title': 'Photos',
    'footer.impressum': 'Legal notice (German)',
    'footer.privacy': 'Privacy (German)',
    'footer.sponsors': 'Sponsors',
    'lang.switch': 'Deutsche Version',
    'notfound.title': 'This page does not exist.',
    'notfound.back': 'Back to the home page',
  },
} as const;

export type UiKey = keyof (typeof ui)['de'];

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

export function getLangFromUrl(url: URL): Lang {
  const first = url.pathname.split('/')[1];
  return first in languages ? (first as Lang) : defaultLang;
}

/** Prefix a German path for the given language: ("/category/taichi/", "en") -> "/en/category/taichi/" */
export function localePath(path: string, lang: Lang): string {
  return lang === defaultLang ? path : `/${lang}${path}`;
}
