/**
 * Private beta via Netlify Split Testing (cookie `nf_ab`). The split test sends 0 % of visitors to the beta branch;
 * people opt in with `?beta=1` (snippet injected on the live site in Netlify) and opt out with the banner or /beta.
 * Reference: https://www.netlify.com/blog/2019/09/11/netlify-pro-tip-using-split-testing-to-power-private-beta-releases/
 *
 * Everything beta (banner, /beta page, ?beta= switch) is only built for the beta branch (isBetaBuild), so it
 * disappears by itself once this code is merged into main. At the merge: end the split test and remove the
 * injected snippet in Netlify (README › Notes).
 */

export const BETA_BRANCH = 'astro-redesign';
export const PROD_BRANCH = 'main';
export const COOKIE_NAME = 'nf_ab';
export const COOKIE_MAX_AGE = 365 * 24 * 3600; // 1 year: opt in to the new site
/** Opt-out to the old site lasts one day only: the old site has no way back, so the visitor sees the new site again tomorrow. */
export const OPT_OUT_MAX_AGE = 24 * 3600;

type Env = Record<string, string | undefined>;

/**
 * Build for the beta branch? Netlify sets BRANCH during the build. Locally, PUBLIC_BETA_PREVIEW=1 shows the beta
 * parts (e.g. `PUBLIC_BETA_PREVIEW=1 npm run dev`).
 */
export function isBetaBuild(env: Env = (globalThis as { process?: { env: Env } }).process?.env ?? {}): boolean {
  return env.BRANCH === BETA_BRANCH || env.PUBLIC_BETA_PREVIEW === '1';
}

/** Parse a cookie string (e.g. `document.cookie` or header) and extract the `nf_ab` branch value. */
export function getSplitCookie(cookieString: string | null | undefined): string | null {
  if (!cookieString) return null;
  const match = cookieString.match(/(?:^|;\s*)nf_ab=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Format a cookie string to opt in to a branch (default: the beta branch). */
export function buildSplitCookie(branch: string = BETA_BRANCH, secure = false): string {
  const maxAge = branch === PROD_BRANCH ? OPT_OUT_MAX_AGE : COOKIE_MAX_AGE;
  return `${COOKIE_NAME}=${encodeURIComponent(branch)}; path=/; max-age=${maxAge}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

/** Format a cookie string to reset back to the production branch (`main`). */
export function buildResetCookie(prodBranch: string = PROD_BRANCH, secure = false): string {
  return buildSplitCookie(prodBranch, secure);
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

/**
 * What a `?beta=` value asks for, given the current cookie: the cookie to set (or null) and whether a reload is
 * needed (only when the branch actually changes; otherwise just drop the parameter from the address).
 */
export function betaSwitch(param: string | null, cookie: string | null | undefined, secure = false): { set: string | null; reload: boolean } {
  const current = getSplitCookie(cookie);
  const target = isOptInParam(param) ? BETA_BRANCH : isOptOutParam(param) ? PROD_BRANCH : null;
  if (!target) return { set: null, reload: false };
  return { set: buildSplitCookie(target, secure), reload: current !== target };
}
