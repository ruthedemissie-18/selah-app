import { useState } from 'react';
import { BOOK_GROUPS } from '../data';
import { Icon } from './Icon';
import { BottomSheet } from './Overlays';

function BookSheet({ onPick, onClose }: { onPick: (book: string) => void; onClose: () => void }) {
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

/** A select-style button that opens the book list. Used in onboarding and Edit Profile. */
export function BookPicker({ value, onChange, id }: { value: string | null; onChange: (book: string) => void; id?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button id={id} type="button" className="select-field" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className={value ? '' : 'select-placeholder'}>{value || 'Select a Book'}</span>
        <Icon name="chevron" />
      </button>
      {open && (
        <BookSheet
          onPick={(book) => {
            onChange(book);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
