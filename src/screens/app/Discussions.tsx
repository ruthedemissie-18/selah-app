import { Icon } from '../../components/Icon';
import { DISCUSSION_SEED, PINNED_TOPICS } from '../../data';
import { useStore, type AppState } from '../../state/AppState';
import type { DiscussionMessage } from '../../types';
import { clockTime } from '../../utils';

const FALLBACK_TOPICS = ['Prayer & Worship', 'Faith Doubts'];

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

const topicLabel = (topic: string) => `# ${PINNED_TOPICS.includes(topic) ? '📌 ' : ''}${topic}`;

export function Discussions() {
  const { state, update } = useStore();
  const { selectedDiscussion: topic, discussionSearch, discussionDraft, amenedIds } = state;

  const topics = [...new Set([...PINNED_TOPICS, ...(state.interests.length ? state.interests : FALLBACK_TOPICS)])];
  const visibleTopics = topics.filter((t) => t.toLowerCase().includes(discussionSearch.toLowerCase()));
  const messages = messagesFor(state, topic);
  const category = DISCUSSION_SEED[topic]?.category ?? 'Personal';

  const send = () => {
    const text = discussionDraft.trim();
    if (!text) return;
    update((s) => {
      const msg: DiscussionMessage = { id: `u${Date.now()}`, author: s.name || 'You', time: clockTime(), text, amens: 0 };
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
    <>
      <header className="app-topbar">
        <div>
          <h2 className="page-title">Discussion Hub</h2>
          <div className="welcome-sub">Moderated fellowship &amp; discussion spaces</div>
        </div>
        <span className="protected-pill">
          <Icon name="shield" /> PROTECTED
        </span>
      </header>

      <div className="search-wrap spaced">
        <input
          className="field-input"
          placeholder="Search discussion groups…"
          value={discussionSearch}
          onChange={(e) => update({ discussionSearch: e.target.value })}
        />
      </div>

      <div className="topic-scroll">
        {visibleTopics.length ? (
          visibleTopics.map((t) => (
            <button
              key={t}
              className={`topic-chip ${t === topic ? 'active' : ''}`}
              onClick={() => update({ selectedDiscussion: t })}
            >
              {topicLabel(t)}
            </button>
          ))
        ) : (
          <div className="empty-note">No discussions match your search.</div>
        )}
      </div>

      <div className="topic-header-card">
        <div>
          <div className="topic-header-title">{topicLabel(topic)}</div>
          <div className="topic-header-sub">Category: {category}</div>
        </div>
        <span className="active-badge">Active</span>
      </div>

      <div className="chat-feed">
        {messages.map((m) => (
          <div key={m.id} className="chat-msg">
            <div className="chat-msg-top">
              <span className="chat-msg-author">{m.author}</span>
              <span className="chat-msg-time">{m.time}</span>
            </div>
            <div className="chat-msg-text">{m.text}</div>
            <div className="chat-msg-foot">
              <button className={`amen-btn ${amenedIds.includes(m.id) ? 'active' : ''}`} onClick={() => toggleAmen(m.id)}>
                👍 {m.amens} Amen
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={`Message #${topic}…`}
          value={discussionDraft}
          onChange={(e) => update({ discussionDraft: e.target.value })}
        />
        <button className="send-btn" onClick={send}>
          <Icon name="send" /> Send
        </button>
      </div>
      <div className="feed-spacer" />
    </>
  );
}
