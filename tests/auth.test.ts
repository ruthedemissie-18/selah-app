import { changePassword, deleteAccount, emailExists, logIn, signUp } from '../src/services/auth';
import { suite } from './harness';

// In-memory stand-in for the browser's localStorage
const mem = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  },
});

const { test, eq, run } = suite('Accounts (salted PBKDF2, stored locally)');
const PASSWORD = 'correct horse';

test('sign up stores a salted hash, never the password', async () => {
  const res = await signUp('  Ruth@Example.com ', PASSWORD);
  eq('account' in res, true);
  const stored = mem.get('selah-accounts') ?? '';
  eq(stored.includes(PASSWORD), false);
  eq(stored.includes('ruth@example.com'), true); // email trimmed and lowercased
});
test('the same password gets a different hash for each account (salted)', async () => {
  await signUp('other@example.com', PASSWORD);
  const accounts = JSON.parse(mem.get('selah-accounts')!);
  eq(accounts['ruth@example.com'].hash !== accounts['other@example.com'].hash, true);
});
test('duplicate email is rejected in any case', async () => {
  eq(await signUp('RUTH@example.com', 'something else'), { error: 'exists' });
  eq(emailExists(' ruth@EXAMPLE.com'), true);
});
test('log in: right password, wrong password, unknown email', async () => {
  eq('account' in (await logIn('ruth@example.com', PASSWORD)), true);
  eq(await logIn('ruth@example.com', 'nope nope'), { error: 'wrong' });
  eq(await logIn('nobody@example.com', PASSWORD), { error: 'unknown' });
});
test('change password checks the current one first', async () => {
  const res = await logIn('ruth@example.com', PASSWORD);
  const id = 'account' in res ? res.account.id : '';
  eq(await changePassword(id, 'wrong one', 'brand new pw'), { error: 'wrong' });
  eq(await changePassword(id, PASSWORD, 'brand new pw'), {});
  eq(await logIn('ruth@example.com', PASSWORD), { error: 'wrong' });
  eq('account' in (await logIn('ruth@example.com', 'brand new pw')), true);
});
test('delete account removes it', async () => {
  const res = await logIn('other@example.com', PASSWORD);
  deleteAccount('account' in res ? res.account.id : '');
  eq(await logIn('other@example.com', PASSWORD), { error: 'unknown' });
});

export default run;
