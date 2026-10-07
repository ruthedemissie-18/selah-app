import { useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { Icon, type IconName } from './components/Icon';
import { OverlayRootContext } from './components/Overlays';
import { BibleStudy } from './screens/app/bibleStudy/BibleStudy';
import { Discussions } from './screens/app/Discussions';
import { Home } from './screens/app/Home';
import { Profile } from './screens/app/Profile';
import { Auth } from './screens/onboarding/Auth';
import { Book } from './screens/onboarding/Book';
import { Interests } from './screens/onboarding/Interests';
import { Location } from './screens/onboarding/Location';
import { Splash } from './screens/onboarding/Splash';
import { Struggles } from './screens/onboarding/Struggles';
import { Transition } from './screens/onboarding/Transition';
import { AppStateProvider, findCircle, useStore, type AppState } from './state/AppState';
import type { Screen, Tab } from './types';

const TABS: { id: Tab; label: string; icon: IconName; view: ComponentType }[] = [
  { id: 'home', label: 'Home', icon: 'home', view: Home },
  { id: 'discussions', label: 'Discussions', icon: 'chat', view: Discussions },
  { id: 'biblestudy', label: 'Bible Study', icon: 'book', view: BibleStudy },
  { id: 'profile', label: 'Profile', icon: 'user', view: Profile },
];

const SCREENS: Record<Exclude<Screen, 'app'>, ComponentType> = {
  splash: Splash,
  auth: Auth,
  location: Location,
  book: Book,
  interests: Interests,
  struggles: Struggles,
  transition: Transition,
};

function TabBar() {
  const { state, update } = useStore();
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab-btn ${state.tab === t.id ? 'active' : ''}`}
          onClick={() => update({ tab: t.id })}
        >
          <Icon name={t.icon} />
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/** An open circle chat takes the whole screen: no tab bar, and its message list does its own scrolling. */
function inCircleChat(state: AppState): boolean {
  return state.tab === 'biblestudy' && !!findCircle(state, state.activeCircleId);
}

/** Chat-style screens fill the height and scroll only their message list. */
function bodyLayout(state: AppState): string {
  if (inCircleChat(state)) return 'chat-mode';
  if (state.tab === 'discussions') return 'chat-mode above-tabbar';
  return '';
}

function MainApp() {
  const { state } = useStore();
  const View = TABS.find((t) => t.id === state.tab)!.view;
  return (
    // Keyed so each tab (and each Bible Study sub-view) opens scrolled to the top.
    <div className={`app-body ${bodyLayout(state)}`} key={`${state.tab}:${state.bsView}:${state.activeCircleId ?? ''}`}>
      <View />
    </div>
  );
}

function Phone() {
  const { state } = useStore();
  const [overlayRoot, setOverlayRoot] = useState<HTMLDivElement | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inApp = state.screen === 'app';
  const ScreenView = state.screen === 'app' ? MainApp : SCREENS[state.screen];

  // Each new screen starts scrolled to the top.
  useLayoutEffect(() => {
    screenRef.current?.scrollTo(0, 0);
  }, [state.screen]);

  return (
    <OverlayRootContext.Provider value={overlayRoot}>
      <div className={`phone ${inApp && state.darkMode ? 'dark' : ''}`}>
        <div className="notch" />
        <div className="screen" ref={screenRef}>
          <ScreenView />
        </div>
        {inApp && !inCircleChat(state) && <TabBar />}
        <div ref={setOverlayRoot} />
      </div>
    </OverlayRootContext.Provider>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Phone />
    </AppStateProvider>
  );
}
