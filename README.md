# SCIPS website

Website for **Sandwell Community Information and Participation Service (SCIPS)**, a community-led charity supporting tenants, residents and community groups across Sandwell.

Proposal build by [YRB Nova](https://yrbnova.com). Preview: https://yrb1.github.io/scips-website/

## Stack

- [Eleventy 3](https://www.11ty.dev/) static site generator with Nunjucks templates
- Hand-written CSS (no framework), one stylesheet organised by tokens, layout and components
- ~5 KB of vanilla JavaScript for progressive enhancement. Every page works without JavaScript
- Responsive images (AVIF, WebP, JPEG at several widths) generated at build time with `@11ty/eleventy-img`
- Self-hosted Newsreader (headings) and Hanken Grotesk (text), both under the SIL Open Font Licence
- Static site search with [Pagefind](https://pagefind.app/), built at deploy time, no server or third-party service
- Printable guides written in Markdown (`src/guides/`), with automatic contents lists
- Static, on-brand location map rendered from OpenStreetMap data (no embed, no tracking)
- Social sharing image, sitemap and robots.txt
- Deployed to GitHub Pages by GitHub Actions on every push to `main`

## Run locally

```bash
npm install
npm start        # http://localhost:8080/scips-website/
npm run build    # outputs to _site/ and builds the search index
```

### Hosting

- **Vercel** (recommended): import the repo at vercel.com/new. `vercel.json` sets the build (`PATH_PREFIX=/ npm run build`) and output (`_site`). Canonical and share links follow the Vercel domain automatically; set `SITE_URL` in project settings once a custom domain is added.
- **GitHub Pages**: built by `.github/workflows/deploy.yml` under `/scips-website/`.

## Structure

```
src/
  _data/           site details, navigation, photo library with credits
  _includes/       base, page and legal layouts; header, footer, icons
  assets/css/      main.css
  assets/js/       main.js
  assets/fonts/    Atkinson Hyperlegible Next and Mono (WOFF2)
  assets/photos/   source photographs (resized at build time)
  guides/          guides as Markdown files; add a file to add a guide
  index.njk        home page
  about/ how-we-help/ residents-groups/ get-involved/ contact/ search/
  privacy/ cookies/ accessibility/ terms/ image-credits/ 404.njk
```

Site-wide details (phone, email, address, charity and company numbers) live in `src/_data/site.json`, so they only need changing in one place.

## Accessibility

- Automated audit with axe-core: 0 violations on all pages against WCAG 2.2 AA
- Lighthouse (mobile): Accessibility 100, Best Practices 100, Performance 93 to 100. SEO is held back only by the deliberate `noindex` on this proposal build
- High-visibility focus states, skip link, logical heading order, landmarks and breadcrumbs
- Form follows the GOV.UK pattern: visible labels, hints, inline errors and an error summary
- Scroll animations switch off when "reduce motion" is on; every section then shows as ordinary static content
- Every page still works without JavaScript
- No accessibility overlay. The site is accessible by default instead

## Privacy and compliance

| Item | Approach |
|---|---|
| Cookies | None set, so no cookie banner is needed |
| Third parties | Fonts, images and map all self-hosted. Google Translate and Google Maps only open when a visitor follows the link |
| Forms | Only name, email and message required; explicit unticked consent; linked privacy notice |
| Legal pages | Privacy, cookies, accessibility statement, terms, image credits (drafts for SCIPS to review) |
| Claims | Only facts that can be verified from public sources; no testimonials or statistics invented |
| Images | Geograph photos under CC BY-SA 2.0, credited on every image and on the image credits page. Map data © OpenStreetMap contributors (ODbL) |
| Business details | Charity number, company number and registered office in the footer of every page |

## Before launch

- [ ] SCIPS to review all copy, especially service descriptions and the legal drafts
- [ ] Add the SCIPS logo and their own photography (with consent)
- [ ] Connect the contact form to a form service (e.g. Formspree) or a CMS, and update the privacy notice
- [ ] Add a news and events section, if SCIPS will keep it updated
- [ ] Set `"concept": false` in `src/_data/site.json` to remove `noindex` and the proposal credit
- [ ] Point scips.org.uk at the host and build with `PATH_PREFIX=/`
