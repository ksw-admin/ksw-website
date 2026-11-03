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
