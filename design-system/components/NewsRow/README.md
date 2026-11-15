# NewsRow

One post in the results list: date, photo, kind and place, title, text, medals.

- Short posts (one or two sentences and a photo) show completely, with no link; the photo opens full size.
- Long posts (a Markdown report, or more than 500 characters) show the first paragraph and "Weiterlesen", and get their own page.
- Kind and place sit above the title in `label` style, sentence case.
- Hidden posts (CMS switch "Auf der Website anzeigen" off) appear nowhere.
- On phones the photo goes full width above the text (16:9).
- Hand-written from `src/components/NewsLedger.astro`; the grey box stands in for the photo.
