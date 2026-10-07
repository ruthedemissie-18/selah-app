import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { BottomSheet, CloseX } from '../../../components/Overlays';
import { MEETING_TIMES, NT_BOOKS, OT_BOOKS } from '../../../data';
import { emptyCreateForm, useStore } from '../../../state/AppState';
import type { Circle, CreateForm, Privacy } from '../../../types';
import { MAX_JOINED_CIRCLES } from './CircleCards';

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="select-wrap">
      <select className="field-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <Icon name="chevron" className="select-chevron" />
    </div>
  );
}

function VerificationPending({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet title="Verification" onClose={onClose}>
      <div className="sheet-body verify-box">
        <div className="spinner" />
        <h3 className="verify-title">Verification in progress</h3>
        <p className="verify-text">
          To keep the community safe, teachers must be verified before leading a public circle. An email will be sent to
          you shortly with next steps.
        </p>
        <button className="btn-ghost verify-done" onClick={onClose}>
          Got it
        </button>
      </div>
    </BottomSheet>
  );
}

export function CreateStudySheet({ onClose }: { onClose: () => void }) {
  const { state, update } = useStore();
  const [verifying, setVerifying] = useState(false);
  const form = state.createForm;
  const atLimit = state.joinedCircles.length >= MAX_JOINED_CIRCLES;

  const setField = <K extends keyof CreateForm>(key: K, value: CreateForm[K]) =>
    update((s) => ({ createForm: { ...s.createForm, [key]: value } }));

  const create = () => {
    if (!form.name.trim()) return;

    // Public circles need teacher verification first — simulated in this prototype.
    if (form.privacy === 'Public') {
      setVerifying(true);
      return;
    }

    const circle: Circle = {
      id: `custom-${Date.now()}`,
      category: (form.book || 'General').toUpperCase(),
      name: form.name.trim(),
      leader: state.name || 'You',
      time: form.meetingTime || 'Time TBD',
      members: 1,
      capacity: parseInt(form.capacity, 10) || 12,
      testament: OT_BOOKS.includes(form.book) ? 'OT' : 'NT',
      format: 'Online',
      description: form.description || '',
    };
    update((s) => ({
      customCircles: [...s.customCircles, circle],
      joinedCircles: s.joinedCircles.length < MAX_JOINED_CIRCLES ? [...s.joinedCircles, circle.id] : s.joinedCircles,
      createForm: emptyCreateForm(),
    }));
    onClose();
  };

  if (verifying) return <VerificationPending onClose={onClose} />;

  const privacyOptions: { value: Privacy; label: string }[] = [
    { value: 'Public', label: 'Public' },
    { value: 'Private', label: 'Private / Link-Only' },
  ];

  return (
    <BottomSheet onClose={onClose}>
      <CloseX className="sheet-close-abs" onClick={onClose} />
      <div className="sheet-body create-body">
        <div className="eyebrow">New Circle</div>
        <h2 className="modal-title create-title">Create a Bible Study</h2>

        <div className="form-row">
          <label className="field-label-caps">Study Name</label>
          <input
            className="field-input"
            placeholder="e.g. John: Anchored"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="field-label-caps">Book / Topic</label>
          <SelectField value={form.book} onChange={(v) => setField('book', v)}>
            <option value="">Select a book</option>
            <optgroup label="Old Testament">
              {OT_BOOKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </optgroup>
            <optgroup label="New Testament">
              {NT_BOOKS.map((b) => (
                <option key={`nt-${b}`} value={b}>
                  {b}
                </option>
              ))}
            </optgroup>
          </SelectField>
        </div>

        <div className="form-row">
          <label className="field-label-caps">Meeting Time</label>
          <SelectField value={form.meetingTime} onChange={(v) => setField('meetingTime', v)}>
            {MEETING_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="form-row">
          <label className="field-label-caps">Member Capacity</label>
          <input
            className="field-input"
            type="number"
            min={2}
            value={form.capacity}
            onChange={(e) => setField('capacity', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="field-label-caps">Description</label>
          <textarea
            className="field-input"
            placeholder="What will this study focus on?"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="field-label-caps">Privacy</label>
          <div className="privacy-toggle-lg">
            {privacyOptions.map(({ value, label }) => (
              <button
                key={value}
                className={`privacy-btn-lg ${form.privacy === value ? 'on' : ''}`}
                onClick={() => setField('privacy', value)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="privacy-note">
            Public studies require leader verification. Go to Profile → Leader Verification to get verified.
          </p>
          <p className="privacy-note">Only people with your invite link can join this study.</p>
        </div>

        {atLimit && form.privacy === 'Private' && (
          <p className="limit-warning">
            You're already in 2 circles — creating this one won't auto-join you, but others can still join it.
          </p>
        )}

        <button className="btn-primary create-submit" onClick={create}>
          Create Study
        </button>
      </div>
    </BottomSheet>
  );
}
