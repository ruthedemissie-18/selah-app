import { InterestPicker } from '../../components/InterestPicker';
import { useStore } from '../../state/AppState';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

export function Interests() {
  const { state, update } = useStore();
  const picked = state.interests.length > 0;

  return (
    <OnboardingLayout
      step="interests"
      footer={
        <button className="btn-primary" onClick={() => update({ screen: 'struggles' })} disabled={!picked}>
          {picked ? 'Continue' : 'Pick at least one'}
        </button>
      }
    >
      <StepHeading
        spaced
        title="What draws you in?"
        note="We'll place you in discussion spaces around these topics. Pick a few, or write your own."
      />
      <InterestPicker value={state.interests} onChange={(interests) => update({ interests })} />
    </OnboardingLayout>
  );
}
