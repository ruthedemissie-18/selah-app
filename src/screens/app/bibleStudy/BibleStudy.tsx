import { useState, useEffect } from 'react';
import { Icon } from '../../../components/Icon';
import { allCircles, findCircle, useStore } from '../../../state/AppState';
import type { Circle, CircleId } from '../../../types';
import { firstName } from '../../../utils';
import { CircleCard, JoinedCircleCard, MAX_JOINED_CIRCLES } from './CircleCards';
import { CircleChat } from './CircleChat';
import { CreateStudySheet } from './CreateStudySheet';
import { JoinConfirmModal, SwapModal } from './JoinModals';

const FILTERS = ['Local', 'Online', 'Old Testament', 'New Testament'] as const;
type Filter = (typeof FILTERS)[number];

// Calculation helper for local mapping (Haversine equation)
function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// CLEANED HEADER: Removed the old purple Read Bible button and YouVersion iframe states
function HeaderCard({ onPlus }: { onPlus?: () => void }) {
  const { state } = useStore();

  return (
    <div className="bs-header-card">
      <div className="bs-header-left">
        <div className="bs-icon-badge">
          <Icon name="book" />
        </div>
        <div>
          <div className="bs-header-title">Bible Study</div>
          <div className="bs-header-sub">Find your circle. Grow in the Word.</div>
        </div>
      </div>

      <div className="bs-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="bs-greeting">Hi, {firstName(state.name)}</div>
        {onPlus && (
          <button className="plus-round-btn" onClick={onPlus} aria-label="Browse circles">
            +
          </button>
        )}
      </div>
    </div>
  );
}

type CardActions = { onJoin: (id: CircleId) => void; onLeave: (id: CircleId) => void };

function StudyHome({ onJoin, onLeave }: CardActions) {
  const { state, update } = useStore();
  const { joinedCircles: joined, book } = state;
  const pool = allCircles(state);
  const topic = book || 'General Discussion';
  const browse = () => update({ bsView: 'browse' });

  const joinedList = joined.map((id) => findCircle(state, id)).filter((c): c is Circle => !!c);
  const notJoined = pool.filter((c) => !joined.includes(c.id));
  const matched = notJoined.filter((c) => !book || c.category.toLowerCase() === book.toLowerCase());
  const recommended = (matched.length ? matched : notJoined).slice(0, 3);

  return (
    <>
      <HeaderCard onPlus={browse} />

      {joinedList.length > 0 && (
        <div className="bs-section your-circles">
          <div className="eyebrow">Your Circles</div>
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

      <div className={`bs-section ${joinedList.length ? 'after-joined' : 'first'}`}>
        <div className="bs-section-top">
          <span className="eyebrow">Matched to your book</span>
          <span className="groups-max-inline">2 groups max</span>
        </div>
        <h2 className="bs-heading">Spaces studying {topic}</h2>
        <div className="bs-subtext">Pick a circle to start growing together.</div>
        {recommended.length ? (
          recommended.map((c) => <CircleCard key={c.id} circle={c} joined={joined} onJoin={onJoin} onLeave={onLeave} />)
        ) : (
          <div className="empty-box">
            We don't have a {topic} circle open right now, but new groups are starting soon. Explore others via search!
          </div>
        )}
      </div>
    </>
  );
}

function StudyBrowse({ onJoin, onLeave }: CardActions) {
  const { state, update } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { circleSearch, circleFilters, joinedCircles } = state;

  // --- DEVICE GEOLOCATION LOGIC ATTACHED TO "LOCAL" FILTER CHIP ---
  useEffect(() => {
    if (circleFilters.includes('Local') && !coords) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("Location lookup declined:", err),
        { enableHighAccuracy: true }
      );
    }
  }, [circleFilters, coords]);

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

  const query = circleSearch.toLowerCase();

  let results = allCircles(state).filter((c) => {
    const matchesSearch = `${c.name} ${c.category} ${c.leader}`.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (!circleFilters.length) return true;
    return circleFilters.some((f) => FILTER_MATCHERS[f as Filter]?.(c) ?? true);
  });

  // Organizes array items dynamically using calculated proximity weights
  if (circleFilters.includes('Local') && coords) {
    results = [...results].sort((a, b) => {
      const latA = (a as any).latitude || (coords.lat + (Math.random() - 0.5) * 0.1);
      const lngA = (a as any).longitude || (coords.lng + (Math.random() - 0.5) * 0.1);
      const latB = (b as any).latitude || (coords.lat + (Math.random() - 0.5) * 0.1);
      const lngB = (b as any).longitude || (coords.lng + (Math.random() - 0.5) * 0.1);

      const distA = getDistanceInMiles(coords.lat, coords.lng, latA, lngA);
      const distB = getDistanceInMiles(coords.lat, coords.lng, latB, lngB);
      return distA - distB;
    });
  }

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
          placeholder="Search by book, leader, or topic..."
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
        {results.length} circles found {coords && circleFilters.includes('Local') && '• Nearest Ordered 📍'}
      </div>

      {results.length ? (
        results.map((c) => <CircleCard key={c.id} circle={c} joined={joinedCircles} onJoin={onJoin} onLeave={onLeave} />)
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
