// Tiny test helper: collect named cases, run them, report, return the failure count.
import { deepStrictEqual } from 'node:assert';

type Case = { name: string; fn: () => void | Promise<void> };

export function suite(title: string) {
  const cases: Case[] = [];
  return {
    test: (name: string, fn: Case['fn']) => {
      cases.push({ name, fn });
    },
    eq: (actual: unknown, expected: unknown) => deepStrictEqual(actual, expected),
    run: async () => {
      console.log(`\n${title}`);
      let failed = 0;
      for (const c of cases) {
        try {
          await c.fn();
          console.log(`  ✓ ${c.name}`);
        } catch (e) {
          failed++;
          console.log(`  ✗ ${c.name}\n    ${(e as Error).message.split('\n').join('\n    ')}`);
        }
      }
      return failed;
    },
  };
}
