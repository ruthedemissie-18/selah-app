import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '../../../components/Icon';
import { BottomSheet } from '../../../components/Overlays';
import { CIRCLE_SEED } from '../../../data';
import { useStore, type AppState } from '../../../state/AppState';
import type { Circle, CircleId, CircleMessage } from '../../../types';
import { clockTime, initials } from '../../../utils';

function messagesFor(s: AppState, id: CircleId): CircleMessage[] {
  return (
    s.circleMessages[id] ??
    CIRCLE_SEED[id] ?? [
      { id: `gen-${id}`, author: 'Selah Team', text: 'Welcome to the circle! Introduce yourself and share what brought you here.' },
    ]
  );
}

/** Consecutive messages from one sender this close together share a bubble group. */
const GROUP_GAP_MS = 5 * 60 * 1000;

function dayKey(m: CircleMessage): string {
  return new Date(m.sentAt ?? Date.now()).toDateString();
}

function dayLabel(m: CircleMessage): string {
  const day = new Date(m.sentAt ?? Date.now());
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return 'Today';
  if (day.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function sameGroup(a: CircleMessage, b: CircleMessage): boolean {
  if (a.author !== b.author || !!a.mine !== !!b.mine || dayKey(a) !== dayKey(b)) return false;
  // Seed messages have no time, so they group by sender alone.
  return a.sentAt == null || b.sentAt == null || b.sentAt - a.sentAt <= GROUP_GAP_MS;
}

function titleCase(text: string): string {
  return text.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());
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
  const listRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const messages = messagesFor(state, circle.id);
  const draft = state.circleChatDraft.trim();

  const scrollToBottom = () => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  };

  // Newest messages are at the bottom: start there, and follow new ones as they arrive.
  useLayoutEffect(() => {
    scrollToBottom();
    atBottom.current = true;
  }, [messages.length]);

  // Content can grow after layout (web fonts, emoji); stay pinned unless the user scrolled up to read.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => atBottom.current && scrollToBottom());
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const list = listRef.current;
    if (list) atBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    update((s) => ({
      circleMessages: {
        ...s.circleMessages,
        [circle.id]: [
          ...messagesFor(s, circle.id),
          { id: `u${Date.now()}`, author: s.name || 'You', text: draft, sentAt: Date.now(), mine: true },
        ],
      },
      circleChatDraft: '',
    }));
  };

  return (
    <div className="chat-screen">
      <header className="circle-chat-header">
        <button className="circle-back-btn" onClick={() => update({ activeCircleId: null })} aria-label="Back">
          <Icon name="arrowleft" />
        </button>
        <div className="circle-chat-title-wrap">
          <div className="circle-chat-title">{circle.name}</div>
          <div className="circle-chat-sub">
            {titleCase(circle.category)} · <strong>{circle.members} members</strong>
          </div>
        </div>
        <button className="circle-info-btn" onClick={() => setInfoOpen(true)} aria-label="Circle info">
          <Icon name="info" />
        </button>
      </header>

      <div className="chat-list" ref={listRef} onScroll={onScroll} role="log" aria-live="polite">
        {/* margin-top: auto keeps a short conversation at the bottom, next to the input */}
        <div className="chat-list-inner" ref={innerRef}>
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || dayKey(prev) !== dayKey(m);
            const first = newDay || !sameGroup(prev, m);
            const last = !next || dayKey(next) !== dayKey(m) || !sameGroup(m, next);
            const side = m.mine ? 'mine' : 'theirs';
            return (
              <div key={m.id}>
                {newDay && (
                  <div className="chat-day">
                    <span>{dayLabel(m)}</span>
                  </div>
                )}
                <div className={`chat-row ${side} ${first ? 'first' : ''} ${last ? 'last' : ''}`}>
                  {!m.mine &&
                    (last ? (
                      <div className="chat-avatar" aria-hidden="true">
                        {initials(m.author)}
                      </div>
                    ) : (
                      <div className="chat-avatar-spacer" />
                    ))}
                  <div className="chat-bubble">
                    {!m.mine && first && <div className="chat-author">{m.author}</div>}
                    <div className="chat-text">{m.text}</div>
                  </div>
                </div>
                {m.mine && last && m.sentAt != null && (
                  <div className="chat-time">{clockTime(new Date(m.sentAt))}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form className="chat-input-bar" onSubmit={send}>
        <input
          className="chat-input"
          placeholder="Message"
          aria-label="Message"
          value={state.circleChatDraft}
          onChange={(e) => update({ circleChatDraft: e.target.value })}
        />
        <button type="submit" className="chat-send-btn" disabled={!draft} aria-label="Send">
          <Icon name="arrowup" />
        </button>
      </form>

      {infoOpen && <CircleInfoSheet circle={circle} onClose={() => setInfoOpen(false)} />}
    </div>
  );
}
