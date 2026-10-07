import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { Logo } from '../../components/Logo';
import { PrayerRequestSheet } from '../../components/PrayerRequestSheet';
import { SCRIPTURE_OF_DAY, STRUGGLES } from '../../data';
import { useStore } from '../../state/AppState';
import { firstName } from '../../utils';

// Two struggles from the onboarding list, changing each day (the same for everyone)
function struggleOfTheDay() {
  const list = STRUGGLES.filter((s) => s !== 'Other');
  const now = new Date();
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000); // changes at local midnight
  const first = list[day % list.length];
  const second = list[(day + 3) % list.length];
  return [first.toLowerCase(), second.toLowerCase()];
}

export function Home() {
  const { state, update } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { wallPrayer: wall, streak } = state;
  const [struggleA, struggleB] = struggleOfTheDay();

  // --- 🪐 CURATED & DATE-SHIFTED YOUVERSION API HOOK ---
  const [liveVerseText, setLiveVerseText] = useState(() => {
    return localStorage.getItem('cached_yv_verse_text') || SCRIPTURE_OF_DAY.text; // Instant render, 0 loading screen!
  });

  const [liveVerseRef, setLiveVerseRef] = useState(() => {
    return localStorage.getItem('cached_yv_verse_ref') || SCRIPTURE_OF_DAY.ref;
  });

  useEffect(() => {
    const todayKey = new Date().toDateString(); // Keeps track of calendar shifts
    const lastSavedDate = localStorage.getItem('cached_yv_verse_date');

    // Only run if 24 hours have passed and it's a new day
    if (lastSavedDate !== todayKey) {
      const fetchIndependentCuratedVerse = async () => {
        try {
          // Step 1: Pull the complete 365-day hand-picked verse reference database map from YouVersion
          const calendarResponse = await fetch('https://api.youversion.com/v1/verse_of_the_days', {
            headers: { 'X-YVP-App-Key': import.meta.env.VITE_YOUVERSION_API_KEY }
          });
          const calendarData = await calendarResponse.json();

          // The API wraps the list: { data: [{ day, passage_id }, ...] }
          if (calendarData && Array.isArray(calendarData.data)) {
            // Step 2: Grab day number of the year (1-365) and shift it by a fixed offset (+120 days)
            // This ensures we choose a totally different, non-matching curated verse from their index map
            const currentDayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
            const shiftedIndex = (currentDayOfYear + 120) % calendarData.data.length;
            const independentPassageId = calendarData.data[shiftedIndex].passage_id; // e.g. "PHP.4.6"

            // Step 3: Fetch the clean textual layout block of that chosen curated scripture reference
            const textResponse = await fetch(`https://api.youversion.com/v1/bibles/3034/passages/${independentPassageId}?format=text`, {
              headers: { 'X-YVP-App-Key': import.meta.env.VITE_YOUVERSION_API_KEY }
            });
            const textData = await textResponse.json();

            if (textData && textData.content) {
              // Step 4: Write to UI state and seal inside device local storage for the next 24 hours
              setLiveVerseText(textData.content);
              setLiveVerseRef(textData.reference || independentPassageId);

              localStorage.setItem('cached_yv_verse_text', textData.content);
              localStorage.setItem('cached_yv_verse_ref', textData.reference || independentPassageId);
              localStorage.setItem('cached_yv_verse_date', todayKey);
            }
          }
        } catch (error) {
          console.error("Couldn't sync YouVersion data, staying with local fallback:", error);
        }
      };

      fetchIndependentCuratedVerse();
    }
  }, []);
  // --- END OF CURATED INTEGRATION ---

  const prayForWall = () => {
    if (wall.prayed) return;
    update({ wallPrayer: { ...wall, count: wall.count + 1, prayed: true } });
  };

  return (
    <>
      <header className="app-topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <Logo className="topbar-logo-svg" />
          </div>
          <div>
            <div className="welcome-name">Welcome, {firstName(state.name)}</div>
            <div className="welcome-sub">Peace be with you today</div>
          </div>
        </div>
        <div className="streak-pill">
          🔥 {streak}
          {streak === 1 ? ' day' : ' days'} streak
        </div>
      </header>

      <div className="insight-box">
        <Icon name="people" />
        <span>
          Believers in our fellowship are walking through <u>{struggleA}</u> and <u>{struggleB}</u> today. Remember
          to pray for your brothers and sisters.
        </span>
      </div>

      <section className="scripture-card">
        <div className="scripture-eyebrow">SCRIPTURE OF THE DAY</div>
        <div className="scripture-text">"{liveVerseText}"</div>
        <div className="scripture-ref">{liveVerseRef}</div>
        <div className="scripture-footer">
          <span />
          <button
            className="join-discussion-btn"
            onClick={() => update({ tab: 'discussions', selectedDiscussion: 'Daily Scripture Reflections' })}
          >
            <Icon name="chat" /> Join Global Discussion
          </button>
        </div>
      </section>

      <section className="card">
        <div className="prayer-card-title">
          <Icon name="heart" /> Prayer Request of the Day
        </div>
        <div className="prayer-divider" />
        <div className="prayer-inner-box">
          <div className="prayer-author-row">
            <span className="flag-badge">{wall.flag}</span>
            <span className="prayer-author-name">
              {wall.author} from {wall.location}
            </span>
          </div>
          <div className="prayer-quote">"{wall.text}"</div>
          <div className="prayer-row">
            <button className={`pray-btn ${wall.prayed ? 'active' : ''}`} onClick={prayForWall}>
              <Icon name="heart" /> I Prayed For This
            </button>
          </div>
        </div>
      </section>

      <button className="submit-prayer-btn" onClick={() => setSheetOpen(true)}>
        + Submit Your Own Prayer Request
      </button>

      {sheetOpen && <PrayerRequestSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}
