import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CIRCLES_POOL, MEETING_TIMES } from '../data';
import type {
  Circle,
  CircleId,
  CircleMessage,
  CreateForm,
  DiscussionMessage,
  Prayer,
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
  editingProfile: boolean;
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
  streak: 4,
  wallPrayer: {
    author: 'Anonymous',
    location: 'South Africa',
    flag: 'ZA',
    text: "Please pray for wisdom as I navigate a difficult career change and seek God's direction for my family during this uncertain transition.",
    count: 42,
    prayed: false,
  },
  prayers: [{ id: 1, text: 'Praying for clarity on a big decision I have to make this month.', status: 'current' }],
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
  editingProfile: false,
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
