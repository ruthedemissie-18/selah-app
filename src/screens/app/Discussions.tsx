import { useState, type FormEvent } from 'react';
import { sameGroup, useStickToBottom } from '../../components/chat';
import { Icon } from '../../components/Icon';
import { DISCUSSION_SEED, INTERESTS } from '../../data';
import { orderChannels } from '../../recommend';
import { useStore, type AppState } from '../../state/AppState';
import type { DiscussionMessage } from '../../types';
import { clockTime, initials } from '../../utils';

function messagesFor(s: AppState, topic: string): DiscussionMessage[] {
  return (
    s.discussionMessages[topic] ??
    DISCUSSION_SEED[topic]?.messages ?? [
      {
        id: `gen-${topic}`,
        author: 'Selah Team',
        time: '—',
        text: `Welcome to the ${topic} discussion! Share your thoughts and encourage one another here.`,
        amens: 5,
      },
    ]
  );
}

/** Seed times are written "01:52 PM"; show them like the rest of the app, "1:52 PM". */
const displayTime = (time: string) => time.replace(/^0(\d)/, '$1');

export function Discussions() {
  const { state, update } = useStore();
  const { selectedDiscussion: topic, discussionSearch, discussionDraft, amenedIds } = state;
  const [searchOpen, setSearchOpen] = useState(discussionSearch !== '');

  const query = discussionSearch.trim().toLowerCase();
  // The user's interests come first (from onboarding / Edit Profile), then pinned and other channels.
  const topics = orderChannels(state.interests, INTERESTS);
  const visibleTopics = topics.filter((t) => t.toLowerCase().includes(query));
  const messages = messagesFor(state, topic).filter(
    (m) => !query || `${m.author} ${m.text}`.toLowerCase().includes(query),
  );
  const draft = discussionDraft.trim();
  const { listRef, innerRef, onScroll } = useStickToBottom(`${topic}:${messages.length}`);

  const closeSearch = () => {
    setSearchOpen(false);
    update({ discussionSearch: '' });
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    update((s) => {
      const msg: DiscussionMessage = {
        id: `u${Date.now()}`,
        author: s.name || 'You',
        time: clockTime(),
        text: draft,
        amens: 0,
        sentAt: Date.now(),
        mine: true,
      };
      return {
        discussionMessages: { ...s.discussionMessages, [topic]: [...messagesFor(s, topic), msg] },
        discussionDraft: '',
      };
    });
  };

  const toggleAmen = (id: string) =>
    update((s) => {
      const already = s.amenedIds.includes(id);
      const updated = messagesFor(s, topic).map((m) => (m.id === id ? { ...m, amens: m.amens + (already ? -1 : 1) } : m));
      return {
        discussionMessages: { ...s.discussionMessages, [topic]: updated },
        amenedIds: already ? s.amenedIds.filter((x) => x !== id) : [...s.amenedIds, id],
      };
    });

  return (
    <div className="chat-screen">
      <div className="hub-top">
        <header className="hub-title-row">
          <div>
            <h2 className="hub-title">Discussion Hub</h2>
            <div className="hub-sub">Moderated fellowship</div>
          </div>
          <div className="hub-actions">
            <span className="protected-pill">
              <Icon name="check" /> PROTECTED
            </span>
            <button
              className="hub-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search discussions"
              aria-expanded={searchOpen}
            >
              <Icon name="search" />
            </button>
          </div>
        </header>

        {searchOpen && (
          <div className="hub-search-row">
            <input
              autoFocus
              className="hub-search-input"
              placeholder="Search channels and messages"
              aria-label="Search channels and messages"
              value={discussionSearch}
              onChange={(e) => update({ discussionSearch: e.target.value })}
              onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            />
            <button className="hub-search-cancel" onClick={closeSearch}>
              Cancel
            </button>
          </div>
        )}

        <div className="topic-scroll">
          {visibleTopics.length ? (
            visibleTopics.map((t) => (
              <button
                key={t}
                className={`topic-chip ${t === topic ? 'active' : ''}`}
                onClick={() => update({ selectedDiscussion: t })}
              >
                # {t}
              </button>
            ))
          ) : (
            <div className="topic-empty">No channels match your search.</div>
          )}
        </div>

        <div className="hub-channel-line">
          <span className="hub-channel-name"># {topic}</span>
          <span className="active-badge">Active</span>
        </div>
      </div>

      <div className="chat-list" ref={listRef} onScroll={onScroll} role="log" aria-live="polite">
        <div className="chat-list-inner" ref={innerRef}>
          {messages.length === 0 && <div className="empty-note">No messages match your search.</div>}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const first = !prev || !sameGroup(prev, m);
            const last = !next || !sameGroup(m, next);
            const amened = amenedIds.includes(m.id);

            if (m.mine) {
              return (
                <div key={m.id}>
                  <div className={`chat-row mine hub-row ${first ? 'first' : ''}`}>
                    <div className="chat-bubble">
                      <div className="chat-text">{m.text}</div>
                    </div>
                  </div>
                  {last && <div className="chat-time">{displayTime(m.time)}</div>}
                </div>
              );
            }

            return (
              <div key={m.id} className={`chat-row theirs hub-row ${first ? 'first' : ''}`}>
                {last ? (
                  <div className="chat-avatar" aria-hidden="true">
                    {initials(m.author)}
                  </div>
                ) : (
                  <div className="chat-avatar-spacer" />
                )}
                <div className="hub-msg-col">
                  <div className="chat-bubble">
                    {first && (
                      <div className="hub-msg-head">
                        <span className="chat-author">{m.author}</span>
                        <span className="hub-msg-time">{displayTime(m.time)}</span>
                      </div>
                    )}
                    <div className="chat-text">{m.text}</div>
                  </div>
                  <button
                    className={`amen-pill ${amened ? 'active' : ''}`}
                    onClick={() => toggleAmen(m.id)}
                    aria-pressed={amened}
                  >
                    <span aria-hidden="true">🙏</span> {m.amens} Amen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form className="chat-input-bar floating" onSubmit={send}>
        <input
          className="chat-input"
          placeholder={`Message #${topic}`}
          aria-label={`Message #${topic}`}
          value={discussionDraft}
          onChange={(e) => update({ discussionDraft: e.target.value })}
        />
        <button type="submit" className="chat-send-btn" disabled={!draft} aria-label="Send">
          <Icon name="arrowup" />
        </button>
      </form>
    </div>
  );
}
