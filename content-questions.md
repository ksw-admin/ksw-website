# Open content questions for Peter

From the content pass on 2026-11-03 (old site vs. redesign). Answer here or tell Jonah; then delete the line.

## Facts to confirm

- [ ] **Trial lesson:** can people just come to the hall at training time, without signing up? The site now says so
      ("Für ein Probetraining einfach zur Trainingszeit in die Halle kommen"). Is it free?
- [ ] **Photo captions:** home page group photo "Lehrgang in der Halle, mit Gästen der IHHHF" and master photo
      "Urkunde „Bangbeob, der Weg“, IHHHF-Headquarters" (alt text: Peter in the black dobok). Correct?
- [ ] **Best Martial Art Fighter 2026:** the results list lost its place numbers ("Platz Kumdo bis 15 Jahre"); the named
      list at the end has 6 placings, the results list 7 lines. Which places were they?
- [ ] **Recklinghausen 2025:** "In Point, Fighting und Light Kontakt haben wir den zweiten und dritten Platz belegt":
      one 2nd and one 3rd in total, or both in each discipline? (No medals entered yet; the Formen title is 1 gold.)
- [ ] **Names:** students' last names are now shortened to an initial (Elif E., Steven D., Daniel D., Helena und Lars C.).
      Adults in a role keep their full name (Andreas Weiherer, Melanie Döring, Salvatore Tiso, Daniel Stöpke). OK?
      Note: "Melanie Döring" next to "Steven D." may still reveal Steven's surname.
- [ ] **Past dates 2026** (calendar page, "Früher in 2026"): backfilled from the reports where the text names the date
      (14.2., 9.5., 29.5., 4.7., 10.10.). Missing, because the report gives no date: the grading of the 78-year-old
      student (report from 29.3.) and the International Open German Championships in Arnsberg (report from 9.4.).
      When were they? Place of the Kids Tournament on 14.2.?
- [ ] **Impressum:** VAT ID (USt-IdNr.), if any. Legal drafts (Datenschutz, Impressum) are marked ENTWURF in the source.

## FAQ: questions only Peter can answer

The FAQ (/faq/, CMS: FAQ) has 9 answers taken from texts already on the site. These common questions have no
answer on the site yet; each one becomes an FAQ entry once answered:

- [ ] What does training cost? Membership fee, contract, notice period (or deliberately "ask in person")?
      Jonah remembers a choice between training once or twice a week: still the case, and does the price differ?
- [ ] What to wear and bring to the first lesson? When is a uniform (Dobok) needed, and where does it come from?
- [ ] Is the trial lesson free? How many trial lessons?
- [ ] Insurance: are students insured (club/association), or should they have their own accident insurance?
- [ ] May parents watch the children's groups?
- [ ] Tai Chi and Atemschulung with health problems (back, knees, after illness): what may the site say?
- [ ] Training in school holidays: does training pause during the NRW school holidays as a rule? (If yes, the closures
      could be filled in automatically.)

## Question form and closures

- [ ] **Contact form is OFF** (CMS: Einstellungen › Kontakt und Allgemeines › Kontaktformular). Switch on once Peter wants
      written messages; set the notification email in Netlify › Forms › kontakt.
- [ ] **Question form is OFF** (CMS: Einstellungen › Kontakt und Allgemeines › Fragen-Formular). The FAQ shows phone and
      email instead. If both forms stay off for good, drop the "Formulare" paragraph from the Datenschutz text.
- [ ] **Who reads the questions** sent through the FAQ form, once it is on? Netlify › Forms › "frage" › notifications: set the email
      address there. Submissions stay in the Netlify dashboard until deleted: delete them once answered (the Datenschutz
      text promises that).
- [ ] **Training closures** (CMS: Einstellungen › Trainingsausfälle): Peter enters holidays and cancellations there.
      The banner shows from 14 days before by default; each entry can set its own lead time ("Vorher anzeigen (Tage)").

## CMS: known limitation (2026-11-04)

- [ ] **Existing photos show a grey placeholder in the CMS editor** (old posts, Kuk Sool Won gallery, sponsors). The website
      is not affected, and saving keeps the photo; just don't click "Entferne Bild". New posts with a freshly uploaded
      photo work normally. Reusing an existing photo via "Wähle ein Bild" is not possible ("Keine Medien gefunden"):
      upload it again. Cause: Decap does not resolve the photos next to the entries; not fixed on purpose. Fallback if it
      ever gets in the way: copy the original photos to `/admin/images/` at build time (~22 MB more per deploy).

## Decisions

- [ ] **Form of address:** du, Sie or ihr? Today mixed: home page "Komm zum Probetraining" (du), contact page
      "Sendet einfach eine E-Mail oder ruft an" (ihr, from the old site), Kuk Sool Won page "Sie erlernen…" (Sie).
      Suggestion: du for Kuk Sool Won and the general pages, Sie for Tai Chi and Atemschulung.
- [ ] **Photos:** action photos from training (techniques, forms, Tai Chi outdoors) to replace some posed group photos;
      a single portrait of Peter for the master section.
- [ ] **Social media:** Instagram / Facebook / YouTube links, if the school has them (CMS: Einstellungen).
