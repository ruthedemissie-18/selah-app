import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { BottomSheet } from '../../components/Overlays';
import { BOOK_GROUPS, GENERAL_FELLOWSHIP } from '../../data';
import { useStore } from '../../state/AppState';
import { OnboardingLayout, StepHeading } from './OnboardingLayout';

function BookPicker({ onPick, onClose }: { onPick: (book: string) => void; onClose: () => void }) {
  return (
    <BottomSheet title="Select a Book" onClose={onClose}>
      <div className="sheet-body book-list">
        {BOOK_GROUPS.map((group) => (
          <div key={group.label ?? 'general'}>
            {group.label && <div className="book-group-label">{group.label}</div>}
            {group.items.map((book) => (
              <button key={book} className="book-row" onClick={() => onPick(book)}>
                {book}
              </button>
            ))}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

export function Book() {
  const { state, update } = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const pick = (book: string) => {
    update({ book: book === GENERAL_FELLOWSHIP ? null : book });
    setPickerOpen(false);
  };

  return (
    <OnboardingLayout
      step="book"
      centered
      footer={
        <button className="btn-primary" onClick={() => update({ screen: 'interests' })}>
          Continue
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

      <label className="field-label-caps">What book are you studying?</label>
      <button className="select-field" onClick={() => setPickerOpen(true)}>
        <span>{state.book || 'Select a Book'}</span>
        <Icon name="chevron" />
      </button>

      {pickerOpen && <BookPicker onPick={pick} onClose={() => setPickerOpen(false)} />}
    </OnboardingLayout>
  );
}
