import { INTERESTS } from '../../data';
import { useStore } from '../../state/AppState';
import { toggle } from '../../utils';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

export function Interests() {
  const { state, update } = useStore();
  const { interests, customInterest } = state;
  const customOnes = interests.filter((i) => !INTERESTS.includes(i));

  const toggleInterest = (i: string) => update((s) => ({ interests: toggle(s.interests, i) }));

  const addCustom = () => {
    const value = customInterest.trim();
    if (!value) return;
    update((s) => ({ interests: [...s.interests, value], customInterest: '' }));
  };

  return (
    <OnboardingLayout
      step="interests"
      footer={
        <button className="btn-primary" onClick={() => update({ screen: 'struggles' })}>
          Continue
        </button>
      }
    >
      <StepHeading
        spaced
        title="What draws you in?"
        note="We'll place you in discussion spaces around these topics. Pick a few, or write your own."
      />

      <div className="chip-wrap">
        {INTERESTS.map((i) => (
          <button key={i} className={`chip ${interests.includes(i) ? 'selected' : ''}`} onClick={() => toggleInterest(i)}>
            {i}
          </button>
        ))}
        {customOnes.map((i) => (
          <button key={i} className="chip selected" onClick={() => toggleInterest(i)}>
            {i} ✕
          </button>
        ))}
      </div>

      <div className="custom-interest-row">
        <input
          className="field-input"
          placeholder="Add your own topic"
          value={customInterest}
          onChange={(e) => update({ customInterest: e.target.value })}
          onKeyDown={(e) => {
            // Enter adds the topic instead of continuing (unless the field is empty)
            if (e.key === 'Enter' && customInterest.trim()) {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button className="btn-ghost btn-ghost-compact" onClick={addCustom}>
          Add
        </button>
      </div>
    </OnboardingLayout>
  );
}
