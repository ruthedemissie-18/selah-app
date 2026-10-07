import { useState } from 'react';
import { Icon } from '../../../components/Icon';
import { BottomSheet } from '../../../components/Overlays';
import { CIRCLE_SEED } from '../../../data';
import { useStore, type AppState } from '../../../state/AppState';
import type { Circle, CircleId, CircleMessage } from '../../../types';
import { initials } from '../../../utils';

function messagesFor(s: AppState, id: CircleId): CircleMessage[] {
  return (
    s.circleMessages[id] ??
    CIRCLE_SEED[id] ?? [
      { id: `gen-${id}`, author: 'Selah Team', text: 'Welcome to the circle! Introduce yourself and share what brought you here.' },
    ]
  );
}

type InfoTab = 'overview' | 'resources';

function CircleInfoSheet({ circle, onClose }: { circle: Circle; onClose: () => void }) {
  const [tab, setTab] = useState<InfoTab>('overview');
  const [bibleOpen, setBibleOpen] = useState(false);

  return (
    <BottomSheet onClose={onClose}>
      <div className="sheet-close-row">
        <button className="back-btn" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="sheet-tabs">
        <button className={`sheet-tab ${tab === 'overview' ? 'on' : ''}`} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={`sheet-tab ${tab === 'resources' ? 'on' : ''}`} onClick={() => setTab('resources')}>
          Resources &amp; Info
        </button>
      </div>
      <div className="sheet-body">
        {tab === 'overview' ? (
          <>
            <div className="current-chapter-box">
              <span className="eyebrow">Current Chapter</span>
              <div className="current-chapter-heading">{circle.currentChapter}</div>
            </div>
            <div className="moderator-card">
              <div className="mod-avatar">{initials(circle.leader)}</div>
              <div>
                <span className="eyebrow">Moderator</span>
                <div className="mod-name">{circle.leader}</div>
                <div className="mod-bio">{circle.moderatorBio}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* --- TEAM PLACEMENT: MOVED TO THE VERY TOP (ABOVE GROUP DETAILS) --- */}
            <button
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',

                backgroundColor: '#677559',
                color: '#ffffff',
                marginBottom: '16px'
              }}
              onClick={() => setBibleOpen(true)}
            >
              📖 Open Interactive Study Bible
            </button>

            <div className="group-details-box">
              <span className="eyebrow">Group Details</span>
              <div className="gd-row">Topic: {circle.description}</div>
              <div className="gd-row">Meets: {circle.time}</div>
              <div className="gd-row">
                Members: {circle.members}/{circle.capacity}
              </div>
              <div className="gd-row">Length: {circle.length}</div>
            </div>

            <button className="btn-primary zoom-btn">
              <Icon name="video" /> Join Zoom Session
            </button>

            {/* --- YOUVERSION APPLICATION LIGHTBOX SANDBOX OVERLAY --- */}
            {bibleOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                zIndex: 99999, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{
                  background: '#fff', padding: '12px', display: 'flex',
                  justifyContent: 'space-between', borderBottom: '1px solid #ddd'
                }}>
                  <strong style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📖 YouVersion Digital Scripture Engine
                  </strong>
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 16px', background: '#e50914', border: 'none', borderRadius: '4px', color: '#fff' }}
                    onClick={() => setBibleOpen(false)}
                  >
                    Close Bible
                  </button>
                </div>
                <iframe
                  src="https://bible.com"
                  title="Interactive Bible App"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </BottomSheet>
  );
}

export function CircleChat({ circle }: { circle: Circle }) {
  const { state, update } = useStore();
  const [infoOpen, setInfoOpen] = useState(false);
  const messages = messagesFor(state, circle.id);

  const send = () => {
    const text = state.circleChatDraft.trim();
    if (!text) return;
    update((s) => ({
      circleMessages: {
        ...s.circleMessages,
        [circle.id]: [...messagesFor(s, circle.id), { id: `u${Date.now()}`, author: s.name || 'You', text }],
      },
      circleChatDraft: '',
    }));
  };

  return (
    <>
      <header className="circle-chat-header">
        <button className="circle-back-btn" onClick={() => update({ activeCircleId: null })} aria-label="Back">
          <Icon name="arrowleft" />
        </button>
        <div className="circle-chat-title-wrap">
          <div className="circle-chat-title">{circle.name}</div>
          <div className="circle-chat-sub">
            <Icon name="book" className="meta-icon" /> {circle.category} · <strong>{circle.live ? 'LIVE' : 'OPEN'}</strong>
          </div>
        </div>
        <button className="circle-info-btn" onClick={() => setInfoOpen(true)} aria-label="Circle info">
          <Icon name="info" />
        </button>
      </header>

      <div className="circle-feed">
        {messages.map((m) => (
          <div key={m.id} className="circle-msg-row">
            <div className="circle-avatar">{initials(m.author)}</div>
            <div className="circle-bubble">
              <div className="circle-bubble-author">{m.author}</div>
              <div className="circle-bubble-text">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="circle-input-row">
        <input
          className="circle-input"
          placeholder="Share a thought…"
          value={state.circleChatDraft}
          onChange={(e) => update({ circleChatDraft: e.target.value })}
        />
        <button className="circle-send-btn" onClick={send} aria-label="Send">
          <Icon name="send" />
        </button>
      </div>
      <div className="feed-spacer" />

      {infoOpen && <CircleInfoSheet circle={circle} onClose={() => setInfoOpen(false)} />}
    </>
  );
}
