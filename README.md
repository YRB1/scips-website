# SCIPS website: concept redesign

A concept redesign of [scips.org.uk](https://www.scips.org.uk) for **Sandwell Community Information & Participation Service (SCIPS)**, built by [YRB Nova](https://yrbnova.com) as a pitch.

Static site, no build step: `index.html`, legal pages, `assets/img`, `assets/fonts`. Host anywhere (GitHub Pages, Netlify, Vercel, cPanel).

## Features
- Intro loader (first visit only), full-bleed hero slideshow with Ken Burns zoom and progress controls
- Word-by-word heading reveals, scroll reveals, parallax, count-ups, magnetic buttons, custom cursor ring (mouse only)
- Bordered floating header with active-section highlight, orange scrollbar and scroll progress bar
- **Help finder**: two questions, then a tailored suggestion that pre-fills the contact form topic
- "Sound familiar?" carousel (autoplay, arrows, dots, swipe, keyboard arrows)
- Black-and-white photo gallery marquee that colours on hover
- Animated six-towns map, bento services grid, scroll-filling "start a group" timeline
- **Accessibility panel**: high contrast, readable font (Atkinson Hyperlegible), stop animations, underline links, text size, translate (Punjabi, Urdu, Polish, Bengali and more)
- Mobile quick-action bar (Call / Email / Find help / Message)

## Compliance checklist
| Item | Status |
|---|---|
| Privacy policy | `privacy.html` (draft for SCIPS to review) |
| Terms | `terms.html` (website terms of use) |
| Refund policy | Not applicable: no payments taken (stated in terms) |
| Cookie policy | `cookies.html` |
| Cookie / consent banner | Yes. No tracking cookies; external map only loads after opt-in. "Cookie settings" link in footer |
| Form consents | Unticked consent box, linked to privacy policy |
| No unnecessary data | Only name, email, message required; phone and town optional |
| Third-party audit | Fonts and images self-hosted. Only third parties: OpenStreetMap (opt-in), Google Translate (user-initiated link) |
| Dark patterns | None. "Essential only" is as easy as "Allow" |
| Hidden fees | None |
| Fake reviews | **Removed.** Replaced with a "Sound familiar?" carousel of situations SCIPS helps with. Add real, consented testimonials later |
| Unsupported claims | Removed "free", response-time promise and unverified stats. Service bullets still to confirm with SCIPS |
| Alt text | Meaningful images described; decorative images `alt=""` |
| Colour contrast | Text and buttons checked against WCAG AA (dark text on orange buttons) |
| Keyboard navigation | Skip link, visible focus, focus trapped in menu/panel, Escape closes, carousel arrow keys |
| Business details | Charity no., company no., registered office in footer and legal pages |
| Kids' data | Privacy policy asks under-13s to contact via a parent/carer |
| Unsubscribe | Not applicable: no mailing list |
| Fonts/images licensed | Fonts SIL OFL (self-hosted); photos Unsplash Licence; credits in footer |
| Data deletion | Process in privacy policy (email "Data request") |

## Before going live
- [ ] SCIPS to review the legal pages (marked as drafts) and confirm retention period
- [ ] Confirm service wording (group support bullets, training topics)
- [ ] Swap stock photos for real SCIPS photos (with consent) and add the logo
- [ ] Add real testimonials, if SCIPS has consented ones
- [ ] Wire the form to Formspree / Netlify Forms (currently opens the visitor's email app); update privacy policy if so
- [ ] Remove `noindex` meta tags and the "Concept by YRB Nova" badge

## Sources
Contact details, hours, charity no. 1097702 and the Tenant Engagement Strategy co-production: Sandwell Council Information Point & tenant engagement pages, Charity Commission register.
