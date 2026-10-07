import { useStore, type AppState } from '../../state/AppState';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

type LocationKey = 'locCity' | 'locState' | 'locCountry';

const FIELDS: { key: LocationKey; label: string; placeholder: string }[] = [
  { key: 'locCity', label: 'City', placeholder: 'La Mirada' },
  { key: 'locState', label: 'State (optional)', placeholder: 'California' },
  { key: 'locCountry', label: 'Country', placeholder: 'United States' },
];

export function Location() {
  const { state, update } = useStore();
  const next = () => update({ screen: 'book' });

  const setField = (key: LocationKey, value: string) =>
    update((s: AppState) => {
      const merged = { ...s, [key]: value };
      const location = [merged.locCity, merged.locState, merged.locCountry].filter(Boolean).join(', ');
      return { [key]: value, location };
    });

  return (
    <OnboardingLayout
      step="location"
      centered
      footer={
        <button className="btn-primary" onClick={next}>
          Continue
        </button>
      }
    >
      <StepHeading title="Where are you joining us from?" note="This helps us connect you with local Bible studies." />

      {FIELDS.map(({ key, label, placeholder }, i) => (
        <div key={key}>
          <label className="field-label-caps">{label}</label>
          <input
            className={`field-input ${i < FIELDS.length - 1 ? 'gap-lg' : ''}`}
            placeholder={placeholder}
            value={state[key]}
            onChange={(e) => setField(key, e.target.value)}
          />
        </div>
      ))}

      <div className="skip-row">
        <button className="subtle-skip" onClick={next}>
          Skip — add this later in your profile
        </button>
      </div>
    </OnboardingLayout>
  );
}
