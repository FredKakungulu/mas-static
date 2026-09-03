# Makerere Actuarial Society — website

Static site (HTML/CSS/JS, no build step) for Cloudflare Pages.

## Structure

```text
index.html          Home
about.html           About
activities.html      Activities
leadership.html      Leadership + elections information
contact.html         Contact
css/style.css        All styling
js/main.js           Mobile navigation
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

## 2. Contact form

`contact.html`'s form posts to a placeholder Formspree URL
(`action="https://formspree.io/f/your-form-id"`). Static sites can't
process form submissions on their own, so either:

- sign up at [Formspree](https://formspree.io) (or similar) and drop in
  your real form ID, or
- swap the form for a `mailto:` link if you'd rather not add a service.
