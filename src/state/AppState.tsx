import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CIRCLES_POOL, INTERESTS, MEETING_TIMES } from '../data';
import { orderChannels } from '../recommend';
import { clearSession, getSession, setSession } from '../services/auth';
import { deleteAccountData, loadAccountData, saveAccountData } from '../services/profile';
import type {
  Circle,
  CircleId,
  CircleMessage,
  CreateForm,
  DiscussionMessage,
  NotificationPrefs,
  Prayer,
  ProfileView,
  OnboardingScreen,
  Screen,
  Tab,
  WallPrayer,
} from '../types';

export interface AppState {
  screen: Screen;
  tab: Tab;

  // Account & onboarding
  authMode: 'signup' | 'login';
  /** Signed-in account; null before sign-up/log-in. */
  accountId: string | null;
  /** Finished onboarding, so the account opens straight to Home. */
  onboarded: boolean;
  name: string;
  email: string;
  location: string;
  locCity: string;
  locState: string;
  locCountry: string;
  book: string | null;
  interests: string[];
  struggles: string[];

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

/** Everything saved per account. Drafts, search boxes and screen positions are not saved. */
const ACCOUNT_KEYS = [
  'onboarded',
  'name',
  'email',
  'location',
  'locCity',
  'locState',
  'locCountry',
  'book',
  'interests',
  'struggles',
  'streak',
  'prayers',
  'joinedCircles',
  'customCircles',
  'circleMessages',
  'discussionMessages',
  'amenedIds',
  'avatar',
  'notifications',
  'notificationPrefs',
  'showNameInDiscussions',
] as const satisfies readonly (keyof AppState)[];

type AccountData = Pick<AppState, (typeof ACCOUNT_KEYS)[number]> & { onboardingStep?: OnboardingScreen };

const ONBOARDING_STEPS: OnboardingScreen[] = ['location', 'book', 'interests', 'struggles'];

/** The discussion channel to open first: the user's first interest, else the pinned channel. */
export function firstChannel(interests: string[]): string {
  return orderChannels(interests, INTERESTS)[0];
}

/** State for a signed-in account: its saved data, opened at Home or where onboarding left off. */
export function stateForAccount(accountId: string): AppState {
  const saved = loadAccountData<AccountData>(accountId) ?? {};
  const { onboardingStep, ...data } = saved;
  const base = { ...blankState(), ...data, accountId };
  return {
    ...base,
    screen: base.onboarded ? 'app' : onboardingStep && ONBOARDING_STEPS.includes(onboardingStep) ? onboardingStep : 'location',
    tab: 'home',
    selectedDiscussion: firstChannel(base.interests),
  };
}

/** On launch: a returning user goes straight to their account; otherwise the intro. */
export const initialState = (): AppState => {
  const accountId = getSession();
  return accountId ? stateForAccount(accountId) : blankState();
};

const blankState = (): AppState => ({
  screen: 'splash',
  tab: 'home',
  authMode: 'signup',
  accountId: null,
  onboarded: false,
  name: '',
  email: '',
  location: '',
  locCity: '',
  locState: '',
  locCountry: '',
  book: null,
  interests: [],
  struggles: [],
  streak: 1,
  wallPrayer: {
    author: 'Anonymous',
    location: 'South Africa',
    flag: 'ZA',
    text: "Please pray for wisdom as I navigate a difficult career change and seek God's direction for my family during this uncertain transition.",
    count: 42,
    prayed: false,
  },
  prayers: [],
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
  /** Log out: back to the intro. The account and its data stay saved. */
  reset: () => void;
  /** Start a session for an account that just signed up or logged in. */
  signIn: (accountId: string) => void;
  /** Remove the signed-in account's saved data and log out. */
  forgetAccount: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const update = useCallback((patch: Patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setState(blankState());
  }, []);

  const signIn = useCallback((accountId: string) => {
    setSession(accountId);
    setState(stateForAccount(accountId));
  }, []);

  const accountRef = useRef(state.accountId);
  accountRef.current = state.accountId;

  const forgetAccount = useCallback(() => {
    if (accountRef.current) deleteAccountData(accountRef.current);
    clearSession();
    setState(blankState());
  }, []);

  // Save the signed-in account's data whenever it changes (skipping writes when nothing did).
  const lastSaved = useRef('');
  useEffect(() => {
    if (!state.accountId) return;
    const data: Partial<AccountData> = {};
    for (const key of ACCOUNT_KEYS) (data as Record<string, unknown>)[key] = state[key];
    if (ONBOARDING_STEPS.includes(state.screen as OnboardingScreen)) data.onboardingStep = state.screen as OnboardingScreen;
    const json = JSON.stringify([state.accountId, data]);
    if (json === lastSaved.current) return;
    lastSaved.current = json;
    saveAccountData(state.accountId, data);
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_KEY, state.darkMode ? '1' : '0');
    } catch {
      // storage unavailable (private mode etc.): the setting just won't be remembered
    }
  }, [state.darkMode]);

  const store = useMemo(
    () => ({ state, update, reset, signIn, forgetAccount }),
    [state, update, reset, signIn, forgetAccount],
  );
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
