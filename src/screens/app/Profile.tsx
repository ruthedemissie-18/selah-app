import { useRef, type ChangeEvent } from 'react';
import { Icon } from '../../components/Icon';
import { useStore } from '../../state/AppState';
import { initials } from '../../utils';

type SwitchKey = 'darkMode' | 'notifications';

const SWITCHES: { key: SwitchKey; label: string }[] = [
  { key: 'darkMode', label: 'Dark Mode' },
  { key: 'notifications', label: 'Notifications' },
];

const SETTINGS = [
  { label: 'Privacy', value: 'Manage' },
  { label: 'Account', value: 'Manage' },
];

export function Profile() {
  const { state, update, reset } = useStore();
  const current = state.prayers.filter((p) => p.status === 'current');
  const answered = state.prayers.filter((p) => p.status === 'answered');

  const photoInput = useRef<HTMLInputElement>(null);

  const pickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const toggle = (key: SwitchKey) => update((s) => ({ [key]: !s[key] }));

  const markAnswered = (id: number) =>
    update((s) => ({ prayers: s.prayers.map((p) => (p.id === id ? { ...p, status: 'answered' } : p)) }));

  return (
    <>
      <header className="app-topbar">
        <h2 className="page-title">Profile</h2>
      </header>

      <div className="pad profile-identity">
        <button
          className="avatar-circle avatar-button"
          onClick={() => photoInput.current?.click()}
          aria-label={state.avatar ? 'Change profile photo' : 'Add profile photo'}
        >
          {state.avatar ? <img src={state.avatar} alt="" className="avatar-img" /> : initials(state.name)}
          <span className="avatar-badge">
            <Icon name="camera" />
          </span>
        </button>
        <input ref={photoInput} type="file" accept="image/*" hidden onChange={pickPhoto} />
        <div>
          <div className="profile-name">{state.name || 'Friend'}</div>
          <div className="profile-location">{state.location || 'Location not set'}</div>
        </div>
      </div>

      <div className="pad flush-top">
        <button className="btn-ghost" onClick={() => update((s) => ({ editingProfile: !s.editingProfile }))}>
          {state.editingProfile ? 'Close' : 'Edit Profile'}
        </button>
      </div>

      {state.editingProfile && (
        <div className="card flush-top">
          <label className="field-label">Name</label>
          <input
            className="field-input gap-sm"
            value={state.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <label className="field-label">Location</label>
          <input
            className="field-input"
            value={state.location}
            onChange={(e) => update({ location: e.target.value })}
          />
          <label className="field-label">Profile Photo</label>
          <div className="photo-actions">
            <button className="btn-link" onClick={() => photoInput.current?.click()}>
              {state.avatar ? 'Change photo' : 'Upload photo'}
            </button>
            {state.avatar && (
              <button className="btn-link btn-danger" onClick={() => update({ avatar: null })}>
                Remove photo
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Prayers</div>
        <div className="toggle-pills flush">
          <span className="toggle-pill on">Current ({current.length})</span>
          <span className="toggle-pill">Answered ({answered.length})</span>
        </div>
        {current.length ? (
          current.map((p) => (
            <div key={p.id} className="prayer-item">
              {p.text}
              <div className="prayer-item-action">
                <button className="btn-link" onClick={() => markAnswered(p.id)}>
                  Mark as answered
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-note">No current prayers.</div>
        )}
      </div>

      <div className="card settings-card">
        {SWITCHES.map(({ key, label }) => (
          <div key={key} className="settings-row">
            <span id={`${key}-label`}>{label}</span>
            <button
              className="switch"
              role="switch"
              aria-checked={state[key]}
              aria-labelledby={`${key}-label`}
              onClick={() => toggle(key)}
            />
          </div>
        ))}
        {SETTINGS.map(({ label, value }) => (
          <div key={label} className="settings-row">
            <span>{label}</span>
            <span className="settings-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="pad flush-top">
        <button className="btn-ghost btn-danger" onClick={reset}>
          Log Out
        </button>
      </div>
    </>
  );
}
