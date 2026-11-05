import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BETA_BRANCH,
  PROD_BRANCH,
  COOKIE_NAME,
  getSplitCookie,
  buildSplitCookie,
  buildResetCookie,
  isOptInParam,
  isOptOutParam,
} from '../src/lib/split-test.ts';

test('split-test: getSplitCookie correctly parses cookies', () => {
  assert.equal(getSplitCookie(null), null);
  assert.equal(getSplitCookie(''), null);
  assert.equal(getSplitCookie('foo=bar; nf_ab=astro-redesign; theme=dark'), 'astro-redesign');
  assert.equal(getSplitCookie('nf_ab=main'), 'main');
  assert.equal(getSplitCookie('other_nf_ab=123; nf_ab=astro-redesign'), 'astro-redesign');
});

test('split-test: buildSplitCookie formats valid cookie strings', () => {
  const cookie = buildSplitCookie();
  assert.match(cookie, new RegExp(`^${COOKIE_NAME}=${BETA_BRANCH};`));
  assert.match(cookie, /path=\/;/);
  assert.match(cookie, /max-age=31536000;/);
  assert.match(cookie, /SameSite=Lax/);
  assert.ok(!cookie.includes('Secure'));

  const secureCookie = buildSplitCookie(BETA_BRANCH, true);
  assert.match(secureCookie, /; Secure$/);
});

test('split-test: buildResetCookie formats valid reset string', () => {
  const cookie = buildResetCookie();
  assert.match(cookie, new RegExp(`^${COOKIE_NAME}=${PROD_BRANCH};`));
});

test('split-test: query parameter parsing for opt-in and opt-out', () => {
  assert.equal(isOptInParam('1'), true);
  assert.equal(isOptInParam('true'), true);
  assert.equal(isOptInParam('on'), true);
  assert.equal(isOptInParam('astro-redesign'), true);
  assert.equal(isOptInParam('Astro-Redesign'), true);
  assert.equal(isOptInParam('0'), false);
  assert.equal(isOptInParam(null), false);

  assert.equal(isOptOutParam('0'), true);
  assert.equal(isOptOutParam('false'), true);
  assert.equal(isOptOutParam('off'), true);
  assert.equal(isOptOutParam('main'), true);
  assert.equal(isOptOutParam('Main'), true);
  assert.equal(isOptOutParam('1'), false);
  assert.equal(isOptOutParam(undefined), false);
});

test('split-test: beta parts only in a build of the beta branch (gone after the merge into main)', async () => {
  const { isBetaBuild } = await import('../src/lib/split-test.ts');
  assert.equal(isBetaBuild({ BRANCH: 'astro-redesign' }), true);
  assert.equal(isBetaBuild({ BRANCH: 'main' }), false);
  assert.equal(isBetaBuild({}), false);
  assert.equal(isBetaBuild({ PUBLIC_BETA_PREVIEW: '1' }), true);
});

test('split-test: ?beta= switch sets the cookie and reloads only when the branch changes', async () => {
  const { betaSwitch } = await import('../src/lib/split-test.ts');
  assert.deepEqual(betaSwitch(null, ''), { set: null, reload: false });
  assert.deepEqual(betaSwitch('maybe', ''), { set: null, reload: false });
  const join = betaSwitch('1', 'nf_ab=0.6668', true);
  assert.match(join.set!, /^nf_ab=astro-redesign;.*; Secure$/);
  assert.equal(join.reload, true);
  assert.equal(betaSwitch('1', 'nf_ab=astro-redesign').reload, false); // already in: no reload loop
  assert.match(betaSwitch('0', 'nf_ab=astro-redesign').set!, /^nf_ab=main;/);
  assert.equal(betaSwitch('0', 'nf_ab=astro-redesign').reload, true);
  assert.equal(betaSwitch('off', 'nf_ab=main').reload, false);
});
