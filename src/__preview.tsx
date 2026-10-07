// TEMPORARY: opens the app on Bible Study with one circle joined, for screenshots. Delete after use.
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Phone } from './App';
import { AppStateProvider, useStore } from './state/AppState';
import './styles.css';

function Seed() {
  const { update } = useStore();
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    update({ screen: 'app', tab: 'biblestudy', name: 'Friend', joinedCircles: q.has('none') ? [] : [1], darkMode: q.has('dark') });
  }, [update]);
  return null;
}
createRoot(document.getElementById('root')!).render(
  <AppStateProvider>
    <Seed />
    <Phone />
  </AppStateProvider>,
);
