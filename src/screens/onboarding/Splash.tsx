import { useEffect, useRef, type CSSProperties } from 'react';
import { useStore } from '../../state/AppState';
import { FISH_PATH, FISH_REVEAL_STROKES, LETTERS_PATH } from './introShapes';
import './intro.css';

/*
  Selah intro (ported from selah-intro.html)

    1. Opening screen: the logo fades in. Tapping anywhere zooms the fish until it fills the screen,
       while the SELAH lettering moves into place as the big heading of the story.
    2. Story: scrolling reveals the text one line at a time; a line on the left grows as you
       scroll. NEXT buttons scroll to the following part.
    3. The line curves out into a loose loop, then "Let's create your profile" goes to sign-up.
*/

const delay = (ms: number, extra?: CSSProperties): CSSProperties => ({ transitionDelay: `${ms}ms`, ...extra });

function NextButton({ to, delayMs }: { to: string; delayMs: number }) {
  return (
    <button className="next-btn line" style={delay(delayMs)} data-next={to}>
      Next
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function Splash() {
  const { update } = useStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    const root = rootRef.current!;
    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as T;
    const scroller = $<HTMLDivElement>('.scroller');
    const opening = $<HTMLDivElement>('.opening');
    const logoBtn = $<HTMLButtonElement>('.logo-stage');
    const logoFish = $<SVGSVGElement>('.logo-fish');
    const logoLetters = $<SVGSVGElement>('.logo-letters');
    const openHint = $<HTMLDivElement>('.open-hint');
    const loginLink = $<HTMLButtonElement>('.login-link');
    const introWord = $<SVGSVGElement>('.intro-word');
    const spine = $<HTMLDivElement>('.spine');
    const lineFill = $<HTMLDivElement>('.line-fill');
    const swirlSvg = $<SVGSVGElement>('.swirl');
    const swirlPath = $<SVGPathElement>('.swirl path');
    const ctaHeading = $<HTMLHeadingElement>('.cta-heading');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let alive = true;
    let opened = false;
    let io: IntersectionObserver | null = null;
    let timers: number[] = [];
    let fillTarget = 0;
    let fillShown = 0;
    let swirlTarget = 0;
    let swirlShown = 0;
    let swirlVisible = false;
    let swirlW = 0;
    let swirlH = 0;
    let raf = 0;

    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    /* Each story part is about 82% of the screen tall */
    const sizeBeats = () => {
      root.style.setProperty('--screen-h', scroller.clientHeight + 'px');
    };

    /* ---------- 1. Opening screen ---------- */
    const playOpening = () => {
      opened = false;
      scroller.style.overflowY = 'hidden';
      scroller.scrollTop = 0;
      opening.style.display = 'flex';
      logoBtn.disabled = true;
      logoBtn.classList.remove('fade-in');
      void logoBtn.offsetWidth;
      logoBtn.classList.add('fade-in');
      later(() => {
        logoBtn.disabled = false;
        loginLink.classList.add('on');
      }, 1500);
      later(() => openHint.classList.add('on'), 1900);
    };

    /* Tap: the fish grows until it fills the screen; the word SELAH travels to the story heading */
    const openIntro = () => {
      if (opened || logoBtn.disabled) return;
      opened = true;
      opening.classList.add('go');
      root.classList.add('is-open');
      sizeBeats();

      const wRect = logoLetters.getBoundingClientRect();
      const hRect = introWord.getBoundingClientRect();
      const sc = hRect.width / wRect.width;
      const dx = hRect.left + hRect.width / 2 - (wRect.left + wRect.width / 2);
      const dy = hRect.top + hRect.height / 2 - (wRect.top + wRect.height / 2);
      const ease = 'cubic-bezier(0.65, 0, 0.35, 1)';

      const handOff = () => {
        // both copies have the same shape, size, colour and position, so swapping them is not visible
        logoLetters.style.transition = 'none';
        logoLetters.style.opacity = '0';
        introWord.classList.add('show');
      };

      if (reduceMotion) {
        logoFish.style.opacity = '0';
        handOff();
      } else {
        logoFish.style.transition = `transform 1.3s ${ease}, opacity 0.55s ease 0.75s`;
        logoFish.style.transform = 'scale(10)';
        logoFish.style.opacity = '0';
        logoLetters.style.transition = `transform 1.05s ${ease}`;
        logoLetters.style.transform = `translate(${dx}px,${dy}px) scale(${sc})`;
        later(handOff, 1080);
      }
      later(startReveals, reduceMotion ? 100 : 1050);
      later(
        () => {
          opening.style.display = 'none';
          scroller.style.overflowY = 'auto';
          updateSpine();
        },
        reduceMotion ? 200 : 1400,
      );
    };

    /* ---------- 2. Story: lines fade in as they scroll into view ---------- */
    const startReveals = () => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          });
        },
        { root: scroller, threshold: 0.5 },
      );
      root.querySelectorAll('.line, .fish-draw').forEach((el) => io!.observe(el));
      updateSpine();
    };

    const scrollToBeat = (id: string) => {
      const el = $<HTMLElement>(`[data-beat="${id}"]`);
      const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
      const centered = top - Math.max(0, (scroller.clientHeight - el.offsetHeight) / 2);
      scroller.scrollTo({ top: Math.max(0, centered), behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    /* The line on the left grows with scroll position */
    const updateSpine = () => {
      if (!opened) {
        fillTarget = 0;
        swirlTarget = 0;
        return;
      }
      const sp = spine.getBoundingClientRect();
      const c = scroller.getBoundingClientRect();
      const inset = 60;
      const marker = c.top + scroller.clientHeight * 0.55;
      const total = Math.max(1, sp.height - inset);
      const p = Math.min(1, Math.max(0, (marker - (sp.top + inset)) / total));
      fillTarget = p * total;
      swirlTarget = p >= 0.985 ? 1 : 0;
    };

    /* ---------- 3. The line curves out into a loose loop above the heading ---------- */
    // Shape traced from a design mockup. Points are in the mockup's pixels:
    // the line comes down at x=163, the screen there is 810px wide and the line ends at y=490.
    const LOOP = [
      [163, 260],
      [163, 400, 240, 435, 330, 432], // round the corner
      [450, 428, 530, 358, 615, 356], // rise to the crest
      [680, 355, 682, 410, 630, 440], // over and down into the loop
      [580, 470, 545, 440, 580, 415], // around the bottom of the loop
      [620, 388, 700, 385, 760, 420], // back out to the right
      [820, 455, 860, 490, 920, 490], // and off the edge
    ];
    const drawSwirl = () => {
      const W = Math.round(swirlSvg.getBoundingClientRect().width);
      if (!W) return;
      // the line runs from the top of the last part down to just above the heading
      const H = Math.max(150, ctaHeading.offsetTop - 16);
      if (swirlW !== W || swirlH !== H) {
        swirlSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        swirlSvg.style.height = H + 'px';
        swirlW = W;
        swirlH = H;
        const sc = W / 810;
        const x0 = 31;
        const bottom = H - 44;
        const pt = (x: number, y: number) => `${(x0 + (x - 163) * sc).toFixed(1)},${(bottom + (y - 490) * sc).toFixed(1)}`;
        const [first, ...curves] = LOOP;
        let d = `M${x0},0 L${pt(first[0], first[1])}`;
        for (const c of curves) d += ` C${pt(c[0], c[1])} ${pt(c[2], c[3])} ${pt(c[4], c[5])}`;
        swirlPath.setAttribute('d', d);
      }
      swirlPath.style.strokeDashoffset = (1 - swirlShown).toFixed(4);
      swirlPath.style.opacity = swirlShown < 0.004 ? '0' : '1';
    };
    const swirlIo = new IntersectionObserver(
      (es) => {
        swirlVisible = es[0].isIntersecting;
        if (swirlVisible) drawSwirl();
      },
      { root: scroller, rootMargin: '200px' },
    );
    swirlIo.observe(swirlSvg);

    /* One animation loop: smooths the growing line and draws the loop in */
    let lastT = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      fillShown += (fillTarget - fillShown) * (1 - Math.exp(-dt * 7));
      lineFill.style.height = fillShown.toFixed(1) + 'px';
      swirlShown += (swirlTarget - swirlShown) * (1 - Math.exp(-dt * 2.6));
      if (Math.abs(swirlTarget - swirlShown) < 0.002) swirlShown = swirlTarget;
      if (swirlVisible) drawSwirl();
      raf = requestAnimationFrame(tick);
    };

    /* ---------- Clicks ---------- */
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('.login-link')) return updateRef.current({ screen: 'auth', authMode: 'login' });
      if (target.closest('.opening')) return openIntro();
      const next = target.closest<HTMLElement>('[data-next]');
      if (next) return scrollToBeat(next.dataset.next!);
      if (target.closest('.cta-btn')) updateRef.current({ screen: 'auth', authMode: 'signup' });
    };
    /* Enter: open the intro, then step to the next part (or sign-up from the last one) */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      if ((e.target as Element | null)?.closest('button')) return; // a focused button already clicks itself
      e.preventDefault();
      if (!opened) return openIntro();
      if (opening.style.display !== 'none') return; // still zooming in
      // the part closest to the middle of the screen is the one being read
      const mid = scroller.getBoundingClientRect().top + scroller.clientHeight / 2;
      let current: HTMLElement | null = null;
      let best = Infinity;
      root.querySelectorAll<HTMLElement>('[data-beat]').forEach((beat) => {
        const r = beat.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < best) {
          best = dist;
          current = beat;
        }
      });
      const next = (current as HTMLElement | null)?.querySelector<HTMLElement>('[data-next]');
      if (next) scrollToBeat(next.dataset.next!);
      else updateRef.current({ screen: 'auth', authMode: 'signup' });
    };
    const onResize = () => {
      sizeBeats();
      updateSpine();
    };

    root.addEventListener('click', onClick);
    scroller.addEventListener('scroll', updateSpine, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);

    /* ---------- Start ---------- */
    sizeBeats();
    document.fonts?.ready.then(() => {
      if (alive) sizeBeats();
    });
    playOpening();
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      timers = [];
      io?.disconnect();
      swirlIo.disconnect();
      cancelAnimationFrame(raf);
      root.removeEventListener('click', onClick);
      scroller.removeEventListener('scroll', updateSpine);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="intro" ref={rootRef}>
      {/* Story (scrolls once the logo has been tapped) */}
      <div className="scroller">
        <div className="intro-wrap">
          <div className="spine">
            <div className="line-track" />
            <div className="line-fill" />

            {/* Part 1 — the meaning of Selah */}
            <section className="beat" data-beat="beat0">
              <h1 className="intro-heading">
                <svg className="intro-word" viewBox="72 90 222 72" role="img" aria-label="Selah">
                  <path fillRule="evenodd" d={LETTERS_PATH} />
                </svg>
              </h1>
              <div className="eyebrow line" style={delay(0, { marginTop: 12 })}>
                The Meaning
              </div>
              <p className="copy line" style={delay(220, { marginTop: 22 })}>
                A sacred pause.
              </p>
              <p className="copy line" style={delay(380)}>
                A moment to stop, breathe,
              </p>
              <p className="copy line" style={delay(540)}>
                and reflect on what is true.
              </p>
              <NextButton to="beat1" delayMs={700} />
            </section>

            {/* Part 2 — the meaning of the fish (draws itself; same shape as the logo) */}
            <section className="beat" data-beat="beat1">
              <svg className="fish-draw" viewBox="33 72 349 114" aria-hidden="true">
                <defs>
                  <mask id="introFishReveal" maskUnits="userSpaceOnUse" x="33" y="72" width="349" height="114">
                    {FISH_REVEAL_STROKES.map((d) => (
                      <path key={d} className="m" pathLength={1} d={d} />
                    ))}
                  </mask>
                </defs>
                <g mask="url(#introFishReveal)">
                  <path fillRule="evenodd" fill="#71482C" d={FISH_PATH} />
                </g>
              </svg>
              <div className="eyebrow line" style={delay(0)}>
                The ichthys.
              </div>
              <p className="copy line" style={delay(140, { marginTop: 14 })}>
                An ancient symbol believers
              </p>
              <p className="copy line" style={delay(280)}>
                once used to recognize
              </p>
              <p className="copy line" style={delay(420)}>
                one another in secret.
              </p>
              <NextButton to="beat2" delayMs={560} />
            </section>

            {/* Part 3 — the verse */}
            <section className="beat" data-beat="beat2">
              <div className="eyebrow line" style={delay(0)}>
                The Word
              </div>
              <p className="copy line" style={delay(140, { marginTop: 14 })}>
                Scripture has always called us
              </p>
              <p className="copy line" style={delay(280)}>
                toward each other, not away.
              </p>
              <div className="verse-card line" style={delay(440, { marginTop: 22 })}>
                <p className="verse-quote">
                  Let us spur one another on toward love and good deeds, not giving up meeting together, but
                  encouraging each other as we see the day approaching.
                </p>
                <p className="verse-source">— Hebrews 10:24-25</p>
              </div>
              <NextButton to="beat3" delayMs={600} />
            </section>
          </div>

          {/* Part 4 — the line curves out into a loop, then the call to action */}
          <section className="beat beat-last" data-beat="beat3">
            <svg className="swirl" aria-hidden="true">
              <path pathLength={1} d="" />
            </svg>
            <h2 className="cta-heading line" style={delay(0)}>
              Find your community.
              <br />
              Build your own.
            </h2>
            <p className="cta-sub line" style={delay(160)}>
              Share your faith, grow together, and create a space that feels like home.
            </p>
            <div className="cta-wrap line" style={delay(320)}>
              <button className="cta-btn">
                Let's create your profile
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Opening screen: logo fades in; tap anywhere to begin */}
      <div className="opening">
        <button className="logo-stage" aria-label="Open the Selah intro" disabled>
          <svg className="logo-fish" viewBox="33 72 349 114" aria-hidden="true">
            <path fillRule="evenodd" fill="#71482C" d={FISH_PATH} />
          </svg>
          <svg className="logo-letters" viewBox="72 90 222 72" aria-hidden="true">
            <path fillRule="evenodd" d={LETTERS_PATH} />
          </svg>
        </button>
        <div className="open-hint">Tap to begin</div>
        <button className="login-link">
          Have an account? <span>Log in</span>
        </button>
      </div>
    </div>
  );
}
