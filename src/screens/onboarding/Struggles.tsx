import { STRUGGLES } from '../../data';
import { firstChannel, useStore } from '../../state/AppState';
import { toggle } from '../../utils';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

export function Struggles() {
  const { state, update } = useStore();
  // Finish marks onboarding done on the account, so next time it opens straight to Home.
  const finish = (struggles?: string[]) =>
    update((s) => ({
      ...(struggles && { struggles }),
      onboarded: true,
      selectedDiscussion: firstChannel(s.interests),
      screen: 'transition',
    }));

  return (
    <OnboardingLayout
      step="struggles"
      footer={
        <button className="btn-primary" onClick={() => finish()}>
          Finish
        </button>
      }
    >
      <StepHeading
        spaced
        title="You're not alone in this"
        note="Believers wrestle with anxiety, doubt, and loneliness too. Share what's on your heart so your community can support you."
      />

      <div className="chip-wrap">
        {STRUGGLES.map((s) => (
          <button
            key={s}
            className={`chip ${state.struggles.includes(s) ? 'selected' : ''}`}
            onClick={() => update((prev) => ({ struggles: toggle(prev.struggles, s) }))}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="skip-row">
        <button className="btn-link" onClick={() => finish([])}>
          Prefer not to say
        </button>
      </div>
    </OnboardingLayout>
  );
}
