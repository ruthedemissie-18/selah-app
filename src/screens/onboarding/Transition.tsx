import { useEffect, useState } from 'react';
import { TRANSITION_PHRASES } from '../../data';
import { useStore } from '../../state/AppState';

const PHRASE_INTERVAL_MS = 1000;
const TOTAL_DURATION_MS = 3300;

export function Transition() {
  const { update } = useStore();
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const ticker = setInterval(
      () => setPhraseIndex((i) => Math.min(i + 1, TRANSITION_PHRASES.length - 1)),
      PHRASE_INTERVAL_MS,
    );
    const done = setTimeout(() => update({ screen: 'app', tab: 'home' }), TOTAL_DURATION_MS);
    return () => {
      clearInterval(ticker);
      clearTimeout(done);
    };
  }, [update]);

  return (
    <div className="pad center-col">
      <div className="spinner" />
      <div className="transition-phrase">{TRANSITION_PHRASES[phraseIndex]}</div>
      <p className="transition-sub">Preparing your digital table</p>
    </div>
  );
}
