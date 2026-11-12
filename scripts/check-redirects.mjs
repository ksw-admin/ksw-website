// After the build: every hand-written rule in public/_redirects must lead to a page that exists in dist/, and no
// address may have two rules (Netlify uses the first, the second would be dead). A renamed post or page then fails
// the build here instead of sending old links to the 404 page.
// Usage: node scripts/check-redirects.mjs   (after `npm run build`; CI runs it)
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const rules = (await readFile('public/_redirects', 'utf8'))
  .split('\n')
  .map((line, i) => ({ line: i + 1, parts: line.trim().split(/\s+/) }))
  .filter((r) => r.parts[0] && !r.parts[0].startsWith('#'));

// Netlify answers addresses in lower case (a target with capitals costs a second redirect), so targets are written
// in lower case and compared with the built files without regard to case.
const built = new Set();
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else built.add(relative(DIST, full).split(sep).join('/').toLowerCase());
  }
};
await walk(DIST);
const exists = (path) => {
  const p = path.replace(/^\/+/, '').toLowerCase();
  return built.has(p) || built.has(p.replace(/\/?$/, '/') + 'index.html') || built.has(p + 'index.html');
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
  if (!exists(decodeURI(to))) problems.push(`line ${line}: target ${to} is not in ${DIST}/`);
  if (decodeURI(to) !== decodeURI(to).toLowerCase()) problems.push(`line ${line}: target ${to} has capital letters (Netlify adds a second redirect)`);
  // A target that is itself redirected would be a chain (two hops for visitors and for Google).
  if (seen.has(to) || rules.some((r) => r.parts[0] === to)) problems.push(`line ${line}: target ${to} is redirected again (chain)`);
}

if (problems.length) {
  console.error(`[check-redirects] ${problems.length} problem(s) in public/_redirects:\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`[check-redirects] ${rules.length} rules, all targets exist`);
