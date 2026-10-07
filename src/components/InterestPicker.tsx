import { useState } from 'react';
import { INTERESTS } from '../data';
import { toggle } from '../utils';
import { validateCustomTopic } from '../validation';

/** Interest chips plus "Add your own topic". Used in onboarding and Edit Profile. */
export function InterestPicker({ value, onChange }: { value: string[]; onChange: (interests: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const customOnes = value.filter((i) => !INTERESTS.includes(i));

  const add = () => {
    const problem = validateCustomTopic(draft, [...INTERESTS, ...value]);
    if (problem) return setError(problem);
    onChange([...value, draft.trim()]);
    setDraft('');
    setError(null);
  };

  return (
    <>
      <div className="chip-wrap">
        {INTERESTS.map((i) => (
          <button
            key={i}
            type="button"
            className={`chip ${value.includes(i) ? 'selected' : ''}`}
            aria-pressed={value.includes(i)}
            onClick={() => onChange(toggle(value, i))}
          >
            {i}
          </button>
        ))}
        {customOnes.map((i) => (
          <button
            key={i}
            type="button"
            className="chip selected"
            aria-label={`Remove ${i}`}
            onClick={() => onChange(value.filter((x) => x !== i))}
          >
            {i} ✕
          </button>
        ))}
      </div>

      <div className="custom-interest-row">
        <input
          className={`field-input ${error ? 'invalid' : ''}`}
          placeholder="Add your own topic"
          aria-label="Add your own topic"
          aria-invalid={!!error}
          aria-describedby={error ? 'custom-topic-error' : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            // Enter adds the topic instead of continuing (unless the field is empty)
            if (e.key === 'Enter' && draft.trim()) {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-ghost btn-ghost-compact" onClick={add} disabled={!draft.trim()}>
          Add
        </button>
      </div>
      {error && (
        <p id="custom-topic-error" className="field-error">
          {error}
        </p>
      )}
    </>
  );
}
