# TimetableSlot

One group on one day in the training week, as a button: tapping it selects the group on all its days and shows its details.

- Kuk Sool Won slots use `slot-k` / `slot-k-fg` (black, inverting to light grey in dark), Tai Chi slots `jade` with white text.
- Selected: yellow fill, black text, 2px black inner border. While one group is selected, the others dim their fill only; their labels stay readable (fading the whole slot failed contrast).
- Tapping the selected group again, or Escape, clears the selection.
- Each slot is a real `<button>` with `aria-pressed` and a full spoken name ("Kuk Sool Won, 9 bis 11 Jahre, Montag und Freitag, 18:00 bis 19:00 Uhr").
- The panel sits on `card` with a 2px `fg` border and the yellow mat (`shadow-mat`).
- The consumer supplies the group data from `schedule.json` (id, discipline, days, from, to, ages).
- Hand-written from `src/components/WeekPlanner.astro`; the preview shows three slots with the middle one selected (click to try).
