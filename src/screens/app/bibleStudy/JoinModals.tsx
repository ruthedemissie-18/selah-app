import { Icon } from '../../../components/Icon';
import { CenterModal, CloseX } from '../../../components/Overlays';
import type { Circle, CircleId } from '../../../types';

export function JoinConfirmModal({
  circle,
  onConfirm,
  onCancel,
}: {
  circle: Circle;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <CenterModal onClose={onCancel}>
      <span className="eyebrow">Join Circle</span>
      <h2 className="modal-title">Join this circle?</h2>
      <div className="center-modal-sub">{circle.name}</div>
      <div className="center-modal-text">You'll grow alongside {circle.members} others.</div>
      <div className="center-modal-actions">
        <button className="modal-btn-ghost" onClick={onCancel}>
          Not yet
        </button>
        <button className="modal-btn-solid" onClick={onConfirm}>
          Yes, join
        </button>
      </div>
    </CenterModal>
  );
}

export function SwapModal({
  incoming,
  current,
  onSwap,
  onCancel,
}: {
  incoming: Circle;
  current: Circle[];
  onSwap: (dropId: CircleId) => void;
  onCancel: () => void;
}) {
  return (
    <CenterModal onClose={onCancel} className="swap-modal">
      <div className="swap-modal-head">
        <span className="eyebrow">Drop to swap</span>
        <CloseX onClick={onCancel} />
      </div>
      <h2 className="modal-title tight">Swap an Active Circle</h2>
      <p className="center-modal-text">
        You can be part of 2 circles at a time. Choose one to drop to make room for <strong>{incoming.name}</strong>.
      </p>
      {current.map((c) => (
        <div key={c.id} className="swap-row">
          <div>
            <span className="eyebrow">{c.category}</span>
            <div className="swap-row-title">{c.name}</div>
            <div className="swap-row-sub">
              {c.members}/{c.capacity} members
            </div>
          </div>
          <button className="swap-btn" onClick={() => onSwap(c.id)} aria-label={`Drop ${c.name}`}>
            <Icon name="swap" />
          </button>
        </div>
      ))}
      <button className="modal-btn-cancel-full" onClick={onCancel}>
        Cancel
      </button>
    </CenterModal>
  );
}
