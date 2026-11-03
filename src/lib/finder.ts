// Age finder rule (home page hero). Pure, no Astro imports: used by the browser script in
// src/components/WeekPlanner.astro and by tests/finder.test.ts.

export type FinderSlot = {
  id: string;
  discipline: 'kuksoolwon' | 'taichi' | string;
  ageMin: number | null;
  ageMax: number | null;
};

/** Ages the stepper accepts. */
export const AGE_MIN = 3;
export const AGE_MAX = 95;

export const clampAge = (value: string | number, fallback = 9): number => {
  const n = typeof value === 'number' ? value : parseInt(value, 10);
  return Math.max(AGE_MIN, Math.min(AGE_MAX, Number.isFinite(n) ? n : fallback));
};

export type FinderResult<S extends FinderSlot> =
  /** Younger than the youngest Kuk Sool Won group: show that group as "starts at". */
  | { kind: 'tooYoung'; minAge: number; first: S; highlight: S[] }
  /** A Kuk Sool Won group fits; adults also see Tai Chi. */
  | { kind: 'group'; group: S; showTaichi: boolean; highlight: S[] }
  /** Older than every Kuk Sool Won group: Tai Chi only. */
  | { kind: 'taichiOnly'; highlight: S[] };

export function findGroup<S extends FinderSlot>(slots: S[], age: number): FinderResult<S> {
  const ksw = slots.filter((s) => s.discipline === 'kuksoolwon' && s.ageMin !== null);
  const taichi = slots.filter((s) => s.discipline === 'taichi');
  if (ksw.length === 0) return { kind: 'taichiOnly', highlight: taichi };

  const minAge = Math.min(...ksw.map((s) => s.ageMin!));
  // Tai Chi is offered from the age of the adult Kuk Sool Won group on (open question: ask Peter for the real limit).
  const adultAge = Math.max(...ksw.map((s) => s.ageMin!));
  const showTaichi = age >= adultAge;

  if (age < minAge) {
    const first = ksw.reduce((x, y) => (x.ageMin! <= y.ageMin! ? x : y));
    return { kind: 'tooYoung', minAge, first, highlight: [] };
  }
  const group = ksw.find((s) => age >= s.ageMin! && age <= (s.ageMax ?? Infinity));
  if (!group) return { kind: 'taichiOnly', highlight: taichi };
  return { kind: 'group', group, showTaichi, highlight: showTaichi ? [group, ...taichi] : [group] };
}
