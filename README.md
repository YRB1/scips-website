# SCIPS website

Website for **Sandwell Community Information and Participation Service (SCIPS)**, a community-led charity supporting tenants, residents and community groups across Sandwell.

Proposal build by [YRB Nova](https://yrbnova.com). Preview: https://yrb1.github.io/scips-website/

## Stack

- [Eleventy 3](https://www.11ty.dev/) static site generator with Nunjucks templates
- Hand-written CSS (no framework), one stylesheet organised by tokens, layout and components
- ~5 KB of vanilla JavaScript for progressive enhancement. Every page works without JavaScript
- Responsive images (AVIF, WebP, JPEG at several widths) generated at build time with `@11ty/eleventy-img`
- Self-hosted Atkinson Hyperlegible Next and Mono, designed by the Braille Institute for low-vision readers
- Deployed to GitHub Pages by GitHub Actions on every push to `main`

## Run locally

```bash
npm install
npm start        # http://localhost:8080/scips-website/
npm run build    # outputs to _site/
```

When the site moves to its own domain, build with `PATH_PREFIX=/ npm run build`.

## Structure

```
src/
  _data/           site details, navigation, photo library with credits
  _includes/       base, page and legal layouts; header, footer, icons
  assets/css/      main.css
  assets/js/       main.js
  assets/fonts/    Atkinson Hyperlegible Next and Mono (WOFF2)
  assets/photos/   source photographs (resized at build time)
  index.njk        home page
  about/ how-we-help/ residents-groups/ get-involved/ contact/
  privacy/ cookies/ accessibility/ terms/ image-credits/ 404.njk
```

Site-wide details (phone, email, address, charity and company numbers) live in `src/_data/site.json`, so they only need changing in one place.

## Accessibility

- Automated audit with axe-core: 0 violations on all pages against WCAG 2.2 AA
- High-visibility focus states, skip link, logical heading order, landmarks and breadcrumbs
- Form follows the GOV.UK pattern: visible labels, hints, inline errors and an error summary
- Hero slideshow can be paused and does not play automatically when "reduce motion" is on
- Carousel uses native scroll-snap with buttons and keyboard arrows
- No accessibility overlay. The site is accessible by default instead

## Privacy and compliance

| Item | Approach |
|---|---|
| Cookies | None set, so no cookie banner is needed |
| Third parties | Fonts and images self-hosted. OpenStreetMap map only loads on request; Google Translate opens in a new tab |
| Forms | Only name, email and message required; explicit unticked consent; linked privacy notice |
| Legal pages | Privacy, cookies, accessibility statement, terms, image credits (drafts for SCIPS to review) |
| Claims | Only facts that can be verified from public sources; no testimonials or statistics invented |
| Images | Geograph photos under CC BY-SA 2.0, credited on every image and on the image credits page |
| Business details | Charity number, company number and registered office in the footer of every page |

## Before launch

- [ ] SCIPS to review all copy, especially service descriptions and the legal drafts
- [ ] Add the SCIPS logo and their own photography (with consent)
- [ ] Connect the contact form to a form service (e.g. Formspree) or a CMS, and update the privacy notice
- [ ] Add a news and events section, if SCIPS will keep it updated
- [ ] Set `"concept": false` in `src/_data/site.json` to remove `noindex` and the proposal credit
- [ ] Point scips.org.uk at the host and build with `PATH_PREFIX=/`
