import { useStore } from '../../state/AppState';
import { initials } from '../../utils';

const SETTINGS = [
  { label: 'Notifications', value: 'On' },
  { label: 'Privacy', value: 'Manage' },
  { label: 'Account', value: 'Manage' },
];

export function Profile() {
  const { state, update, reset } = useStore();
  const current = state.prayers.filter((p) => p.status === 'current');
  const answered = state.prayers.filter((p) => p.status === 'answered');

  const markAnswered = (id: number) =>
    update((s) => ({ prayers: s.prayers.map((p) => (p.id === id ? { ...p, status: 'answered' } : p)) }));

  return (
    <>
      <header className="app-topbar">
        <h2 className="page-title">Profile</h2>
      </header>

      <div className="pad profile-identity">
        <div className="avatar-circle">{initials(state.name)}</div>
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
        {SETTINGS.map(({ label, value }) => (
          <div key={label} className="settings-row">
            <span>{label}</span>
            <span className="settings-value">{value}</span>
          </div>
        ))}
        <div className="settings-row">
          <span id="dark-mode-label">Dark Mode</span>
          <button
            className="switch"
            role="switch"
            aria-checked={state.darkMode}
            aria-labelledby="dark-mode-label"
            onClick={() => update((s) => ({ darkMode: !s.darkMode }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">About Selah</div>
        <p className="about-text">
          Selah is a space to find your community and build your own — through shared prayer, honest struggle, and
          Scripture read together.
        </p>
      </div>

      <div className="pad flush-top">
        <button className="btn-ghost btn-danger" onClick={reset}>
          Log Out
        </button>
      </div>
    </>
  );
}
