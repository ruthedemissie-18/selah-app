import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { groupCircles, type CircleSection, type Place } from '../../../recommend';
import { allCircles, findCircle, useStore, type AppState } from '../../../state/AppState';
import type { Circle, CircleId } from '../../../types';
import { CircleCard, JoinedCircleCard, MAX_JOINED_CIRCLES } from './CircleCards';
import { CircleChat } from './CircleChat';
import { CreateStudySheet } from './CreateStudySheet';
import { JoinConfirmModal, SwapModal } from './JoinModals';

const FILTERS = ['Local', 'Online', 'Old Testament', 'New Testament'] as const;
type Filter = (typeof FILTERS)[number];

/** The user's saved location, if they gave one in onboarding or Edit Profile. */
function placeOf(s: AppState): Place | null {
  return s.locCity || s.locCountry ? { city: s.locCity, country: s.locCountry } : null;
}

/** Orders circles by the user's onboarding answers: near them, their book, their interests, the rest. */
function sectionsFor(s: AppState, circles: Circle[]): CircleSection[] {
  return groupCircles(circles, { book: s.book, interests: s.interests, place: placeOf(s) });
}

function HeaderCard({ onPlus }: { onPlus?: () => void }) {
  return (
    <div className="bs-header-card">
      <div className="bs-header-left">
        <div className="bs-icon-badge">
          <Icon name="book" />
        </div>
        <div>
          <div className="bs-header-title">Bible Study</div>
          <div className="bs-header-sub">
            <span>Find your circle.</span>
            <span>Grow in the Word.</span>
          </div>
        </div>
      </div>

      {onPlus && (
        <div className="bs-header-right">
          <button className="plus-round-btn" onClick={onPlus} aria-label="Browse circles">
            +
          </button>
        </div>
      )}
    </div>
  );
}

type CardActions = { onJoin: (id: CircleId) => void; onLeave: (id: CircleId) => void };

function StudyHome({ onJoin, onLeave }: CardActions) {
  const { state, update } = useStore();
  const { joinedCircles: joined } = state;
  const browse = () => update({ bsView: 'browse' });

  const joinedList = joined.map((id) => findCircle(state, id)).filter((c): c is Circle => !!c);
  const all = sectionsFor(
    state,
    allCircles(state).filter((c) => !joined.includes(c.id)),
  );
  // Show the sections picked for this user (near / book / interests), 3 circles each.
  // If none fit, fall back to the first few of "More circles".
  const matched = all.filter((sec) => sec.key !== 'more');
  const shown = (matched.length ? matched : all.slice(0, 1)).map((sec) => ({ ...sec, circles: sec.circles.slice(0, 3) }));

  return (
    <>
      <HeaderCard onPlus={browse} />

      {joinedList.length > 0 && (
        <div className="bs-section your-circles">
          <div className="bs-section-top">
            <span className="eyebrow">Your Circles</span>
            <span className="groups-max-inline">
              {joinedList.length}/{MAX_JOINED_CIRCLES} joined
            </span>
          </div>
          {joinedList.map((c) => (
            <JoinedCircleCard
              key={c.id}
              circle={c}
              onOpen={() => update({ activeCircleId: c.id })}
              onFindAnother={browse}
            />
          ))}
        </div>
      )}

      {/* Recommendations are for getting started; once you're in a circle, find more via + or "Find another group". */}
      {joinedList.length === 0 &&
        shown.map((sec, i) => (
          <div key={sec.key} className={`bs-section ${i === 0 ? 'first' : ''}`}>
            {i === 0 && (
              <div className="bs-section-top">
                <span className="eyebrow">Matched to you</span>
                <span className="groups-max-inline">2 groups max</span>
              </div>
            )}
            <h2 className="bs-heading">{sec.title}</h2>
            {i === 0 && <div className="bs-subtext">Pick a circle to start growing together.</div>}
            {sec.circles.map((c) => (
              <CircleCard key={c.id} circle={c} joined={joined} onJoin={onJoin} onLeave={onLeave} />
            ))}
          </div>
        ))}
      {joinedList.length === 0 && (
        <div className="bs-section">
          <button className="find-another-link" onClick={browse}>
            See all circles
          </button>
        </div>
      )}
    </>
  );
}

