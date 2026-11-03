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
    'week.yours': 'Ausgewählt',
    'week.pick': 'Wähle eine Gruppe im Wochenplan, um Tage, Zeiten und Details zu sehen.',
    'week.taichi.who': 'Jedes Alter, keine Vorkenntnisse, kein Leistungssport.',
    'week.more.ksw': 'Mehr über Kuk Sool Won',
    'week.more.taichi': 'Mehr über Tai Chi und Atemschulung',
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
    'week.yours': 'Selected',
    'week.pick': 'Choose a group in the timetable to see days, times and details.',
    'week.taichi.who': 'Any age, no experience needed, no competition.',
    'week.more.ksw': 'More about Kuk Sool Won',
    'week.more.taichi': 'More about Tai Chi and breathing training',
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
