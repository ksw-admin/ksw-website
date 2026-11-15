// The design system (design-system/tokens.json) must match the site's real colours (src/styles/global.css).
// If this fails, a colour was changed in one place only: update the other, then republish the design system.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const tokens = JSON.parse(readFileSync(new URL('../design-system/tokens.json', import.meta.url), 'utf8'));

/** Custom properties declared in the first block that matches `selector`. */
function vars(selector: RegExp): Map<string, string> {
  const block = selector.exec(css)?.[1] ?? '';
  return new Map([...block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]));
}
const light = vars(/^:root\s*\{([\s\S]*?)\n\}/m);
const dark = vars(/:root\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/);

test('global.css parses: light and dark colour sets found', () => {
  assert.ok(light.size > 10, `found ${light.size} light variables`);
  assert.ok(dark.size > 5, `found ${dark.size} dark variables`);
});

for (const t of tokens.color.tokens as { name: string; value: string | Record<string, string> }[]) {
  test(`colour token "${t.name}" matches global.css in light and dark`, () => {
    const value = typeof t.value === 'string' ? { light: t.value, dark: t.value } : t.value;
    assert.equal(value.light.toLowerCase(), light.get(t.name), `light --${t.name}`);
    assert.equal(value.dark.toLowerCase(), dark.get(t.name) ?? light.get(t.name), `dark --${t.name}`);
  });
}

test('every site colour variable is documented in the design system', () => {
  const documented = new Set((tokens.color.tokens as { name: string }[]).map((t) => t.name));
  const colours = [...light].filter(([, v]) => /^#[0-9a-f]{3,8}$/.test(v)).map(([k]) => k);
  const missing = colours.filter((k) => !documented.has(k));
  assert.deepEqual(missing, [], `add to design-system/tokens.json: ${missing.join(', ')}`);
});