function StudyBrowse({ onJoin, onLeave }: CardActions) {
  const { state, update } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const { circleSearch, circleFilters, joinedCircles } = state;

  const toggleFilter = (f: Filter) =>
    update((s) => ({
      circleFilters: s.circleFilters.includes(f)
        ? s.circleFilters.filter((x) => x !== f)
        : [...s.circleFilters, f],
    }));

  const FILTER_MATCHERS: Record<Filter, (c: Circle) => boolean> = {
    Local: (c) => c.format === 'Local',
    Online: (c) => c.format === 'Online',
    'Old Testament': (c) => c.testament === 'OT',
    'New Testament': (c) => c.testament === 'NT',
  };

  const query = circleSearch.trim().toLowerCase();
  const results = allCircles(state).filter((c) => {
    const haystack = `${c.name} ${c.category} ${c.leader} ${c.city ?? ''} ${(c.topics ?? []).join(' ')}`.toLowerCase();
    if (!haystack.includes(query)) return false;
    if (!circleFilters.length) return true;
    return circleFilters.some((f) => FILTER_MATCHERS[f as Filter]?.(c) ?? true);
  });
  // Same order as Home: local circles near them, their book, their interests, then the rest.
  const sections = sectionsFor(state, results);
  const place = placeOf(state);

  return (
    <>
      <HeaderCard />
      <div className="back-row">
        <button className="back-btn" onClick={() => update({ bsView: 'home' })}>
          <Icon name="arrowleft" /> Back
        </button>
      </div>

      <div className="bs-section browse-intro">
        <div className="eyebrow">All circles</div>
        <h2 className="bs-heading full">Browse Bible study groups</h2>
        <div className="bs-subtext">Choose a circle to begin your journey.</div>
        <button className="btn-primary create-study-btn" onClick={() => setCreateOpen(true)}>
          + Create a Study
        </button>
      </div>

      <div className="search-wrap browse-search">
        <input
          className="field-input"
          placeholder="Search by book, leader, topic or city..."
          aria-label="Search circles"
          value={circleSearch}
          onChange={(e) => update({ circleSearch: e.target.value })}
        />
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-chip-solid ${circleFilters.includes(f) ? 'on' : ''}`}
            onClick={() => toggleFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="results-count">
        {results.length} {results.length === 1 ? 'circle' : 'circles'} found
        {!place && circleFilters.includes('Local') && ' · Add your city in Profile to see studies near you'}
      </div>

      {sections.length ? (
        sections.map((sec) => (
          <div key={sec.key} className="bs-list">
            <h3 className="bs-list-heading">{sec.title}</h3>
            {sec.circles.map((c) => (
              <CircleCard key={c.id} circle={c} joined={joinedCircles} onJoin={onJoin} onLeave={onLeave} />
            ))}
          </div>
        ))
      ) : (
        <div className="empty-note">No circles match your search.</div>
      )}

      {createOpen && <CreateStudySheet onClose={() => setCreateOpen(false)} />}
    </>
  );
}

export function BibleStudy() {
  const { state, update } = useStore();
  const [confirmId, setConfirmId] = useState<CircleId | null>(null);
  const [swapId, setSwapId] = useState<CircleId | null>(null);

  const activeCircle = findCircle(state, state.activeCircleId);
  if (activeCircle) return <CircleChat circle={activeCircle} />;

  const requestJoin = (id: CircleId) => {
    if (state.joinedCircles.length >= MAX_JOINED_CIRCLES && !state.joinedCircles.includes(id)) setSwapId(id);
    else setConfirmId(id);
  };

  const confirmJoin = () => {
    if (confirmId == null) return;
    update((s) => (s.joinedCircles.includes(confirmId) ? {} : { joinedCircles: [...s.joinedCircles, confirmId] }));
    setConfirmId(null);
  };

  const swap = (dropId: CircleId) => {
    if (swapId == null) return;
    update((s) => ({ joinedCircles: [...s.joinedCircles.filter((x) => x !== dropId), swapId] }));
    setSwapId(null);
  };

  const leave = (id: CircleId) => update((s) => ({ joinedCircles: s.joinedCircles.filter((x) => x !== id) }));

  const confirmCircle = findCircle(state, confirmId);
  const swapCircle = findCircle(state, swapId);
  const Body = state.bsView === 'browse' ? StudyBrowse : StudyHome;

  return (
    <>
      <Body onJoin={requestJoin} onLeave={leave} />
      {confirmCircle && (
        <JoinConfirmModal circle={confirmCircle} onConfirm={confirmJoin} onCancel={() => setConfirmId(null)} />
      )}
      {swapCircle && (
        <SwapModal
          incoming={swapCircle}
          current={state.joinedCircles.map((id) => findCircle(state, id)).filter((c): c is Circle => !!c)}
          onSwap={swap}
          onCancel={() => setSwapId(null)}
        />
      )}
    </>
  );
}
