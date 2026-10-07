import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import { LocationFields } from '../../components/LocationFields';
import {
  checkPhotoFile,
  resizePhoto,
  saveAvatar,
  saveLocation,
  validateLocation,
  type LocationFields as Fields,
} from '../../services/profile';
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

/** Avatar with a camera badge. With no photo a tap opens the file picker; with one it opens a small menu. */
function AvatarPicker() {
  const { state, update } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const openPicker = () => {
    setMenuOpen(false);
    input.current?.click();
  };

  const pickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    const problem = checkPhotoFile(file);
    if (problem) return setError(problem);
    try {
      update({ avatar: await saveAvatar(await resizePhoto(file)) });
      setError(null);
    } catch {
      setError("Couldn't read that image");
    }
  };

  const removePhoto = async () => {
    setMenuOpen(false);
    setError(null);
    update({ avatar: await saveAvatar(null) });
  };

  return (
    <div className="avatar-wrap" ref={wrap}>
      <button
        className="avatar-circle avatar-button"
        onClick={() => (state.avatar ? setMenuOpen((o) => !o) : openPicker())}
        aria-label={state.avatar ? 'Profile photo options' : 'Add profile photo'}
        aria-haspopup={state.avatar ? 'menu' : undefined}
        aria-expanded={state.avatar ? menuOpen : undefined}
      >
        {state.avatar ? <img src={state.avatar} alt="" className="avatar-img" /> : initials(state.name)}
        <span className="avatar-badge">
          <Icon name="camera" />
        </span>
      </button>
      <input ref={input} type="file" accept="image/*" hidden onChange={pickPhoto} />
      {menuOpen && (
        <div className="avatar-menu" role="menu">
          <button role="menuitem" onClick={openPicker}>
            Choose new photo
          </button>
          <button role="menuitem" className="danger" onClick={removePhoto}>
            Remove photo
          </button>
        </div>
      )}
      {error && (
        <p className="field-error avatar-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function EditProfileForm({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const [name, setName] = useState(state.name);
  const [loc, setLoc] = useState<Fields>({ city: state.locCity, state: state.locState, country: state.locCountry });
  const [saving, setSaving] = useState(false);
  const valid = Object.keys(validateLocation(loc)).length === 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      const saved = await saveLocation(loc);
      update({
        name: name.trim(),
        locCity: saved.city,
        locState: saved.state,
        locCountry: saved.country,
        location: saved.display,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card flush-top" onSubmit={submit} noValidate>
      <label className="field-label" htmlFor="profile-name">
        Name
      </label>
      <input id="profile-name" className="field-input gap-md" value={name} onChange={(e) => setName(e.target.value)} />
      <LocationFields
        value={loc}
        onChange={(key, value) => setLoc((l) => ({ ...l, [key]: value }))}
      />
      <button type="submit" className="btn-primary edit-save" disabled={!valid || saving}>
        Save
      </button>
    </form>
  );
}

export function Profile() {
  const { state, update, reset } = useStore();
  const current = state.prayers.filter((p) => p.status === 'current');
  const answered = state.prayers.filter((p) => p.status === 'answered');

  const toggle = (key: SwitchKey) => update((s) => ({ [key]: !s[key] }));

  const markAnswered = (id: number) =>
    update((s) => ({ prayers: s.prayers.map((p) => (p.id === id ? { ...p, status: 'answered' } : p)) }));

  return (
    <>
      <header className="app-topbar">
        <h2 className="page-title">Profile</h2>
      </header>

      <div className="pad profile-identity">
        <AvatarPicker />
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

      {state.editingProfile && <EditProfileForm onDone={() => update({ editingProfile: false })} />}

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
