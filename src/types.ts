export type OnboardingScreen = 'auth' | 'location' | 'book' | 'interests' | 'struggles';
export type Screen = 'splash' | OnboardingScreen | 'transition' | 'app';
export type Tab = 'home' | 'discussions' | 'biblestudy' | 'profile';

export type CircleId = number | string;

export interface Circle {
  id: CircleId;
  category: string;
  name: string;
  leader: string;
  time: string;
  members: number;
  capacity: number;
  testament: 'OT' | 'NT';
  format: 'Online' | 'Local';
  description: string;
  currentChapter?: string;
  moderatorBio?: string;
  length?: string;
  live?: boolean;
  /** Interest topics (from INTERESTS) this circle fits, used to recommend it. */
  topics?: string[];
  /** Where a Local circle meets. */
  city?: string;
  country?: string;
}

export interface DiscussionMessage {
  id: string;
  author: string;
  time: string;
  text: string;
  amens: number;
  /** Epoch ms, for grouping. Seed messages have none. */
  sentAt?: number;
  /** Sent by the current user. */
  mine?: boolean;
}

export interface CircleMessage {
  id: string;
  author: string;
  text: string;
  /** Epoch ms. Seed messages have none and are treated as earlier today. */
  sentAt?: number;
  /** Sent by the current user. */
  mine?: boolean;
}

export interface Prayer {
  id: number;
  text: string;
  status: 'current' | 'answered';
  /** Epoch ms when the prayer was added. */
  createdAt: number;
  /** Epoch ms when it was marked answered. */
  answeredAt?: number;
}

/** Sub-pages reached from the Profile tab. */
export type ProfileView = 'main' | 'prayers' | 'settings' | 'help' | 'about';

export interface NotificationPrefs {
  dailyVerse: boolean;
  prayerReminders: boolean;
  circleMessages: boolean;
  discussionReplies: boolean;
}

export interface WallPrayer {
  author: string;
  location: string;
  flag: string;
  text: string;
  count: number;
  prayed: boolean;
}

export type Privacy = 'Public' | 'Private';

export interface CreateForm {
  name: string;
  book: string;
  meetingTime: string;
  capacity: string;
  description: string;
  privacy: Privacy;
}
