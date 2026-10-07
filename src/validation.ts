// Form rules shared by sign-up, login, onboarding and Edit Profile.
// Each validator returns an error message, or null when the value is fine.

export const MIN_NAME = 2;
export const MIN_PASSWORD = 8;
export const MIN_TOPIC = 2;
export const MAX_TOPIC = 30;

/** Emails are stored and compared trimmed and lowercased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateName(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Enter your name';
  if (value.length < MIN_NAME) return `Use at least ${MIN_NAME} characters`;
  return null;
}

// name@domain.tld: no spaces, at least one dot in the domain, 2+ letters after the last dot.
const EMAIL_RE = /^[^\s@]+@(?:[^\s@.]+\.)+[A-Za-z]{2,}$/;

export function validateEmail(email: string): string | null {
  const value = normalizeEmail(email);
  if (!value) return 'Enter your email';
  if (!EMAIL_RE.test(value)) return 'Enter a valid email, like name@example.com';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Enter a password';
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters`;
  return null;
}

export function validateConfirm(password: string, confirm: string): string | null {
  if (!confirm) return 'Confirm your password';
  if (confirm !== password) return "Passwords don't match";
  return null;
}

/** A custom interest topic: 2–30 characters after trimming, and not already in the list (any case). */
export function validateCustomTopic(topic: string, existing: string[]): string | null {
  const value = topic.trim();
  if (value.length < MIN_TOPIC) return `Use at least ${MIN_TOPIC} characters`;
  if (value.length > MAX_TOPIC) return `Keep it to ${MAX_TOPIC} characters or fewer`;
  if (existing.some((t) => t.toLowerCase() === value.toLowerCase())) return "You've already added that topic";
  return null;
}

export function validateInterests(interests: string[]): string | null {
  return interests.length ? null : 'Pick at least one';
}

export function validateBook(book: string | null): string | null {
  return book ? null : 'Pick a book';
}
