import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Toast, type ToastData } from '../../components/Overlays';
import { PrayerRequestSheet } from '../../components/PrayerRequestSheet';
import { DotsMenu, PageHeader } from '../../components/ProfileUI';
import { useStore } from '../../state/AppState';
import type { Prayer } from '../../types';

type Tab = 'current' | 'answered';

const DAY_MS = 86_400_000;
/** How long the heart fill animation plays before the prayer moves to the other tab. */
const FILL_MS = 350;

function daysBetween(from: number, to: number): number {
  const start = new Date(from).setHours(0, 0, 0, 0);
  const end = new Date(to).setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((end - start) / DAY_MS));
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function prayerMeta(p: Prayer): string {
  if (p.status === 'answered' && p.answeredAt) {
    const date = new Date(p.answeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const days = daysBetween(p.createdAt, p.answeredAt);
    return `Answered ${date} · ${days === 0 ? 'the same day' : `after ${plural(days, 'day')}`}`;
  }
  const days = daysBetween(p.createdAt, Date.now());
  return days === 0 ? 'Praying since today' : `Praying for ${plural(days, 'day')}`;
}

export function Prayers() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<Tab>('current');
  const [filling, setFilling] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const current = state.prayers.filter((p) => p.status === 'current');
  const answered = state.prayers.filter((p) => p.status === 'answered');
  const shown = tab === 'current' ? current : answered;

  /** Applies a change to the prayer list and offers Undo, which restores the list as it was. */
  const changeWithUndo = (message: string, change: (prayers: Prayer[]) => Prayer[]) => {
    const before = state.prayers;
    update((s) => ({ prayers: change(s.prayers) }));
    setToast({ id: Date.now(), message, actionLabel: 'Undo', onAction: () => update({ prayers: before }) });
  };

  const toggleAnswered = (p: Prayer) => {
    setFilling(p.id);
    setTimeout(() => {
      setFilling(null);
      const toAnswered = p.status === 'current';
      changeWithUndo(toAnswered ? 'Moved to Answered 🙏' : 'Moved back to Current', (prayers) =>
        prayers.map((x) =>
          x.id === p.id
            ? { ...x, status: toAnswered ? 'answered' : 'current', answeredAt: toAnswered ? Date.now() : undefined }
            : x,
        ),
      );
    }, FILL_MS);
  };

  const remove = (p: Prayer) => changeWithUndo('Prayer deleted', (prayers) => prayers.filter((x) => x.id !== p.id));

  return (
    <div className="subpage">
      <PageHeader title="Prayers" />

      <div className="pill-tabs" role="tablist">
        {(['current', 'answered'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`pill-tab ${tab === t ? 'on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'current' ? `Current (${current.length})` : `Answered (${answered.length})`}
          </button>
        ))}
      </div>

      <div className="prayer-list">
        {shown.length === 0 && (
          <div className="empty-card">
            {tab === 'current' ? 'No prayers yet. Add your first one.' : 'Answered prayers will show up here.'}
          </div>
        )}
        {shown.map((p) => {
          const isAnswered = p.status === 'answered';
          return (
            <div key={p.id} className="prayer-card">
              <div className="prayer-card-body">
                <div className="prayer-card-text">{p.text}</div>
                <div className="prayer-card-meta">{prayerMeta(p)}</div>
              </div>
              <div className="prayer-card-actions">
                <button
                  className={`heart-btn ${isAnswered ? 'filled' : ''} ${filling === p.id ? 'filling' : ''}`}
                  onClick={() => toggleAnswered(p)}
                  disabled={filling !== null}
                  aria-label={isAnswered ? 'Move back to current' : 'Mark as answered'}
                >
                  <Icon name="heart" />
                </button>
                <DotsMenu label="Prayer options" items={[{ label: 'Delete', danger: true, onSelect: () => remove(p) }]} />
              </div>
            </div>
          );
        })}

        <button
          className="btn-primary add-prayer-btn"
          onClick={() => {
            setTab('current'); // new prayers land in Current
            setAdding(true);
          }}
        >
          + Add a Prayer
        </button>
      </div>

      {adding && <PrayerRequestSheet onClose={() => setAdding(false)} />}
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
