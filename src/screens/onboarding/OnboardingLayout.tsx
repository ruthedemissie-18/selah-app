import { useEffect, useRef, type ReactNode } from 'react';
import { ONBOARD_STEPS } from '../../data';
import { useStore } from '../../state/AppState';
import type { OnboardingScreen } from '../../types';

function StepDots({ current }: { current: OnboardingScreen }) {
  const { update } = useStore();
  const currentIndex = ONBOARD_STEPS.indexOf(current);

  return (
    <div className="step-dots">
      {ONBOARD_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        // The account step locks once you've moved past it.
        const canRevisit = reached && (i !== 0 || currentIndex === 0);
        return (
          <button
            key={step}
            className="step-dot-btn"
            disabled={!canRevisit}
            onClick={() => update({ screen: step })}
            aria-label={`Step ${i + 1}`}
          >
            <span className={`step-dot-bar ${reached ? 'done' : ''}`} />
          </button>
        );
      })}
    </div>
  );
}

interface Props {
  step: OnboardingScreen;
  centered?: boolean;
  footer: ReactNode;
  children: ReactNode;
}

export function OnboardingLayout({ step, centered, footer, children }: Props) {
  const footRef = useRef<HTMLDivElement>(null);

  // Enter presses the main footer button (Continue / Finish), unless focus is on another button,
  // a field already handled Enter itself, or a sheet/modal is open on top.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat || e.isComposing || e.defaultPrevented) return;
      const target = e.target as Element | null;
      if (target?.closest('button, a, textarea, select')) return;
      if (document.querySelector('.sheet-backdrop, .center-modal-backdrop')) return;
      const primary = footRef.current?.querySelector<HTMLButtonElement>('.btn-primary');
      if (!primary || primary.disabled) return;
      e.preventDefault();
      primary.click();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="onboard-wrap">
      <div className="onboard-top">
        <StepDots current={step} />
      </div>
      <div className={`onboard-body ${centered ? 'center-content' : ''}`}>{children}</div>
      <div className="onboard-foot" ref={footRef}>
        {footer}
      </div>
    </div>
  );
}

export function StepHeading({ title, note, spaced }: { title: string; note: string; spaced?: boolean }) {
  return (
    <>
      <h2 className={`step-title ${spaced ? 'spaced' : ''}`}>{title}</h2>
      <p className="section-note step-note">{note}</p>
    </>
  );
}
