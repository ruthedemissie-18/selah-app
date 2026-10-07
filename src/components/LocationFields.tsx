import { useState } from 'react';
import { validateLocation, type LocationFields as Fields } from '../services/profile';

type Key = keyof Fields;

const FIELDS: { key: Key; label: string; placeholder: string }[] = [
  { key: 'city', label: 'City', placeholder: 'La Mirada' },
  { key: 'state', label: 'State / Region (optional)', placeholder: 'California' },
  { key: 'country', label: 'Country', placeholder: 'United States' },
];

interface Props {
  value: Fields;
  onChange: (key: Key, value: string) => void;
  labelClassName?: string;
}

/** City / State / Country inputs with errors shown under a field once the user leaves it. */
export function LocationFields({ value, onChange, labelClassName = 'field-label' }: Props) {
  const [touched, setTouched] = useState<Set<Key>>(() => new Set());
  const errors = validateLocation(value);

  return (
    <>
      {FIELDS.map(({ key, label, placeholder }, i) => {
        const error = touched.has(key) && errors[key];
        const last = i === FIELDS.length - 1;
        return (
          <div key={key} className={last ? '' : 'gap-md'}>
            <label className={labelClassName} htmlFor={`loc-${key}`}>
              {label}
            </label>
            <input
              id={`loc-${key}`}
              className={`field-input ${error ? 'invalid' : ''}`}
              placeholder={placeholder}
              value={value[key]}
              aria-invalid={!!error}
              aria-describedby={error ? `loc-${key}-error` : undefined}
              onChange={(e) => onChange(key, e.target.value)}
              onBlur={() => setTouched((t) => new Set(t).add(key))}
            />
            {error && (
              <p id={`loc-${key}-error`} className="field-error flush-bottom">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </>
  );
}
