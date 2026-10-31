# SCIPS website: concept redesign

A concept redesign of [scips.org.uk](https://www.scips.org.uk) for **Sandwell Community Information & Participation Service (SCIPS)**, built by [YRB Nova](https://yrbnova.com) as a pitch.

Static site: `index.html` + `assets/img/`. No build step. Host anywhere (GitHub Pages, Netlify, Vercel, cPanel).

## Highlights
- Full-bleed hero slideshow with Ken Burns zoom, progress-bar slide controls, animated headline
- Scrolling town ticker, scroll progress bar, branded orange scrollbar
- Bordered floating header with active-section highlighting; bordered sections throughout
- Bento services grid, animated "start a group" timeline that fills as you scroll
- Review carousel (autoplay, arrows, dots, swipe)
- Animated six-towns coverage map, parallax photos, count-up stats, smooth FAQ accordion
- Live "Open now / Closed now" indicator (UK time), text-size switcher, skip link, reduced-motion support
- Schema.org structured data for Google

## Fixes vs the current site
- "Complete the form below" text no longer sits under the Submit button
- No pixelated contact graphic, no reCAPTCHA badge covering the map (honeypot spam trap instead)
- Form asks for town + enquiry type so enquiries arrive sorted

## Before going live
- [ ] **Replace the sample reviews** with real, consented feedback (they are placeholders, marked "Sample")
- [ ] Swap stock photos (Unsplash, free licence) for real SCIPS photos where possible
- [ ] Add the SCIPS logo, confirm service wording and "reply within two working days"
- [ ] Link the real privacy policy and accessibility statement
- [ ] Wire the form to Formspree / Netlify Forms (currently opens the visitor's email app)
- [ ] Remove `<meta name="robots" content="noindex">` and the "Concept by YRB Nova" badge

## Sources
Contact details, hours, charity no. 1097702 and the Tenant Engagement Strategy co-production: Sandwell Council Information Point & tenant engagement pages, Charity Commission register.
