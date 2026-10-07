import { FISH_PATH, LETTERS_PATH } from '../screens/onboarding/introShapes';

/** The drawn Selah logo from the intro; fish and lettering share one coordinate space. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="33 72 349 114" role="img" aria-label="Selah logo">
      <path className="logo-fish-path" fillRule="evenodd" d={FISH_PATH} />
      <path className="logo-letters-path" fillRule="evenodd" d={LETTERS_PATH} />
    </svg>
  );
}
