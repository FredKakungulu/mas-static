# Makerere Actuarial Society — website

Static site (HTML/CSS/JS, no build step) for Cloudflare Pages.
Design language: **Campus horizon** (navy + maize gold on cool chalk).

## Structure

```text
index.html          Home
about.html          About
activities.html     Activities
leadership.html     Leadership + elections
contact.html        Contact
404.html            Custom not-found page
css/style.css       Campus horizon styles
js/main.js          Nav, year, contact form UX
robots.txt          Crawler rules
sitemap.xml         Page index for search
assets/             Logo + favicon
```

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub/GitLab repo (or use `wrangler pages deploy`
   from this folder).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages** →
   connect the repo. Build command: none. Build output directory: `/`
   (project root).
3. Add the custom domain `makacturialsociety.org` under **Custom domains**.

## Contact form

`contact.html` posts to Formspree (`https://formspree.io/f/xnpqvrre`).
Submissions are handled client-side with success/error feedback in
`js/main.js`. To point at a different form, change the form `action` URL.

## Filling in real content later

Some listings ship as intentional empty states until real data is ready:

- **Leadership** — role list is live; officer names go in
  `leadership.html` when available.
- **Upcoming activities** — empty state on `activities.html`; replace with
  dated rows when sessions are scheduled.
- **Home stats** — omitted until figures are confirmed (pillars describe
  what members get instead).
