// localStorage that never throws: in private mode or with storage blocked, reads come back empty
// and writes are skipped, so the app keeps working for the current visit.
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage full or unavailable
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable
    }
  },
  getJSON<T>(key: string): T | null {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setJSON(key: string, value: unknown) {
    this.set(key, JSON.stringify(value));
  },
};
