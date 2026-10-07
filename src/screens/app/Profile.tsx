import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Icon } from '../../components/Icon';
import { LocationFields } from '../../components/LocationFields';
import { CenterModal, Toast, type ToastData } from '../../components/Overlays';
import { MenuCard, MenuRow, SectionLabel, Switch } from '../../components/ProfileUI';
import {
  checkPhotoFile,
  resizePhoto,
  saveAvatar,
  saveLocation,
  validateLocation,
  type LocationFields as Fields,
} from '../../services/profile';
import { BookPicker } from '../../components/BookPicker';
import { InterestPicker } from '../../components/InterestPicker';
import { bookLabel } from '../../recommend';
import { firstChannel, useStore } from '../../state/AppState';
import { validateBook, validateInterests, validateName } from '../../validation';
import { initials } from '../../utils';
import { AboutPage, APP_VERSION, HelpPage } from './InfoPages';
import { Prayers } from './Prayers';
import { Settings } from './Settings';

const SHARE_MESSAGE = 'Join me on Selah, a space to pray, study Scripture and grow together.';

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

/** Edit Profile: same rules as sign-up and onboarding. Saving re-orders circles and channels right away. */
function EditProfileForm({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const [name, setName] = useState(state.name);
  const [nameTouched, setNameTouched] = useState(false);
  const [loc, setLoc] = useState<Fields>({ city: state.locCity, state: state.locState, country: state.locCountry });
  const [book, setBook] = useState(state.book);
  const [interests, setInterests] = useState(state.interests);
  const [saving, setSaving] = useState(false);

  const nameError = validateName(name);
  const interestsError = validateInterests(interests);
  const valid =
    !nameError && Object.keys(validateLocation(loc)).length === 0 && !validateBook(book) && !interestsError;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      const saved = await saveLocation(loc);
      update((s) => ({
        name: name.trim(),
        locCity: saved.city,
        locState: saved.state,
        locCountry: saved.country,
        location: saved.display,
        book,
        interests,
        // new interests mean a new first channel in Discussions
        selectedDiscussion: interests.join() === s.interests.join() ? s.selectedDiscussion : firstChannel(interests),
      }));
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
      <input
        id="profile-name"
        className={`field-input ${nameTouched && nameError ? 'invalid' : ''}`}
        aria-invalid={nameTouched && !!nameError}
        aria-describedby={nameTouched && nameError ? 'profile-name-error' : undefined}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setNameTouched(true)}
      />
      {nameTouched && nameError ? (
        <p id="profile-name-error" className="field-error">
          {nameError}
        </p>
      ) : (
        <div className="gap-md" />
      )}
      <LocationFields value={loc} onChange={(key, value) => setLoc((l) => ({ ...l, [key]: value }))} />

      <label className="field-label edit-section-label" htmlFor="profile-book">
        Book you're studying
      </label>
      <BookPicker id="profile-book" value={book} onChange={setBook} />

      <div className="field-label edit-section-label">Interests</div>
      <InterestPicker value={interests} onChange={setInterests} />
      {interestsError && <p className="field-error">{interestsError}</p>}

      <button type="submit" className="btn-primary edit-save" disabled={!valid || saving}>
        Save
      </button>
    </form>
  );
}

export function Profile() {
  switch (useStore().state.profileView) {
    case 'prayers':
      return <Prayers />;
    case 'settings':
      return <Settings />;
    case 'help':
      return <HelpPage />;
    case 'about':
      return <AboutPage />;
    default:
      return <ProfileMain />;
  }
}

function ProfileMain() {
  const { state, update, reset } = useStore();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const unanswered = state.prayers.filter((p) => p.status === 'current').length;
  const answered = state.prayers.length - unanswered;

  const share = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Selah', text: SHARE_MESSAGE, url });
      } catch {
        // the user closed the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${SHARE_MESSAGE} ${url}`);
      setToast({ id: Date.now(), message: 'Link copied' });
    } catch {
      setToast({ id: Date.now(), message: "Couldn't copy the link" });
    }
  };

  return (
    <div className="subpage">
      <h2 className="profile-title">Profile</h2>

      <div className="profile-identity">
        <AvatarPicker />
        <div className="profile-identity-text">
          <div className="profile-name">{state.name || 'Friend'}</div>
          <div className="profile-location">{state.location || 'Location not set'}</div>
        </div>
      </div>

      <div className="profile-tags" aria-label="Your book and interests">
        <span className="profile-tag book">📖 {bookLabel(state.book)}</span>
        {state.interests.map((i) => (
          <span key={i} className="profile-tag">
            {i}
          </span>
        ))}
      </div>

      <button className="btn-ghost profile-edit-btn" onClick={() => update((s) => ({ editingProfile: !s.editingProfile }))}>
        {state.editingProfile ? 'Close' : 'Edit Profile'}
      </button>

      {state.editingProfile && <EditProfileForm onDone={() => update({ editingProfile: false })} />}

      <MenuCard>
        <MenuRow
          icon="heart"
          title="Prayers"
          subtitle={`${unanswered} unanswered · ${answered} answered`}
          onClick={() => update({ profileView: 'prayers' })}
        />
      </MenuCard>

      <SectionLabel>Preferences</SectionLabel>
      <MenuCard>
        <MenuRow
          icon="bell"
          title="Notifications"
          trailing={
            <Switch label="Notifications" checked={state.notifications} onChange={(v) => update({ notifications: v })} />
          }
        />
        <MenuRow
          icon="moon"
          title="Dark Mode"
          trailing={<Switch label="Dark Mode" checked={state.darkMode} onChange={(v) => update({ darkMode: v })} />}
        />
        <MenuRow
          icon="gear"
          title="Settings"
          subtitle="Notification types, privacy, account"
          onClick={() => update({ profileView: 'settings' })}
        />
      </MenuCard>

      <SectionLabel>Support</SectionLabel>
      <MenuCard>
        <MenuRow icon="help" title="Help & Support" onClick={() => update({ profileView: 'help' })} />
        <MenuRow icon="share" title="Share Selah" subtitle="Invite a friend to the app" onClick={share} />
        <MenuRow icon="info" title="About Selah" onClick={() => update({ profileView: 'about' })} />
      </MenuCard>

      <button className="logout-btn" onClick={() => setConfirmLogout(true)}>
        Log Out
      </button>
      <div className="app-version">{APP_VERSION}</div>

      {confirmLogout && (
        <CenterModal onClose={() => setConfirmLogout(false)}>
          <h2 className="modal-title">Log out of Selah?</h2>
          <div className="center-modal-actions">
            <button className="modal-btn-ghost" onClick={() => setConfirmLogout(false)}>
              Cancel
            </button>
            <button className="modal-btn-danger" onClick={reset}>
              Log out
            </button>
          </div>
        </CenterModal>
      )}

      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
