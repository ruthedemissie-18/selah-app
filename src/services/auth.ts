// Local accounts, stored in this browser. Passwords are salted and hashed with PBKDF2 (Web Crypto)
// and never stored or logged in plain text. There's no server yet, so accounts live on this device.
import { normalizeEmail } from '../validation';
import { storage } from './storage';

const ACCOUNTS_KEY = 'selah-accounts';
const SESSION_KEY = 'selah-session';
const ITERATIONS = 150_000;

export interface Account {
  id: string;
  email: string;
  /** base64 */
  salt: string;
  /** base64 PBKDF2-SHA256 of the password with the salt */
  hash: string;
  iterations: number;
  createdAt: number;
}

export type AuthError = 'exists' | 'unknown' | 'wrong';

export const AUTH_MESSAGES: Record<AuthError, string> = {
  exists: 'An account with this email already exists.',
  unknown: "We couldn't find an account with that email.",
  wrong: "That email and password don't match.",
};

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return toB64(new Uint8Array(bits));
}

async function hashNew(password: string): Promise<Pick<Account, 'salt' | 'hash' | 'iterations'>> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: toB64(salt), hash: await derive(password, salt, ITERATIONS), iterations: ITERATIONS };
}

async function matches(account: Account, password: string): Promise<boolean> {
  const hash = await derive(password, fromB64(account.salt), account.iterations);
  // compare every character so timing doesn't reveal how much matched
  let diff = hash.length ^ account.hash.length;
  for (let i = 0; i < Math.min(hash.length, account.hash.length); i++) diff |= hash.charCodeAt(i) ^ account.hash.charCodeAt(i);
  return diff === 0;
}

function readAccounts(): Record<string, Account> {
  return storage.getJSON<Record<string, Account>>(ACCOUNTS_KEY) ?? {};
}

function writeAccounts(accounts: Record<string, Account>) {
  storage.setJSON(ACCOUNTS_KEY, accounts);
}

function findById(id: string): Account | undefined {
  return Object.values(readAccounts()).find((a) => a.id === id);
}

export function emailExists(email: string): boolean {
  return normalizeEmail(email) in readAccounts();
}

export async function signUp(email: string, password: string): Promise<{ account: Account } | { error: AuthError }> {
  const key = normalizeEmail(email);
  if (emailExists(key)) return { error: 'exists' };
  const account: Account = { id: crypto.randomUUID(), email: key, createdAt: Date.now(), ...(await hashNew(password)) };
  writeAccounts({ ...readAccounts(), [key]: account });
  return { account };
}

export async function logIn(email: string, password: string): Promise<{ account: Account } | { error: AuthError }> {
  const account = readAccounts()[normalizeEmail(email)];
  if (!account) return { error: 'unknown' };
  return (await matches(account, password)) ? { account } : { error: 'wrong' };
}

export async function changePassword(id: string, current: string, next: string): Promise<{ error?: AuthError }> {
  const account = findById(id);
  if (!account) return { error: 'unknown' };
  if (!(await matches(account, current))) return { error: 'wrong' };
  writeAccounts({ ...readAccounts(), [account.email]: { ...account, ...(await hashNew(next)) } });
  return {};
}

export function changeEmail(id: string, email: string): { error?: AuthError } {
  const key = normalizeEmail(email);
  const accounts = readAccounts();
  const account = Object.values(accounts).find((a) => a.id === id);
  if (!account) return { error: 'unknown' };
  if (key !== account.email && key in accounts) return { error: 'exists' };
  delete accounts[account.email];
  writeAccounts({ ...accounts, [key]: { ...account, email: key } });
  return {};
}

export function deleteAccount(id: string) {
  const accounts = readAccounts();
  const account = Object.values(accounts).find((a) => a.id === id);
  if (account) delete accounts[account.email];
  writeAccounts(accounts);
  if (getSession() === id) clearSession();
}

export function getSession(): string | null {
  const id = storage.get(SESSION_KEY);
  return id && findById(id) ? id : null;
}

export function setSession(id: string) {
  storage.set(SESSION_KEY, id);
}

export function clearSession() {
  storage.remove(SESSION_KEY);
}
