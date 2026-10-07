import { Icon } from '../../../components/Icon';
import type { Circle, CircleId } from '../../../types';

export const MAX_JOINED_CIRCLES = 2;
export const MAX_CIRCLE_MEMBERS = 15;

function StatusPill({ circle, full }: { circle: Circle; full: boolean }) {
  const [variant, label] = circle.live ? ['live', 'LIVE'] : full ? ['full', 'FULL'] : ['', 'OPEN'];
  return (
    <span className={`bs-status-pill ${variant}`}>
      <span className="bs-status-dot" />
      {label}
    </span>
  );
}

/** "Wednesdays, 7:00 PM" → "Wed, 7:00 PM" so leader and time fit on one line. */
function shortTime(time: string): string {
  return time.replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*,/, '$1,');
}

function CircleMeta({ circle }: { circle: Circle }) {
  return (
    <div className="bs-circle-meta">
      <span className="bs-meta-item">
        <Icon name="people" className="meta-icon" />
        Led by {circle.leader}
      </span>
      <span className="bs-meta-item">
        <Icon name="clock" className="meta-icon" />
        {shortTime(circle.time)}
      </span>
    </div>
  );
}

function Capacity({ circle }: { circle: Circle }) {
  const pct = Math.min(100, Math.round((circle.members / circle.capacity) * 100));
  return (
    <>
      <div className="bs-progress-track">
        <div className="bs-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="bs-members-label">
        {circle.members}/{circle.capacity} members
      </div>
    </>
  );
}

interface CircleCardProps {
  circle: Circle;
  joined: CircleId[];
  onJoin: (id: CircleId) => void;
  onLeave: (id: CircleId) => void;
}

/** A circle the user can join (or leave, if already a member). */
export function CircleCard({ circle, joined, onJoin, onLeave }: CircleCardProps) {
  const isJoined = joined.includes(circle.id);
  const isFull = !isJoined && circle.members >= circle.capacity;
  const atLimit = !isJoined && joined.length >= MAX_JOINED_CIRCLES;

  let action = (
    <button className="btn-primary bs-join-btn" onClick={() => onJoin(circle.id)}>
      {atLimit ? 'Swap to join' : 'Join this circle'}
    </button>
  );
  if (isJoined) {
    action = (
      <button className="btn-primary bs-join-btn joined" onClick={() => onLeave(circle.id)}>
        Joined · Leave
      </button>
    );
  } else if (isFull) {
    action = (
      <button className="btn-primary bs-join-btn" disabled>
        Study is full
      </button>
    );
  }

  return (
    <div className="bs-circle-card">
      <div className="bs-circle-top">
        <span className="eyebrow">{circle.category}</span>
        <StatusPill circle={circle} full={isFull} />
      </div>
      <div className="bs-circle-title">{circle.name}</div>
      <CircleMeta circle={circle} />
      <Capacity circle={circle} />
      {action}
    </div>
  );
}

interface JoinedCircleCardProps {
  circle: Circle;
  onOpen: () => void;
  onFindAnother: () => void;
}

/** A circle the user already belongs to, shown under "Your Circles". */
export function JoinedCircleCard({ circle, onOpen, onFindAnother }: JoinedCircleCardProps) {
  return (
    <div className="bs-circle-card">
      <div className="bs-circle-top">
        <span className="eyebrow">{circle.category}</span>
        <StatusPill circle={circle} full={false} />
      </div>
      <div className="bs-circle-title">{circle.name}</div>
      <CircleMeta circle={circle} />
      <Capacity circle={circle} />
      <button className="btn-primary bs-join-btn" onClick={onOpen}>
        Open Circle
      </button>
      <button className="find-another-link" onClick={onFindAnother}>
        Find another group
      </button>
    </div>
  );
}
