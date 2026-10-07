import { useState } from 'react';
import { LocationFields } from '../../components/LocationFields';
import { isLocationEmpty, saveLocation, validateLocation, type LocationFields as Fields } from '../../services/profile';
import { useStore } from '../../state/AppState';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

const STATE_KEYS = { city: 'locCity', state: 'locState', country: 'locCountry' } as const;

export function Location() {
  const { state, update } = useStore();
  const [saving, setSaving] = useState(false);
  const fields: Fields = { city: state.locCity, state: state.locState, country: state.locCountry };
  // The step can be skipped by leaving everything blank; once anything is typed, City + Country are required.
  const valid = Object.keys(validateLocation(fields)).length === 0;

  const skip = () => update({ locCity: '', locState: '', locCountry: '', location: '', screen: 'book' });

  const next = async () => {
    if (!valid || saving) return;
    if (isLocationEmpty(fields)) return skip();
    setSaving(true);
    try {
      const saved = await saveLocation(fields);
      update({
        locCity: saved.city,
        locState: saved.state,
        locCountry: saved.country,
        location: saved.display,
        screen: 'book',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      step="location"
      centered
      footer={
        <button className="btn-primary" onClick={next} disabled={!valid || saving}>
          Continue
        </button>
      }
    >
      <StepHeading title="Where are you joining us from?" note="This helps us connect you with local Bible studies." />

      <LocationFields
        value={fields}
        labelClassName="field-label-caps"
        onChange={(key, value) => update({ [STATE_KEYS[key]]: value })}
      />

      <div className="skip-row">
        <button className="subtle-skip" onClick={skip}>
          Skip — add this later in your profile
        </button>
      </div>
    </OnboardingLayout>
  );
}
