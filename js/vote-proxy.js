/**
 * MAS voting proxy
 * ---------------------------------------------------------------------------
 * Routed (in the Cloudflare dashboard, or wrangler.toml) to handle requests
 * matching:   makacturialsociety.org/vote*
 *
 * What it does:
 *  1. Forwards the request as-is to the real Django app on AWS (VOTE_ORIGIN),
 *     keeping the /vote prefix in the path. Your browser only ever sees
 *     makacturialsociety.org — the AWS URL never appears.
 *  2. If the origin is slow, down, or errors, it serves a branded "voting
 *     site unavailable" page instead of Cloudflare's generic error page.
 *
 * Because /vote/* is served from this same domain, requests from your
 * static site's JS (e.g. the health check in js/main.js) are same-origin —
 * no CORS configuration is needed on the Django side.
 *
 * Django-side setup this assumes (see ../README.md for detail):
 *  - urls.py wraps everything under path('vote/', include([...]))
 *  - STATIC_URL / MEDIA_URL are '/vote/static/' and '/vote/media/'
 *  - CSRF_TRUSTED_ORIGINS includes 'https://makacturialsociety.org'
 *  - a cheap health endpoint exists at /vote/health/ returning 200
 */

const REQUEST_TIMEOUT_MS = 8000;

export default {
  async fetch(request, env) {
    if (!env.VOTE_ORIGIN) {
      return new Response('VOTE_ORIGIN is not configured on this Worker.', { status: 500 });
    }

    const incoming = new URL(request.url);
    const origin = new URL(env.VOTE_ORIGIN);

    const target = new URL(incoming.pathname + incoming.search, origin);

    const originRequest = new Request(target.toString(), request);
    originRequest.headers.set('Host', origin.hostname);
    // Django's CSRF checks look at Origin/Referer, which will still say
    // makacturialsociety.org since that's what the browser believes it's
    // talking to — that's expected, see README.

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(originRequest, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.status >= 500) {
        return unavailableResponse();
      }
      return response;
    } catch (err) {
      clearTimeout(timeout);
      return unavailableResponse();
    }
  },
};

function unavailableResponse() {
  return new Response(UNAVAILABLE_HTML, {
    status: 503,
    headers: { 'content-type': 'text/html; charset=UTF-8' },
  });
}

const UNAVAILABLE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Voting site unavailable — Makerere Actuarial Society</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<style>
  body {
    margin: 0;
    background: #eef3ea;
    color: #172420;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  .panel {
    max-width: 30rem;
    border: 1px solid #172420;
    padding: 2rem;
    background: #fbfcf9;
  }
  h1 { font-size: 1.4rem; margin: 0 0 0.75rem; }
  p { margin: 0 0 1.25rem; line-height: 1.5; }
  a.btn {
    display: inline-block;
    border: 1px solid #172420;
    background: #172420;
    color: #fbfcf9;
    padding: 0.6rem 1.1rem;
    text-decoration: none;
    font-size: 0.95rem;
  }
</style>
</head>
<body>
  <div class="panel">
    <h1>Voting site unavailable</h1>
    <p>We couldn't reach the voting system just now. This is usually temporary — please try again in a few minutes. If it keeps happening, let the committee know.</p>
    <a class="btn" href="/leadership.html">Back to Leadership</a>
  </div>
</body>
</html>`;
