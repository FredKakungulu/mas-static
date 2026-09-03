# Makerere Actuarial Society — website

Static site (HTML/CSS/JS, no build step) for Cloudflare Pages, with `/vote`
proxied to the existing Django voting system on AWS via a Cloudflare Worker.

## Structure

```
index.html          Home
about.html           About
activities.html      Activities
leadership.html      Leadership + elections/voting handoff
contact.html         Contact
css/style.css        All styling
js/main.js           Nav toggle, elections config, voting-site health check
js/vote-proxy.js     Cloudflare Worker: reverse-proxies /vote/* to AWS
wrangler.toml        Worker deploy config
```

Search the HTML files for `EDIT:` comments — that's every placeholder
(names, dates, links, form action) that needs real content before launch.

## 1. Deploy the static site to Cloudflare Pages

1. Push this folder to a GitHub/GitLab repo (or use `wrangler pages deploy`
   directly from this folder).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages** →
   connect the repo. Build command: none. Build output directory: `/`
   (project root).
3. Once deployed, add your custom domain `makacturialsociety.org` to the
   Pages project (**Custom domains** tab). This requires the domain's DNS
   to be managed by Cloudflare — if it isn't yet, Cloudflare will walk you
   through changing nameservers at your registrar.

## 2. Deploy the voting proxy Worker

1. Edit `wrangler.toml`:
   - `zone_name` / route pattern → your real domain (already set to
     `makacturialsociety.org/vote*`).
   - `VOTE_ORIGIN` → the actual address of the Django app on AWS (an
     Elastic Beanstalk domain, an ALB DNS name, or a subdomain you've
     pointed at it — not `makacturialsociety.org` itself).
2. From the project root, with [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
   installed and logged in:
   ```
   wrangler deploy
   ```
3. Cloudflare will now route any request to `makacturialsociety.org/vote*`
   to this Worker, which forwards it to AWS and returns the response as-is.
   Visitors never see the AWS URL.

If you'd rather not run a Worker, the simpler fallback is a subdomain
(`vote.makacturialsociety.org` via a DNS CNAME straight to AWS) — easier to
set up, but the health check will then need CORS enabled on the Django side
(see below) since it's a different origin.

## 3. Django-side changes (on the AWS app)

Because the Worker forwards the full `/vote/...` path unchanged, the
simplest approach is to make Django's own URL config match — i.e. Django
itself expects to live under `/vote/`, rather than trying to rewrite paths
in the Worker.

**`urls.py`** — wrap everything under a `vote/` prefix:
```python
urlpatterns = [
    path('vote/', include([
        path('', include('elections.urls')),
        path('health/', health_view),
    ])),
]
```

**`settings.py`**:
```python
STATIC_URL = '/vote/static/'
MEDIA_URL = '/vote/media/'
CSRF_TRUSTED_ORIGINS = ['https://makacturialsociety.org']
ALLOWED_HOSTS = ['*']  # or the specific AWS host the Worker forwards to
```

`CSRF_TRUSTED_ORIGINS` matters here specifically because the browser's
`Origin`/`Referer` headers will say `makacturialsociety.org` (that's the
domain the visitor is actually on) even though Django is physically running
elsewhere — Django needs to be told that's an expected, trusted origin.

**Health endpoint** — used by both the Worker and the front-end JS check.
Keep it cheap (no DB hit if you can avoid it):
```python
from django.http import JsonResponse

def health_view(request):
    return JsonResponse({"status": "ok"})
```

## 4. Turning voting on when polls open

Edit the small config block at the top of `js/main.js`:
```js
const ELECTIONS = {
  open: false,        // flip to true when polls open, back to false after
  voteUrl: '/vote/',
  healthUrl: '/vote/health/',
  healthTimeoutMs: 6000,
};
```
When `open` is `false`, the leadership page hides the "Cast your vote"
button and shows a short "polls aren't open" note instead. When `true`,
clicking the button runs the health check first: if the voting site
responds, it navigates there; if not, it shows an inline error and stays
put. Separately, the Worker itself serves a branded "unavailable" page if
someone lands on `/vote` directly (a bookmark, a shared link) while the
backend is down — so both paths are covered, not just the button.

## 5. Contact form

`contact.html`'s form posts to a placeholder Formspree URL
(`action="https://formspree.io/f/your-form-id"`). Static sites can't
process form submissions on their own, so either:
- sign up at [Formspree](https://formspree.io) (or similar) and drop in
  your real form ID, or
- swap the form for a `mailto:` link if you'd rather not add a service.
