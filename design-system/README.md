# Kampfkunst Academy

The design system of kuk-sool-won-griepentrog.de, the website of Peter Griepentrog's martial arts school in Duisburg-Rheinhausen: Kuk Sool Won for children from age 4, teenagers and adults, plus Tai Chi, Qi Gong and breathing training at any age. Built from the site's code (`ksw-admin/ksw-website`, branch `astro-redesign`).

## What the site is for

Visitors come with two questions: **when is my group** and **how do I reach Peter**. Everything else supports those two. The home page opens with the training week, and the phone number is the largest piece of text after the headline.

Two audiences, two voices: parents of children (Kuk Sool Won) and adults, often with breathing problems (Tai Chi, Qi Gong, Atemschulung). They share one site and one typeface, but not one tone.

## Voice

- German first, plain and direct, short sentences. English pages exist only where translated; untranslated pages fall back to German.
- Name things the way visitors say them: "Trainingszeiten", "Zum Probetraining", "Anrufen", not "Termine buchen" or "Kontaktformular".
- Peter's own wording wins over marketing copy ("kein Leistungssport, in jedem Alter erlernbar").
- Results are facts: dates, places, placings. No superlatives.
- Form of address (du or Sie) is still open; until decided, avoid addressing the reader in new copy.

## Colour

- **Yellow (`gelb`) is the accent, never the background, and it always means something.** It marks actions (primary button, phone number, the mobile bar's contact button, the video play icon), selection (the selected group, the current language, theme and menu item), training times (the yellow mat `shadow-mat` on the timetable and on the times box of the discipline pages) and the "Kein Training" banner. It is not used for decoration: structural lines are in the text colour (review 2026-11-04: with yellow on every rule, nothing stood out). Large yellow areas were tried and rejected as "too much in the face".
- **Black text on yellow, always.** White on yellow fails contrast.
- **Jade (`jade`, `tc-bg`, `tc-fg`) belongs to Tai Chi** and to calm states (focus ring). Kuk Sool Won is black (`panel`, `slot-k`).
- Neutrals are slightly green-grey (`bg`, `stein`, `linie`), never pure mid-grey.
- Medal colours (`gold`, `silber`, `bronze`) are data, used only as small dots next to counts.
- Both themes are designed: light (hall-white `bg`) and dark (near-black `bg`); `panel` stays black in both. Yellow is the same in both.

## Typography

One family, **Archivo** (variable, self-hosted), in two widths:

- **Condensed and heavy** (`font-stretch: 62%`, weight 900) for Kuk Sool Won, headlines, section headings and the phone number: firm, compact, like a printed timetable.
- **Wide and light** (`font-stretch: 125%`, weight 300) for Tai Chi: open and slow.
- **Normal width** for all running text, at 17px with 1.55 line height and lines under about 68 characters.
- The Hangul name **국술원** (Nanum Myeongjo 800) appears only above the Kuk Sool Won heading, in yellow. Its font file holds exactly these three glyphs.
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows, no single highlighted word in a headline.
- Digits that line up (dates, times, phone numbers, medal counts) use tabular figures.

## Layout

- Full-width **bands** with content up to `max-width` (1440px) and a fluid side gutter (`gutter-min` to `gutter-max`). Running text keeps its own width limit, so wide screens get more air, not longer lines.
- **Left-aligned** throughout. Nothing centred except icons.
- The **section rule** (`rule-accent`, 2px in `fg`) sits under each section heading and post title. Hairlines (`linie`) divide list rows and separate header and footer from the page.
- Nearly square: `radius-sm` (3px) on timetable slots, `radius-md` (4px) on buttons, photos and panels. No pills, no large radii, no cards with soft grey shadows. The only shadow is the solid yellow mat.
- Sections in this order on the home page: training week, group photo, the two disciplines side by side (black and jade), video, results, the master, contact band.

## Imagery

- Real photos of the school only, no stock images.
- Prefer people training (a technique, a form, Tai Chi outdoors) over posed group pictures. The current home page uses too many posed shots in front of the same flags; replace them as better photos arrive.
- Children: first names only, and only with consent of the parents.
- Photos are optimised at build time; a post's preview image shows the whole photo on a blurred copy of itself, so faces are never cropped away.

## Iconography

Almost none, on purpose. The only icon is the phone handset on the yellow circle in the contact band, which shows that the number can be tapped. Add an icon only where it says "you can act here", never as decoration. No emoji.

## Motion

Only in answer to an action: the selected timetable group changes colour, a gallery tile grows by 5% on hover, the phone icon tilts on hover. No entrance animations, nothing on page load. `prefers-reduced-motion` turns all of it off.

## Components

| Component | Where | Rule |
|---|---|---|
| Button | trial lesson, CMS | Yellow fill, 2px black border, black text. One per section at most. |
| SectionHeading | every content section | Condensed heading on the yellow rule; an optional link at the right ("Alle Beiträge"). |
| TimetableSlot | home page week | A button per group and day; tapping marks the group on all its days and dims the rest with readable labels. |
| NewsRow | news list | Date, photo, kind and place, title, text, medals. Short posts show completely; long ones show a teaser and "Weiterlesen". |
| Medals | news rows, post pages | Coloured dots with counts; nothing for posts without results. |
| PhoneLink | contact band | Yellow round handset icon plus the number in condensed type. |
| CredentialList | master section | Two columns: area in `stein`, qualification in `fg`; a repeated area is shown once. |

## Accessibility

- Text meets 4.5:1 on its background in both themes; large display text at least 3:1.
- Keyboard focus is a 3px `jade` outline with offset.
- Timetable slots are real buttons with full spoken names ("Kuk Sool Won, 9 bis 11 Jahre, Montag und Freitag, 18:00 bis 19:00 Uhr").
- The mobile menu uses the browser's popover; the sticky bottom bar on phones keeps "Kontakt" and "Zeiten" in reach (contact page rather than a direct call: visitors choose phone, e-mail or the route themselves).

## Not synced

- Components are Astro (server-rendered), not a React library, so this system has no `bundle.js`. The previews are static renditions hand-written from the components named in `tokens.json` › `meta.components`, styled by `components/bundle.css` (copied from the site's CSS).
- Fluid sizes (`clamp()`) are recorded at their largest value; the usage notes give the full formula.
- The Archivo Latin-Extended and Vietnamese subsets were not copied; only the Latin file is included.
