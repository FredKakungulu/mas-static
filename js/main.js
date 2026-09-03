/* ==========================================================================
   Makerere Actuarial Society — shared site behaviour
   ========================================================================== */

/* ---------- mobile nav toggle ---------- */

function initNavToggle() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ==========================================================================
   Elections / voting handoff
   --------------------------------------------------------------------------
   EDIT ME when a real election is announced:
     - set `open: true`
     - fill in the real window / instructions if you want them shown
   `voteUrl` and `healthUrl` assume the Cloudflare Worker proxy described in
  README.md deployment setup is in place, so /vote/* is same-origin with the static
   site and no CORS setup is needed on the Django side.
   ========================================================================== */

const ELECTIONS = {
  open: false,
  voteUrl: '/vote/',
  healthUrl: '/vote/health/',
  healthTimeoutMs: 6000,
};

/**
 * Checks whether the voting site is reachable and responding before we send
 * someone to it. Works as a plain same-origin fetch because /vote/* is
 * proxied onto this domain (see js/vote-proxy.js). If you instead point
 * `healthUrl` at a different domain, the Django app must send an
 * Access-Control-Allow-Origin header for this domain or the fetch will be
 * blocked by CORS before it ever reaches your code.
 *
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
async function checkVotingSiteHealth(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    return response.ok;
  } catch (err) {
    // Covers network failure, timeout/abort, DNS failure, and — if this ever
    // points cross-origin without CORS enabled — the browser blocking the
    // read. All of those should be treated the same way: not available.
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function initVoteCta() {
  const cta = document.querySelector('[data-vote-cta]');
  const errorBanner = document.querySelector('[data-vote-error]');
  const closedNotice = document.querySelector('[data-vote-closed]');
  if (!cta) return;

  if (!ELECTIONS.open) {
    cta.hidden = true;
    if (closedNotice) closedNotice.hidden = false;
    return;
  }

  cta.hidden = false;
  const originalLabel = cta.textContent;

  cta.addEventListener('click', async (event) => {
    event.preventDefault();
    if (errorBanner) errorBanner.hidden = true;

    cta.setAttribute('aria-busy', 'true');
    cta.textContent = 'Checking voting site…';

    const healthy = await checkVotingSiteHealth(ELECTIONS.healthUrl, ELECTIONS.healthTimeoutMs);

    if (healthy) {
      window.location.href = ELECTIONS.voteUrl;
      return;
    }

    cta.removeAttribute('aria-busy');
    cta.textContent = originalLabel;
    if (errorBanner) errorBanner.hidden = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initVoteCta();
});
