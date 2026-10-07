import type { Circle, CircleMessage, DiscussionMessage } from './types';

export const STRUGGLES = [
  'Anxiety & Worry',
  'Faith Doubts',
  'Loneliness',
  'Identity',
  'Relationship Issues',
  'Academic Pressure',
  'Addiction',
  'Other',
];

export const INTERESTS = [
  'Prayer & Worship',
  'Apologetics',
  'Missions & Outreach',
  'Marriage & Family',
  'Youth Ministry',
  'Social Justice',
  'Spiritual Disciplines',
  'Theology & Doctrine',
  'Worship & Music',
  'Church History',
];

export const POPULAR_BOOKS = ['Psalms', 'Proverbs', 'John', 'Romans', 'James'];

export const OT_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes',
  'Isaiah', 'Jeremiah', 'Daniel',
];

export const NT_BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Timothy', 'Hebrews', 'James',
  '1 Peter', '1 John', 'Revelation',
];

export const GENERAL_FELLOWSHIP = 'Just browsing / General Fellowship';

export const BOOK_GROUPS: { label: string | null; items: string[] }[] = [
  { label: null, items: [GENERAL_FELLOWSHIP] },
  { label: 'Suggestions', items: POPULAR_BOOKS },
  { label: 'Old Testament', items: OT_BOOKS },
  { label: 'New Testament', items: NT_BOOKS },
];

export const CIRCLES_POOL: Circle[] = [
  { id: 1, category: 'PSALMS', name: 'Finding Peace in God', leader: 'Pastor Michael', time: 'Wednesdays, 7:00 PM', members: 14, capacity: 15, testament: 'OT', format: 'Online', description: "Finding stillness in God's presence.", currentChapter: 'Psalm 23', moderatorBio: 'Pastor Michael shepherds this circle with gentle, steady wisdom.', length: '6-week study · ~45 min sessions' },
  { id: 2, category: 'ROMANS', name: 'Romans Deep Dive', leader: 'Grace L.', time: 'Sundays, 4:00 PM', members: 9, capacity: 15, testament: 'NT', format: 'Local', description: 'Unpacking grace, faith, and truth in Romans.', currentChapter: 'Romans 5', moderatorBio: 'Grace leads thoughtful, honest conversation each week.', length: '8-week study · ~60 min sessions' },
  { id: 3, category: 'PROVERBS', name: 'Proverbs for Daily Wisdom', leader: 'Marcus T.', time: 'Flexible / Online Anytime', members: 12, capacity: 15, testament: 'OT', format: 'Online', description: 'Everyday wisdom for everyday life.', currentChapter: 'Proverbs 3', moderatorBio: 'Marcus brings practical insight to ancient wisdom.', length: 'Ongoing · ~30 min sessions' },
  { id: 4, category: 'JOHN', name: 'The Gospel of John', leader: 'Elena R.', time: 'Tuesdays, 8:00 PM', members: 15, capacity: 15, testament: 'NT', format: 'Online', description: "Encountering Jesus through John's eyes.", currentChapter: 'John 4', moderatorBio: 'Elena loves walking through Scripture verse by verse.', length: '10-week study · ~50 min sessions' },
  { id: 5, category: 'EPHESIANS', name: 'Standing Firm', leader: 'David K.', time: 'Thursdays, 6:30 PM', members: 6, capacity: 15, testament: 'NT', format: 'Local', description: 'Standing strong through spiritual battles.', currentChapter: 'Ephesians 6', moderatorBio: 'David leads with humor, honesty, and heart.', length: '6-week study · ~45 min sessions' },
  { id: 6, category: 'PSALMS', name: 'Lament & Hope', leader: 'Sarah J.', time: 'Mondays, 7:30 PM', members: 11, capacity: 15, testament: 'OT', format: 'Online', description: 'Holding grief and hope together in the Psalms.', currentChapter: 'Psalm 42', moderatorBio: 'Sarah creates a safe space for hard seasons.', length: '6-week study · ~45 min sessions' },
  { id: 7, category: 'JUDGES', name: 'Judges: Journey', leader: 'Rebekah P.', time: 'Thursdays, 8:00 PM', members: 9, capacity: 15, testament: 'OT', format: 'Online', description: "Discovering God's heart in Judges", currentChapter: 'Judges 6', moderatorBio: 'Rebekah has walked with this circle for two seasons, holding space for honest questions.', length: '6-week study · ~60 min sessions' },
  { id: 8, category: 'GENESIS', name: 'Genesis: Journey', leader: 'Maya T.', time: 'Sundays, 9:00 AM', members: 3, capacity: 15, testament: 'OT', format: 'Online', description: 'Walking through the beginning, together.', currentChapter: 'Genesis 3', moderatorBio: 'Maya loves helping new believers find their footing in Scripture.', length: '8-week study · ~45 min sessions', live: true },
  { id: 9, category: 'GENESIS', name: 'Genesis: Reflections', leader: 'Hannah S.', time: 'Wednesdays, 6:00 PM', members: 4, capacity: 15, testament: 'OT', format: 'Online', description: 'Reflecting on the stories that shaped us.', currentChapter: 'Genesis 12', moderatorBio: 'Hannah leads with warmth and loves a good discussion question.', length: '8-week study · ~50 min sessions' },
];

