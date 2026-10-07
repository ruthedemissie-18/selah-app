// TEMPORARY screenshot harness. Delete after use.
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Phone } from './App';
import { AppStateProvider, useStore } from './state/AppState';
import type { ProfileView } from './types';
import './styles.css';

function Seed() {
  const { update } = useStore();
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const now = Date.now(), day = 86_400_000;
    update({
      screen: 'app', tab: 'profile', name: 'Friend', location: 'Los Angeles, CA, USA', email: 'friend@example.com',
      profileView: (q.get('view') ?? 'main') as ProfileView, darkMode: q.has('dark'),
      prayers: [
        { id: 1, text: 'Praying for clarity on a big decision I have to make this month.', status: 'current', createdAt: now - 3 * day },
        { id: 2, text: "For my grandmother's health.", status: 'current', createdAt: now - day },
        { id: 3, text: 'A new job for my brother.', status: 'answered', createdAt: now - 14 * day, answeredAt: now - 2 * day },
      ],
    });
  }, [update]);
  return null;
}
createRoot(document.getElementById('root')!).render(<AppStateProvider><Seed /><Phone /></AppStateProvider>);
