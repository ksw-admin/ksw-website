/**
 * Split-testing / Private Beta helpers (Netlify CDN Split Testing using the `nf_ab` cookie).
 * Reference: https://www.netlify.com/blog/2019/09/11/netlify-pro-tip-using-split-testing-to-power-private-beta-releases/
 */

export const BETA_BRANCH = 'astro-redesign';
export const PROD_BRANCH = 'main';
export const COOKIE_NAME = 'nf_ab';
export const COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 year

/** Parse a cookie string (e.g. `document.cookie` or header) and extract the `nf_ab` branch value. */
export function getSplitCookie(cookieString: string | null | undefined): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(/(?:^|;\s*)nf_ab=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Format a cookie string to opt in to a branch (default: `astro-redesign`). */
export function buildSplitCookie(branch: string = BETA_BRANCH, secure = false): string {
  return `${COOKIE_NAME}=${encodeURIComponent(branch)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** Format a cookie string to reset back to the production branch (`main`). */
export function buildResetCookie(prodBranch: string = PROD_BRANCH, secure = false): string {
  return `${COOKIE_NAME}=${encodeURIComponent(prodBranch)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** Check whether a `?beta=...` query parameter value requests opt-in. */
export function isOptInParam(val: string | null | undefined): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'on' || v === BETA_BRANCH.toLowerCase();
}

/** Check whether a `?beta=...` query parameter value requests opt-out. */
export function isOptOutParam(val: string | null | undefined): boolean {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === '0' || v === 'false' || v === 'off' || v === PROD_BRANCH.toLowerCase();
}
