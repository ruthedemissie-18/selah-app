import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../state/AppState';
import type { ProfileView } from '../types';
import { Icon, type IconName } from './Icon';

/** On/off switch. A native button, so Space and Enter toggle it; the button is a 44px tap target. */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="switch-hit"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="switch" aria-hidden="true" />
    </button>
  );
}

/** Back button + serif title for Profile sub-pages. */
export function PageHeader({ title, back = 'main' }: { title: string; back?: ProfileView }) {
  const { update } = useStore();
  return (
    <header className="page-header">
      <button className="round-back-btn" onClick={() => update({ profileView: back })} aria-label="Back">
        <Icon name="arrowleft" />
      </button>
      <h2 className="page-header-title">{title}</h2>
    </header>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="section-label">{children}</div>;
}

export function MenuCard({ children }: { children: ReactNode }) {
  return <div className="menu-card">{children}</div>;
}

interface RowProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  /** Right side, e.g. a Switch. Rows with onClick get a chevron instead. */
  trailing?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
}

/** One row in a MenuCard: optional icon tile, title and subtitle, then a switch or a chevron. */
export function MenuRow({ icon, title, subtitle, trailing, onClick, href, danger, disabled }: RowProps) {
  const body = (
    <>
      {icon && (
        <span className="menu-icon" aria-hidden="true">
          <Icon name={icon} />
        </span>
      )}
      <span className="menu-text">
        <span className="menu-title">{title}</span>
        {subtitle && <span className="menu-sub">{subtitle}</span>}
      </span>
      {trailing ?? ((onClick || href) && <Icon name="chevronright" className="menu-chevron" />)}
    </>
  );
  const className = `menu-row ${danger ? 'danger' : ''} ${disabled ? 'disabled' : ''}`;

  if (href) {
    return (
      <a className={className} href={href}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button className={className} onClick={onClick}>
        {body}
      </button>
    );
  }
  // Rows holding a switch: the switch itself is the control; the label names it for screen readers.
  return <div className={className}>{body}</div>;
}

/** A "..." button that opens a small menu; closes on outside tap or Escape. */
export function DotsMenu({ label, items }: { label: string; items: { label: string; danger?: boolean; onSelect: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="dots-wrap" ref={wrap}>
      <button
        className="dots-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="dots" />
      </button>
      {open && (
        <div className="popover-menu" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              className={item.danger ? 'danger' : ''}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
