# Makerere Actuarial Society — website

Static site (HTML/CSS/JS, no build step) for Cloudflare Pages.
Design language: **Campus horizon** (navy + maize gold on cool chalk).

## Hosts

| Host | Project | Role |
|------|---------|------|
| `https://makacturialsociety.org/` | this repo (`mas-static`) | Society website |
| `https://vote.makactuarialsociety.org/` | sibling `../mas-ovs` | Online voting (MAS-OVS) |

Voting deep links used on this site:

- Booth: `https://vote.makactuarialsociety.org/vote/`
- Receipt check: `https://vote.makactuarialsociety.org/vote/receipt/`

URLs are centralized in `js/main.js` (`SITE` object) and applied via
`data-voting-booth`, `data-receipt-lookup`, and `data-social` attributes.

## Structure

```text
index.html          Home
about.html          About
activities.html     Activities
leadership.html     Leadership + elections + booth CTAs
contact.html        Contact + Formspree + social icons
404.html            Custom not-found page
css/style.css       Campus horizon styles
js/main.js          SITE config, nav, year, form UX, reveals
robots.txt          Crawler rules
sitemap.xml         Page index for search
assets/mas_logo.jpg Logo / favicon source
assets/icons/       Brand-colored social SVGs
```

## Social icons

Official brand marks live in `assets/icons/` (Facebook, Instagram, LinkedIn,
X, WhatsApp). Contact and every footer render them; WhatsApp uses
`https://wa.me/256766846964`.

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub/GitLab repo (or use `wrangler pages deploy`
   from this folder).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages** →
   connect the repo. Build command: none. Build output directory: `/`
   (project root).
3. Add the custom domain `makacturialsociety.org` under **Custom domains**.

Point `vote.makactuarialsociety.org` at the MAS-OVS deployment separately.

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
