// After the build: every hand-written rule in public/_redirects must lead to a page that exists in dist/, and no
// address may have two rules (Netlify uses the first, the second would be dead). A renamed post or page then fails
// the build here instead of sending old links to the 404 page.
// Usage: node scripts/check-redirects.mjs   (after `npm run build`; CI runs it)
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const rules = (await readFile('public/_redirects', 'utf8'))
  .split('\n')
  .map((line, i) => ({ line: i + 1, parts: line.trim().split(/\s+/) }))
  .filter((r) => r.parts[0] && !r.parts[0].startsWith('#'));

const exists = async (path) => {
  for (const candidate of [path, join(path, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return true;
    } catch {}
  }
  return false;
};

const problems = [];
const seen = new Map();
for (const { line, parts } of rules) {
  const [from, to, status] = parts;
  if (parts.length !== 3 || !/^30[12]!?$/.test(status)) problems.push(`line ${line}: expected "<from>  <to>  301"`);
  if (seen.has(from)) problems.push(`line ${line}: ${from} already has a rule in line ${seen.get(from)}`);
  seen.set(from, line);
  // Targets with a placeholder (/articles/:splat) depend on the request: not checkable here.
  if (!to || to.includes(':')) continue;
  if (!(await exists(join(DIST, decodeURI(to))))) problems.push(`line ${line}: target ${to} is not in ${DIST}/`);
  // A target that is itself redirected would be a chain (two hops for visitors and for Google).
  if (seen.has(to) || rules.some((r) => r.parts[0] === to)) problems.push(`line ${line}: target ${to} is redirected again (chain)`);
}

if (problems.length) {
  console.error(`[check-redirects] ${problems.length} problem(s) in public/_redirects:\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`[check-redirects] ${rules.length} rules, all targets exist`);
