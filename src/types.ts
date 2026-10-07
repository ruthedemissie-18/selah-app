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
}

export interface DiscussionMessage {
  id: string;
  author: string;
  time: string;
  text: string;
  amens: number;
}

export interface CircleMessage {
  id: string;
  author: string;
  text: string;
}

export interface Prayer {
  id: number;
  text: string;
  status: 'current' | 'answered';
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
