// How onboarding answers order what the app shows. Pure functions, so they're easy to test.
import type { Circle } from './types';

export const GENERAL_FELLOWSHIP = 'Just browsing / General Fellowship';
export const PINNED_CHANNELS = ['Daily Scripture Reflections'];

/** The book a user studies, or null when they picked General Fellowship (or nothing yet). */
export function studyBook(book: string | null): string | null {
  return book && book !== GENERAL_FELLOWSHIP ? book : null;
}

/** "Psalms", or "General Discussion" for General Fellowship. */
export function bookLabel(book: string | null): string {
  return studyBook(book) ?? 'General Discussion';
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Discussion channels: the user's interests first (in the order they picked them), then the pinned
 * channels, then every other topic. No duplicates.
 */
export function orderChannels(interests: string[], allTopics: string[]): string[] {
  const out: string[] = [];
  for (const t of [...interests, ...PINNED_CHANNELS, ...allTopics]) {
    if (!out.some((x) => same(x, t))) out.push(t);
  }
  return out;
}

export interface Place {
  city: string;
  country: string;
}

export interface CircleSection {
  key: 'near' | 'book' | 'interests' | 'more';
  title: string;
  circles: Circle[];
}

/** A local circle in the user's city, or failing that their country. */
function isNear(c: Circle, place: Place | null): boolean {
  if (!place || c.format !== 'Local' || !c.city) return false;
  if (place.city && same(c.city, place.city)) return true;
  return !!place.country && !!c.country && same(c.country, place.country);
}

/**
 * Splits circles into sections, each circle in the first one that fits:
 *   1. local circles near the user (only when they gave a location)
 *   2. circles studying their book
 *   3. circles matching any of their interests
 *   4. everything else
 * Empty sections are left out.
 */
export function groupCircles(
  circles: Circle[],
  { book, interests, place }: { book: string | null; interests: string[]; place: Place | null },
): CircleSection[] {
  const studying = studyBook(book);
  const used = new Set<Circle['id']>();
  const take = (test: (c: Circle) => boolean) => {
    const picked = circles.filter((c) => !used.has(c.id) && test(c));
    picked.forEach((c) => used.add(c.id));
    return picked;
  };

  const sections: CircleSection[] = [
    { key: 'near', title: `Local studies near ${place?.city || place?.country || 'you'}`, circles: take((c) => isNear(c, place)) },
    {
      key: 'book',
      title: `Groups studying ${bookLabel(book)}`,
      circles: studying ? take((c) => same(c.category, studying)) : [],
    },
    {
      key: 'interests',
      title: 'Based on your interests',
      circles: take((c) => (c.topics ?? []).some((t) => interests.some((i) => same(i, t)))),
    },
    { key: 'more', title: 'More circles', circles: take(() => true) },
  ];
  return sections.filter((s) => s.circles.length > 0);
}
