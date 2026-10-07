import { useState, type FormEvent } from 'react';
import { BottomSheet, CenterModal, Toast, type ToastData } from '../../components/Overlays';
import { MenuCard, MenuRow, PageHeader, SectionLabel, Switch } from '../../components/ProfileUI';
import { useStore } from '../../state/AppState';
import type { NotificationPrefs } from '../../types';
import { isValidEmail } from '../../utils';

const NOTIFICATION_TYPES: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'dailyVerse', label: 'Daily verse' },
  { key: 'prayerReminders', label: 'Prayer reminders' },
  { key: 'circleMessages', label: 'Circle messages' },
  { key: 'discussionReplies', label: 'Discussion replies' },
];

const MIN_PASSWORD = 8;

type Sheet = 'email' | 'password' | 'blocked' | null;

// UI only for now: there's no account system yet, so these forms don't change real credentials.
function ChangeEmailSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { state, update } = useStore();
  const [email, setEmail] = useState(state.email);
  const valid = isValidEmail(email.trim()) && email.trim() !== state.email;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    update({ email: email.trim() });
    onSaved();
  };

  return (
    <BottomSheet title="Change email" onClose={onClose}>
      <form className="sheet-body" onSubmit={save}>
        <label className="field-label" htmlFor="new-email">
          New email
        </label>
        <input
          id="new-email"
          type="email"
          autoFocus
          className="field-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn-primary sheet-submit" disabled={!valid}>
          Save email
        </button>
      </form>
    </BottomSheet>
  );
}

function ChangePasswordSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD;
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = current.length > 0 && next.length >= MIN_PASSWORD && confirm === next;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onSaved();
  };

  return (
    <BottomSheet title="Change password" onClose={onClose}>
      <form className="sheet-body" onSubmit={save}>
        <label className="field-label" htmlFor="pw-current">
          Current password
        </label>
        <input
          id="pw-current"
          type="password"
          autoFocus
          className="field-input gap-md"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <label className="field-label" htmlFor="pw-new">
          New password
        </label>
        <input
          id="pw-new"
          type="password"
          className={`field-input ${tooShort ? 'invalid gap-xs' : 'gap-md'}`}
          placeholder={`At least ${MIN_PASSWORD} characters`}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        {tooShort && <p className="field-error">Use at least {MIN_PASSWORD} characters</p>}
        <label className="field-label" htmlFor="pw-confirm">
          Confirm new password
        </label>
        <input
          id="pw-confirm"
          type="password"
          className={`field-input ${mismatch ? 'invalid' : ''}`}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {mismatch && <p className="field-error flush-bottom">Passwords don't match</p>}
        <button type="submit" className="btn-primary sheet-submit" disabled={!valid}>
          Update password
        </button>
      </form>
    </BottomSheet>
  );
}

export function Settings() {
  const { state, update, reset } = useStore();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const { notifications, notificationPrefs: prefs } = state;

  const saved = (message: string) => {
    setSheet(null);
    setToast({ id: Date.now(), message });
  };

  return (
    <div className="subpage">
      <PageHeader title="Settings" />

      <SectionLabel>Notifications</SectionLabel>
      <MenuCard>
        <MenuRow
          icon="bell"
          title="Allow notifications"
          trailing={
            <Switch label="Allow notifications" checked={notifications} onChange={(v) => update({ notifications: v })} />
          }
        />
        {NOTIFICATION_TYPES.map(({ key, label }) => (
          <MenuRow
            key={key}
            title={label}
            disabled={!notifications}
            trailing={
              <Switch
                label={label}
                checked={prefs[key]}
                disabled={!notifications}
                onChange={(v) => update((s) => ({ notificationPrefs: { ...s.notificationPrefs, [key]: v } }))}
              />
            }
          />
        ))}
      </MenuCard>

      <SectionLabel>Privacy</SectionLabel>
      <MenuCard>
        <MenuRow
          title="Show my name in discussions"
          trailing={
            <Switch
              label="Show my name in discussions"
              checked={state.showNameInDiscussions}
              onChange={(v) => update({ showNameInDiscussions: v })}
            />
          }
        />
        <MenuRow title="Blocked users" onClick={() => setSheet('blocked')} />
      </MenuCard>

      <SectionLabel>Account</SectionLabel>
      <MenuCard>
        <MenuRow title="Change email" subtitle={state.email || undefined} onClick={() => setSheet('email')} />
        <MenuRow title="Change password" onClick={() => setSheet('password')} />
        <MenuRow title="Delete account" danger onClick={() => setConfirmDelete(true)} />
      </MenuCard>

      {sheet === 'email' && <ChangeEmailSheet onClose={() => setSheet(null)} onSaved={() => saved('Email updated')} />}
      {sheet === 'password' && (
        <ChangePasswordSheet onClose={() => setSheet(null)} onSaved={() => saved('Password updated')} />
      )}
      {sheet === 'blocked' && (
        <BottomSheet title="Blocked users" onClose={() => setSheet(null)}>
          <div className="sheet-body">
            <div className="empty-card">You haven't blocked anyone.</div>
          </div>
        </BottomSheet>
      )}

      {confirmDelete && (
        <CenterModal onClose={() => setConfirmDelete(false)}>
          <h2 className="modal-title">Delete your account?</h2>
          <p className="center-modal-text">
            This removes your profile, prayers and circles from Selah. It can't be undone.
          </p>
          <div className="center-modal-actions">
            <button className="modal-btn-ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
            <button className="modal-btn-danger" onClick={reset}>
              Delete
            </button>
          </div>
        </CenterModal>
      )}

      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
