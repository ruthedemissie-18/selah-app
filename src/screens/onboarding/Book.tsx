import { BookPicker } from '../../components/BookPicker';
import { Icon } from '../../components/Icon';
import { useStore } from '../../state/AppState';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

export function Book() {
  const { state, update } = useStore();

  return (
    <OnboardingLayout
      step="book"
      centered
      footer={
        // A book is required; "Just browsing / General Fellowship" counts as a pick.
        <button className="btn-primary" onClick={() => update({ screen: 'interests' })} disabled={!state.book}>
          {state.book ? 'Continue' : 'Pick a book to continue'}
        </button>
      }
    >
      <StepHeading title="Bible Study Matching" note="Select what you are currently reading or studying." />

      <div className="info-box">
        <Icon name="info" />
        <span>
          <strong>Why we ask this:</strong> so we can seamlessly pair you with an intimate, peer-led Bible study group
          covering that specific book.
        </span>
      </div>

      <label className="field-label-caps" htmlFor="onboard-book">
        What book are you studying?
      </label>
      <BookPicker id="onboard-book" value={state.book} onChange={(book) => update({ book })} />
    </OnboardingLayout>
  );
}
