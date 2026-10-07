import type { FormEvent, KeyboardEvent } from 'react';
import { useStore } from '../state/AppState';
import { BottomSheet } from './Overlays';

/** The "Submit a Prayer Request" form, shared by Home and the Prayers page. */
export function PrayerRequestSheet({ onClose }: { onClose: () => void }) {
  const { state, update } = useStore();
  const draft = state.myPrayerDraft.trim();

  const share = (e?: FormEvent) => {
    e?.preventDefault();
    if (!draft) return;
    update((s) => ({
      prayers: [{ id: Date.now(), text: draft, status: 'current', createdAt: Date.now() }, ...s.prayers],
      myPrayerDraft: '',
    }));
    onClose();
  };

  // Enter submits; Shift+Enter still adds a line break.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      share();
    }
  };

  return (
    <BottomSheet title="Submit a Prayer Request" onClose={onClose}>
      <form className="sheet-body" onSubmit={share}>
        <textarea
          autoFocus
          className="field-input"
          placeholder="What's on your heart today?"
          aria-label="Your prayer request"
          value={state.myPrayerDraft}
          onChange={(e) => update({ myPrayerDraft: e.target.value })}
          onKeyDown={onKeyDown}
        />
        <div className="prayer-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={state.myPrayerAnonymous}
              onChange={(e) => update({ myPrayerAnonymous: e.target.checked })}
            />{' '}
            Post anonymously
          </label>
        </div>
        <button type="submit" className="btn-primary sheet-submit" disabled={!draft}>
          Share Prayer Request
        </button>
      </form>
    </BottomSheet>
  );
}
