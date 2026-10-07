import type { ReactNode } from 'react';

const round = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const PATHS = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" {...round} />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" {...round} />
    </>
  ),
  chat: <path d="M4 5h16v11H8l-4 4V5Z" {...round} />,
  book: (
    <>
      <path d="M4 5.5c2-1 5-1 8 .5 3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5v-13Z" {...round} />
      <path d="M12 6v13" strokeLinecap="round" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.3" />
      <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" {...round} />
    </>
  ),
  heart: (
    <path
      d="M12 20s-7.2-4.5-9.3-9C1.2 7.8 3 4.8 6.3 4.8c1.9 0 3.3 1 4.7 2.7 1.4-1.7 2.8-2.7 4.7-2.7 3.3 0 5.1 3 3.6 6.2C19.2 15.5 12 20 12 20Z"
      {...round}
    />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" strokeLinecap="round" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  chevron: <path d="m8 10 4 4 4-4" {...round} />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" {...round} />
      <path d="M14.5 20c0-2.9 1.9-5 4.5-5" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 10 4-2.5 7-5.5 7-10V6l-7-3Z" {...round} />
      <path d="m9 12 2 2 4-4" {...round} />
    </>
  ),
  send: <path d="M4 12 20 4l-6 16-3-7-7-1Z" {...round} />,
  arrowleft: <path d="M19 12H5M11 6l-6 6 6 6" {...round} />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" {...round} />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="12" height="12" rx="2.5" />
      <path d="m15 9.5 6-3.2v11.4l-6-3.2" {...round} />
    </>
  ),
  swap: <path d="M7 7h11M7 7l3-3M7 7l3 3M17 17H6M17 17l-3-3M17 17l-3 3" {...round} />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
