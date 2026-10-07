// Runs tests/*.test.ts with plain Node. esbuild (already installed with Vite) compiles them first,
// so no test framework is needed. Usage: npm test
import { build } from 'esbuild';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const files = readdirSync('tests').filter((f) => f.endsWith('.test.ts'));
const outdir = mkdtempSync(join(tmpdir(), 'selah-tests-'));
let failed = 0;
try {
  await build({
    entryPoints: files.map((f) => join('tests', f)),
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir,
    outExtension: { '.js': '.mjs' },
    logLevel: 'error',
  });
  for (const f of files) {
    const mod = await import(pathToFileURL(join(outdir, f.replace(/\.ts$/, '.mjs'))).href);
    failed += await mod.default();
  }
} finally {
  rmSync(outdir, { recursive: true, force: true });
}
if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nAll tests passed');
