import { Logo } from '../../components/Logo';
import { MenuCard, MenuRow, PageHeader, SectionLabel } from '../../components/ProfileUI';

export const APP_VERSION = 'Selah v1.0';
const SUPPORT_EMAIL = 'support@selah.app';

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is a circle?',
    a: 'A circle is a small Bible study group of up to 15 people reading the same book together. You can be in up to two circles at a time.',
  },
  {
    q: 'How do I join or leave a circle?',
    a: 'Open Bible Study, pick a circle and tap "Join this circle". To leave, find it in Browse and tap "Joined · Leave".',
  },
  {
    q: 'Who can see my discussion posts?',
    a: 'Discussions are moderated spaces open to everyone in Selah. Be kind, and keep personal details out of public channels.',
  },
  {
    q: 'What happens when I mark a prayer as answered?',
    a: 'It moves to the Answered tab with the date, so you can look back on how God has been faithful. You can move it back any time.',
  },
  {
    q: 'How do I change my name, location or photo?',
    a: 'On your Profile, tap Edit Profile for your name and location, or tap your photo to change it.',
  },
];

export function HelpPage() {
  return (
    <div className="subpage">
      <PageHeader title="Help & Support" />
      <SectionLabel>Frequently asked</SectionLabel>
      <div className="menu-card">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="faq-item">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <SectionLabel>Still need help?</SectionLabel>
      <MenuCard>
        <MenuRow icon="chat" title="Contact us" subtitle={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}?subject=Selah%20support`} />
      </MenuCard>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="subpage">
      <PageHeader title="About Selah" />
      <div className="about-card">
        <div className="about-logo">
          <Logo className="about-logo-svg" />
        </div>
        <div className="about-version">{APP_VERSION}</div>
        <p className="about-mission">
          Selah is a space to find your community and build your own — through shared prayer, honest struggle, and
          Scripture read together. Pause, reflect, and grow with others who are walking the same road.
        </p>
        <div className="about-credit">Made for the Gloo AI Hackathon 2026</div>
      </div>
    </div>
  );
}