export const MEETING_TIMES = [
  'Sundays, 9:00 AM',
  'Sundays, 4:00 PM',
  'Mondays, 7:30 PM',
  'Tuesdays, 8:00 PM',
  'Wednesdays, 7:00 PM',
  'Thursdays, 6:30 PM',
  'Thursdays, 8:00 PM',
  'Saturdays, 10:00 AM',
  'Flexible / Online Anytime',
];

export const SCRIPTURE_OF_DAY = {
  text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.',
  ref: 'Psalm 34:18',
};

export const PINNED_TOPICS = ['Daily Scripture Reflections'];

export const DISCUSSION_SEED: Record<string, { category: string; messages: DiscussionMessage[] }> = {
  'Daily Scripture Reflections': {
    category: 'Global',
    messages: [
      { id: 's1', author: 'Selah Team', time: '08:00 AM', text: `Today's verse: "${SCRIPTURE_OF_DAY.text}" (${SCRIPTURE_OF_DAY.ref}). Where do you need that closeness today?`, amens: 21 },
      { id: 'd1', author: 'Pastor Mark', time: '01:52 PM', text: "Welcome everyone! Today's passage calls us to trust completely in Him. What verse stood out to you in your morning reading?", amens: 14 },
      { id: 'd2', author: 'Grace L.', time: '02:10 PM', text: 'Colossians 3:15 — letting the peace of Christ rule in my heart today. Needed that reminder.', amens: 8 },
      { id: 'd3', author: 'Brother Thomas', time: '02:37 PM', text: 'Daily Reflection: "The Lord is my light and my salvation; whom shall I fear?" (Psalm 27:1)', amens: 12 },
    ],
  },
};

export const CIRCLE_SEED: Record<string, CircleMessage[]> = {
  7: [
    { id: 'c1', author: 'Rebekah P.', text: "Excited to keep growing through discovering God's heart in Judges." },
    { id: 'c2', author: 'Ruth A.', text: 'Thankful for this space. Judges has been teaching me to slow down and listen.' },
    { id: 'c3', author: 'David M.', text: 'Looking forward to gathering this week. Does anyone want to share prayer requests ahead of time?' },
  ],
};

export const TRANSITION_PHRASES = [
  'Finding your community…',
  'Matching you with fellow believers…',
  'Setting up your digital dashboard…',
];

export const ONBOARD_STEPS = ['auth', 'location', 'book', 'interests', 'struggles'] as const;

export const LOGO_SRC = '/selah-logo.png';
