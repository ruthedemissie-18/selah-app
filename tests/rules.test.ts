import { groupCircles, orderChannels, GENERAL_FELLOWSHIP } from '../src/recommend';
import { validateLocation } from '../src/services/profile';
import { validateConfirm, validateCustomTopic, validateEmail, validateName, validatePassword } from '../src/validation';
import type { Circle } from '../src/types';
import { suite } from './harness';

const { test, eq, run } = suite('Validation and ordering rules');
const ok = (v: string | null) => eq(v, null);
const bad = (v: string | null) => eq(typeof v, 'string');

test('validateEmail accepts normal addresses, trimmed and any case', () => {
  ok(validateEmail('ruth@example.com'));
  ok(validateEmail('  Ruth.D@Mail.Example.org  '));
});
test('validateEmail rejects missing parts, spaces and short endings', () => {
  const invalid = ['', 'ruth', 'ruth@', '@example.com', 'ruth@example', 'ruth@example.c', 'ru th@example.com', 'ruth@exa mple.com', 'ruth@.com', 'ruth@example.c0m'];
  for (const e of invalid) bad(validateEmail(e));
});
test('validatePassword needs 8+ characters', () => {
  bad(validatePassword(''));
  bad(validatePassword('1234567'));
  ok(validatePassword('12345678'));
});
test('validateConfirm must match', () => {
  eq(validateConfirm('password1', 'password2'), "Passwords don't match");
  ok(validateConfirm('password1', 'password1'));
});
test('validateName needs 2+ characters after trimming', () => {
  bad(validateName('  '));
  bad(validateName(' R '));
  ok(validateName('Ru'));
});
test('validateCustomTopic: 2-30 chars, no duplicates in any case', () => {
  bad(validateCustomTopic(' a ', []));
  bad(validateCustomTopic('x'.repeat(31), []));
  bad(validateCustomTopic('prayer & worship', ['Prayer & Worship']));
  ok(validateCustomTopic('  Grief  ', ['Prayer & Worship']));
});

const loc = (city: string, state: string, country: string) => validateLocation({ city, state, country });
test('validateLocation: empty is allowed (the step can be skipped)', () => eq(loc('', '', ''), {}));
test('validateLocation: City + Country is enough, State is optional', () => {
  eq(loc('Addis Ababa', '', 'Ethiopia'), {});
  eq(loc('Austin', 'Texas', 'United States'), {});
});
test('validateLocation: anything typed needs City and Country', () => {
  eq(Object.keys(loc('Austin', '', '')), ['country']);
  eq(Object.keys(loc('', 'Texas', '')), ['city', 'country']);
});
test('validateLocation: numbers or symbols only are rejected', () => {
  eq(Object.keys(loc('123', '', '!!')), ['city', 'country']);
  eq(Object.keys(loc('Austin', '42', 'United States')), ['state']);
});

const ALL = ['Prayer & Worship', 'Apologetics', 'Youth Ministry'];
test('orderChannels: interests first, then pinned, then the rest, no duplicates', () => {
  eq(orderChannels(['Youth Ministry'], ALL), ['Youth Ministry', 'Daily Scripture Reflections', 'Prayer & Worship', 'Apologetics']);
  eq(orderChannels(['Prayer & Worship', 'Grief'], ALL), [
    'Prayer & Worship',
    'Grief',
    'Daily Scripture Reflections',
    'Apologetics',
    'Youth Ministry',
  ]);
});
test('orderChannels: with no interests the pinned channel is first', () => {
  eq(orderChannels([], ALL)[0], 'Daily Scripture Reflections');
});

const circle = (id: number, category: string, topics: string[], extra: Partial<Circle> = {}): Circle => ({
  id,
  category,
  name: `c${id}`,
  leader: 'L',
  time: 'T',
  members: 1,
  capacity: 15,
  testament: 'OT',
  format: 'Online',
  description: '',
  topics,
  ...extra,
});
const POOL = [
  circle(1, 'PSALMS', ['Prayer & Worship']),
  circle(2, 'JOHN', ['Youth Ministry']),
  circle(3, 'ROMANS', ['Apologetics'], { format: 'Local', city: 'La Mirada', country: 'United States' }),
  circle(4, 'GENESIS', ['Youth Ministry']),
  circle(5, 'PSALMS', ['Worship & Music']),
];
const ids = (sections: ReturnType<typeof groupCircles>) => sections.map((s) => [s.key, s.circles.map((c) => c.id)]);

test('groupCircles: book first, then interests, then more circles', () => {
  eq(ids(groupCircles(POOL, { book: 'Psalms', interests: ['Prayer & Worship'], place: null })), [
    ['book', [1, 5]],
    ['more', [2, 3, 4]],
  ]);
  eq(ids(groupCircles(POOL, { book: 'John', interests: ['Youth Ministry'], place: null })), [
    ['book', [2]],
    ['interests', [4]],
    ['more', [1, 3, 5]],
  ]);
});
test('groupCircles: the two test accounts get different first circles', () => {
  const a = groupCircles(POOL, { book: 'Psalms', interests: ['Prayer & Worship'], place: null });
  const b = groupCircles(POOL, { book: 'John', interests: ['Youth Ministry'], place: null });
  eq(a[0].circles[0].id !== b[0].circles[0].id, true);
});
test('groupCircles: General Fellowship has no book section', () => {
  const s = groupCircles(POOL, { book: GENERAL_FELLOWSHIP, interests: ['Apologetics'], place: null });
  eq(ids(s), [
    ['interests', [3]],
    ['more', [1, 2, 4, 5]],
  ]);
});
test('groupCircles: local circles near the user come first, by city then country', () => {
  const byCity = groupCircles(POOL, { book: 'Psalms', interests: [], place: { city: 'la mirada', country: '' } });
  eq(byCity[0].key, 'near');
  eq(byCity[0].circles.map((c) => c.id), [3]);
  const byCountry = groupCircles(POOL, { book: null, interests: [], place: { city: 'Fresno', country: 'united states' } });
  eq(byCountry[0].circles.map((c) => c.id), [3]);
  const elsewhere = groupCircles(POOL, { book: null, interests: [], place: { city: 'Nairobi', country: 'Kenya' } });
  eq(elsewhere[0].key, 'more');
});

export default run;
