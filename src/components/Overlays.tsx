import { createContext, useContext, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** The phone frame's overlay layer; sheets and modals portal into it so they cover the whole device. */
export const OverlayRootContext = createContext<HTMLElement | null>(null);

function Overlay({ children }: { children: ReactNode }) {
  const root = useContext(OverlayRootContext);
  return root ? createPortal(children, root) : null;
}

function closeOnBackdrop(onClose: () => void) {
  return (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
}

export function CloseX({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button className={`close-x ${className}`} onClick={onClick} aria-label="Close">
      ✕
    </button>
  );
}

interface SheetProps {
  onClose: () => void;
  /** Renders the standard title row with a close button. */
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ onClose, title, children }: SheetProps) {
  return (
    <Overlay>
      <div className="sheet-backdrop" onClick={closeOnBackdrop(onClose)}>
        <div className="sheet">
          {title && (
            <div className="sheet-head">
              <h3 className="sheet-title">{title}</h3>
              <CloseX onClick={onClose} />
            </div>
          )}
          {children}
        </div>
      </div>
    </Overlay>
  );
}

export function CenterModal({
  onClose,
  className = '',
  children,
}: {
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Overlay>
      <div className="center-modal-backdrop" onClick={closeOnBackdrop(onClose)}>
        <div className={`center-modal ${className}`}>{children}</div>
      </div>
    </Overlay>
  );
}

export interface ToastData {
  /** Changing the id restarts the timer, so a new toast replaces the old one. */
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** A dark message above the tab bar that disappears after 4 seconds, with an optional action like Undo. */
export function Toast({ toast, onDone }: { toast: ToastData; onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => done.current(), 4000);
    return () => clearTimeout(timer);
  }, [toast.id]);

  return (
    <Overlay>
      <div className="toast" role="status">
        <span>{toast.message}</span>
        {toast.actionLabel && (
          <button
            className="toast-action"
            onClick={() => {
              toast.onAction?.();
              done.current();
            }}
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
    </Overlay>
  );
}
