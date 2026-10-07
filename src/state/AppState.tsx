import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CIRCLES_POOL, MEETING_TIMES } from '../data';
import type {
  Circle,
  CircleId,
  CircleMessage,
  CreateForm,
  DiscussionMessage,
  NotificationPrefs,
  Prayer,
  ProfileView,
  Screen,
  Tab,
  WallPrayer,
} from '../types';

export interface AppState {
  screen: Screen;
  tab: Tab;

  // Account & onboarding
  authMode: 'signup' | 'login';
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  locCity: string;
  locState: string;
  locCountry: string;
  book: string | null;
  interests: string[];
  struggles: string[];
  customInterest: string;

  // Home
  streak: number;
  wallPrayer: WallPrayer;
  prayers: Prayer[];
  myPrayerDraft: string;
  myPrayerAnonymous: boolean;

  // Discussions
  discussionSearch: string;
  discussionDraft: string;
  selectedDiscussion: string;
  discussionMessages: Record<string, DiscussionMessage[]>;
  amenedIds: string[];

  // Bible study
  bsView: 'home' | 'browse';
  joinedCircles: CircleId[];
  customCircles: Circle[];
  activeCircleId: CircleId | null;
  circleMessages: Record<string, CircleMessage[]>;
  circleChatDraft: string;
  circleSearch: string;
  circleFilters: string[];
  createForm: CreateForm;

  // Profile
  profileView: ProfileView;
  editingProfile: boolean;
  avatar: string | null; // profile photo as a data URL
  notifications: boolean; // master switch; the per-type prefs only apply while it's on
  notificationPrefs: NotificationPrefs;
  showNameInDiscussions: boolean;
  darkMode: boolean; // remembered on this device
}

const DARK_MODE_KEY = 'selah-dark-mode';

function loadDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export const emptyCreateForm = (): CreateForm => ({
  name: '',
  book: 'Genesis',
  meetingTime: MEETING_TIMES[0],
  capacity: '12',
  description: '',
  privacy: 'Private',
});

export const initialState = (): AppState => ({
  screen: 'splash',
  tab: 'home',
  authMode: 'signup',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  location: '',
  locCity: '',
  locState: '',
  locCountry: '',
  book: null,
  interests: [],
  struggles: [],
  customInterest: '',
  streak: 1,
  wallPrayer: {
    author: 'Anonymous',
    location: 'South Africa',
    flag: 'ZA',
    text: "Please pray for wisdom as I navigate a difficult career change and seek God's direction for my family during this uncertain transition.",
    count: 42,
    prayed: false,
  },
  // Sample prayer so the Prayers page has something to show while accounts don't exist yet.
  prayers: [
    {
      id: 1,
      text: 'Praying for clarity on a big decision I have to make this month.',
      status: 'current',
      createdAt: Date.now() - 3 * 86_400_000,
    },
  ],
  myPrayerDraft: '',
  myPrayerAnonymous: false,
  discussionSearch: '',
  discussionDraft: '',
  selectedDiscussion: 'Daily Scripture Reflections',
  discussionMessages: {},
  amenedIds: [],
  bsView: 'home',
  joinedCircles: [],
  customCircles: [],
  activeCircleId: null,
  circleMessages: {},
  circleChatDraft: '',
  circleSearch: '',
  circleFilters: [],
  createForm: emptyCreateForm(),
  profileView: 'main',
  editingProfile: false,
  avatar: null,
  notifications: true,
  notificationPrefs: { dailyVerse: true, prayerReminders: true, circleMessages: true, discussionReplies: false },
  showNameInDiscussions: true,
  darkMode: loadDarkMode(),
});

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState>);

interface Store {
  state: AppState;
  update: (patch: Patch) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const update = useCallback((patch: Patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_KEY, state.darkMode ? '1' : '0');
    } catch {
      // storage unavailable (private mode etc.): the setting just won't be remembered
    }
  }, [state.darkMode]);

  const store = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside AppStateProvider');
  return store;
}

export function allCircles(s: AppState): Circle[] {
  return [...CIRCLES_POOL, ...s.customCircles];
}

export function findCircle(s: AppState, id: CircleId | null): Circle | undefined {
  if (id == null) return undefined;
  return allCircles(s).find((c) => c.id === id);
}
