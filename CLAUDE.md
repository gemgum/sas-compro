# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page company profile ("compro") for **PT Sarana Artha Solusi**, trading as
**Sarthlutions** — an Indonesian firm selling cyber security, software development,
AI agent development, and IT procurement. Tagline: *Secure. Smart. Scalable.*

```
README.md                               how to run/edit it, for a human
TODO.md                                 audit findings, ranked — read before "is this done?"
check.mjs                               structural checks over index.html
test-marquee.mjs                        runs app.js against a stub DOM — the D1/D2/D3 behaviours
serve.mjs                               dependency-free static server, localhost only
index.html                              the whole site — every section lives here
assets/tailwind.src.css                 build input: @import + the @theme tokens
assets/tailwind.css                     BUILT — never edit by hand, `npm run css` overwrites it
assets/style.css                        hand-written: gradients, dividers, service card, marquee, nav
assets/app.js                           menu, form guard, language switch, marquee drag, nav scrollspy
assets/logo.webp                        the PT lockup, client-supplied master — keep full size
assets/logo-nav.webp                    160px-tall derivative, the one the page loads
assets/{favicon,apple-touch-icon,og}.png  generated from the logo, see *Regenerating the icons*
Company Profile Sarthlutions - EN.docx  the client's own profile deck — content source
```

**There is a build step now.** Tailwind used to compile in the browser from a CDN
script; it is a one-shot CLI build instead (audit item C1). `npm i` once, then:

```bash
npm run css          # assets/tailwind.src.css → assets/tailwind.css, minified
npm run css:watch    # same, rebuilding on change
npm test             # test-marquee.mjs + check.mjs, exits 1 on failure
npm run serve        # node serve.mjs → http://localhost:8000
```

**Adding a Tailwind class to `index.html` does nothing until you re-run `npm run css`.**
The scanner reads `index.html` (declared via `@source` in the input file) at build time,
so an unbuilt class is silently dead — this is the single easiest way to be confused by
this repo now. `node_modules/` is gitignored; `assets/tailwind.css` is committed so the
site still works for anyone who just opens `index.html`.

**The .docx is the authority on company copy.** Section text (about, vision, mission,
values, service descriptions, the five-step method, why-choose-us, competencies,
contact details) was translated from it into Indonesian. When copy is disputed, read
the docx rather than guessing — extract it with:

```bash
unzip -p "Company Profile Sarthlutions - EN.docx" word/document.xml \
| perl -pe 's{</w:p>}{\n}g; s{<w:tab/>}{  }g; s{<[^>]+>}{}g;
            s{&lt;}{<}g; s{&gt;}{>}g; s{&quot;}{"}g; s{&amp;}{&}g' \
| grep -v "^[[:space:]]*$"
```

Headings stay in English (`Our Services`, `How We Work`, `Why Choose Us`) in **both**
languages; only the body copy switches. See *Bilingual copy* below — the docx is the
English side of every string it covers, so translate from it rather than back-translating
the Indonesian.

## What is built

Section headings stand alone — the intro paragraph that used to sit under `Our Services`,
`How We Work`, `Our Clients`, `Why Choose Us`, `Certificate`, `Technology & Competencies`,
and `FAQ` was removed on request. Heading → content gap is a uniform `mt-10`; keep it that
way if a section is added.

Every section below is live in `index.html`. "Source" says where its words came from —
that matters, because roughly half the page is the client's own copy and the rest is
filler waiting to be replaced (see *Placeholders* near the end).

| # | Section | Holds | Source |
|---|---|---|---|
| — | Nav | `assets/logo.webp` lockup (blend-multiply), links, `ID`/`EN` switch |  |
| — | Hero (`#top`) | full-viewport gradient: eyebrow, `SARTH`+`LUTIONS` wordmark, tagline, four-service line, two CTAs. No scroll cue — removed, do not add one back | docx cover |
| 1 | About Us (`#tentang`) | 3 paragraphs + rotated photo collage, stats `<dl>`, 3 pillars, Vision, Mission, 5 Values | docx §01–02 |
| 2 | Our Services (`#layanan`) | 4 `.svc-card`s with line-art icons and tag rows | docx §03 |
| 3 | How We Work (`#alur`) | 5 numbered steps: Discover → Design → Develop → Deliver → Optimize | docx §04 |
| 4 | Our Clients (`#klien`) | gradient block, drag-scrollable strip of 17 real logos in `assets/clients/`; also the top-level "Our Clients" nav item | primevora.id (same owner) |
| 5 | Why Choose Us (`#keunggulan`) | 4 differentiator cards | docx §05 |
| 6 | Certificate (`#sertifikat`) | gradient block, second logo marquee — 12 badges in `assets/certs/` | primevora.id (same owner) |
| 7 | Technology (`#teknologi`) | 9 competency chips + standards block | docx §08 |
| 8 | FAQ (`#faq`) | 7 `<details>` + illustration; the "contact us" link lives inside the cost answer | **invented** |
| 9 | CTA | gradient block, "Ready when you are" — CTA only now, the contact block moved out | docx CTA page |
| 10 | Contact Us (`#kontak`) | cream section: heading + the form alone, capped at `max-w-3xl` | docx contact page |
| — | Footer | 3 columns: Company (address/email/phone), Our Service, Support. The **Social Media** column and its inline `<symbol>` sprite were removed — the four icons were all `href="#"` and the accounts do not exist yet; a `<!-- SOSIAL -->` comment marks the spot, and commit `41456ce` still has the markup | Figma template |

## Not building: a PDF export

A PDF version came up twice and was dropped both times. Do not start one unless it is
asked for again. If it is, there are two different jobs and they need to be told apart
before any code is written:

- **print-to-PDF of this page** — a `@media print` block: hide nav/forms/scroll cue,
  force `print-color-adjust: exact` so the gradients and waves survive, set
  `break-inside: avoid` per section. Cheap; output is a long web page on paper.
- **a separate A4 deliverable** — its own layout, page furniture, cover. That is closer
  to rebuilding the docx than to styling this page, and it is not a print stylesheet.

## Running it

`npm run serve`, then http://localhost:8000. **The toolchain is Node only — no Python.**
`serve.mjs` is a ~50-line static server with no dependencies (binds `127.0.0.1`, refuses
dotfiles and `node_modules`); `check.mjs` and `test-marquee.mjs` are the lint/test stand-in.

Needs network at runtime: Google Fonts (Outfit) and the remaining `picsum.photos`
placeholder images. Everything else — CSS, JS, all logos, the icons — is local.

### Regenerating the icons

`assets/favicon.png`, `assets/apple-touch-icon.png` and `assets/og.png` are derived from
`assets/logo.webp`: the favicon pair is the **shield only** (the lockup's wordmark is
illegible at 32px), cropped at the widest blank row between shield and wordmark, with
white knocked out to transparent; the OG card is the full lockup centred on cream at
1200×630. If the logo is ever replaced, regenerate all three rather than scaling the new
file directly.

### The check to run after editing `index.html`

```bash
npm test              # test-marquee.mjs + check.mjs
```

Nothing here is compiled by hand, so structural mistakes fail silently. `check.mjs`
catches the ones that have actually happened: duplicate ids, dead anchors, unbalanced
tags, a `data-en` that would clobber nested markup, a missing local file, `OWNER` drifting
out of sync (or out of document order), a marquee list that is no longer written twice,
and — the quietest of all — **a Tailwind class that was never built**. Add a case to it
rather than inventing a new one-off snippet.

`test-marquee.mjs` is the other half: it loads `assets/app.js` with `new Function` over a
stub DOM and drives the marquee — visibility, motion preference, screen width, thousands
of frames. It exists because none of that is visible in the markup, and all three bugs it
covers only appear on a particular screen or a particular OS setting. Every assertion in
it was checked by mutating `app.js` until it failed; keep that habit if you add one.

## Brand colors are defined in TWO places

This is the one thing that will bite you. Changing a brand color means editing both:

| Where | Names | Consumed by |
|---|---|---|
`.g-band` is gone, and so is the gradient-on-gradient problem it was written for: the
contact block moved out of the CTA section entirely and is now a **cream** section, so
the CTA's closing `.wave` carries the only boundary. Its text went back to navy/soft —
it had been white for the one revision it spent on a gradient.

`assets/logo.webp` is an RGB WEBP with a **white plate, no alpha**. `.brand-logo` sets
`mix-blend-mode: multiply` so the plate melts into the cream header instead of showing
as a box — no re-cut file needed. That trick only works on a light background: putting
this logo on `.g-foot` or `.g-hero`'s dark end needs a real transparent or knocked-out
version.

| `assets/style.css` `:root` | `--navy --navy-deep --navy-mid --teal-deep --teal --cream --soft` | the hand-written classes: `.g-hero .g-band .g-foot .squiggle .svc-card .marquee .nav-link` |
| `assets/tailwind.src.css` `@theme` | `--color-blue --color-blue-deep --color-teal --color-cream --color-soft --color-ink` | Tailwind utilities: `text-blue`, `bg-blue`, `text-soft`, `bg-cream`, … |

`--color-teal` (`#19b1b4`) is **not a text colour** — it is 2.6:1 on cream, which fails
WCAG AA. Text that needs to read as teal uses `--color-teal-deep` (`#21758b`, 5.17:1);
`--color-teal` stays for borders, the squiggle, and card accents. `--soft` is `#69777d`
for the same reason — the original `#98a4a9` was 2.5:1 behind roughly every paragraph on
the page. Re-check any new colour pair against 4.5:1 before using it for text.

`.g-foot` (CTA block + footer) ends at **`#17808f`**, not `--teal` `#19b1b4`: white text on
`#19b1b4` is 2.6:1. At `#17808f` solid white is 4.65:1, which is why every `text-white/85`
and `text-white/90` in those two blocks was flattened to solid `text-white` — at 85% opacity
the blend drops back to 3.8:1. Keep new footer text solid.

`--color-blue` is **navy** (`#1b3a6b`), not blue — the name is left over from an
earlier palette and is used by hundreds of utility classes, so it was not renamed.

A third spot: the page background color is hardcoded as `fill="#fbfdfd"` inside
each wave `<svg>` (5 of them). It must equal `--cream` or the waves show a seam. A fourth:
`<meta name="theme-color">` is also `#fbfdfd`, because the top of the page is the cream
header — set it to the gradient navy and Android paints a mismatched bar above it.

**Deploying to another domain** means changing three values together — `canonical`,
`og:url`, `og:image` — flagged by a `<!-- DOMAIN -->` comment in `<head>`. They must be
absolute (crawlers do not run JS or guess a host); `check.mjs` fails if they disagree.

Palette source: sampled from the client's logo — navy `#1b3a6b` → teal `#19b1b4`.

## Layout grammar

Sections are either **cream** (the page background) or a **gradient block**
(`.g-hero`, `.g-band`, `.g-foot`). Two dividers, and which one to use is not a
style choice:

- **`.wave`** — organic blob, only where a gradient block meets cream. Placed at the
  *bottom* of a gradient section, filled cream, so cream carves upward into it.
  `.wave--flip` + the mirrored path goes at the *top* of a gradient block that
  follows a cream section (see `#sertifikat`).
- **`.squiggle`** — three crossing sine strokes, only between two cream sections.
  Its `path` needs `vector-effect: non-scaling-stroke`; the SVG uses
  `preserveAspectRatio="none"`, which would otherwise smear the stroke width.

Current order: hero (gradient) → about + stats + vision/mission/values → *squiggle* →
services → *squiggle* → workflow → clients (gradient) → why-choose-us → certificate
(gradient) → technology → *squiggle* → FAQ → CTA (gradient) → contact (cream) → footer
(gradient).

`#klien` and `#sertifikat` are both `.g-hero` blocks, so their own waves carry every
boundary they touch — no `*squiggle*` sits next to either, nor between the certificate
and the FAQ. A squiggle there would divide cream from cream with nothing in between.

## JS contracts (`assets/app.js`)

No framework, five small behaviours in file order: mobile-menu close, contact-form
submit guard, language switch, logo marquees, nav underline.

**Mobile menu** — `<details>` in the header does not close itself when a link inside it
is chosen, so the panel stays over the section just navigated to. One delegated click
listener sets `open = false`. Scoped to `header details`; the FAQ accordions are also
`<details>` and must keep their own behaviour.

**Contact form guard** — the form has no backend and `action="#"` would POST to the same
URL, reloading the page and wiping every field. The submit handler calls
`preventDefault()`, reveals `#kirim-status`, and leaves the typed text in place so it can
still be copied. Delete the handler only together with a real endpoint. A `<noscript>`
block covers the JS-off case, where that POST still happens.

Its fields carry **visible** labels, not `sr-only` ones, and no placeholders. The earlier
version had it backwards: the only visible text was an English placeholder (`Your Name`,
`Subject`) on an Indonesian page, the language switch could not reach it, and the label
vanished the moment anyone typed. Visible label + no placeholder removes all three
problems and needs no placeholder-translation machinery.

**Escape on the More dropdown** — the dropdown is opened by CSS (`group-hover` /
`group-focus-within`), so there is no JS state to close. Escape just blurs the active
element, which drops `:focus-within`. Do not add `aria-expanded`: nothing tracks a state
it could report truthfully. `aria-haspopup` is on the trigger and is accurate.

**Nav underline** — the active nav item is *not* hardcoded. An `IntersectionObserver`
watches every section id in the `OWNER` map and sets `aria-current` on the matching
`.nav-link`; the underline itself is drawn by `.nav-link[aria-current="true"]` in
`style.css`. Nav is `Home · Services · Our Clients · About Us · More ▾ · Contact`:
`About Us` is a plain link owning only `#tentang`, and the sections behind the **More**
dropdown (`keunggulan`, `sertifikat`, `teknologi`, `faq`) map to `#alur` — the dropdown
trigger's own href — so exactly one top-level item is ever active. `OWNER`'s keys are
kept in **document order**; the `.pop()` that picks the current section relies on it. **Adding a section with an id means adding it to
`OWNER`**, or the underline sticks on the previous item while that section is on screen.
`check.mjs` verifies both directions, plus the key order.

## Bilingual copy (ID / EN)

The page ships **Indonesian in the HTML** and carries the English on a `data-en`
attribute of the same element — no duplicated markup, no second file. `app.js` snapshots
each element's `innerHTML` on load and swaps `innerHTML` against `data-en`; the choice
is remembered in `localStorage` under `lang` and sets `<html lang>`. The `ID`/`EN`
buttons in the nav are `[data-lang]`, styled from `aria-pressed` like every other toggle
on this page.

Consequences worth knowing before editing copy:

- **`data-en` replaces the whole element.** Never put it on an element that also holds
  markup you care about — the FAQ `<summary>` (it holds the `+`/`×` span), the About Us
  lead paragraph (it holds the bolded company name), the FAQ intro (it holds a link).
  Those have a plain `<span data-en="…">` wrapped around the *text* instead — the FAQ
  cost answer is one of them, since it ends with the link to `#kontak`. The one
  deliberate exception is the contact-band address, whose `data-en` carries its `<br>`.
- Section headings, service names, the five step names, the values, the certificate
  names, and the technology chips are English in both languages, so they carry no
  `data-en` at all.
- Adding a paragraph means adding its `data-en` in the same edit, or it will stay
  Indonesian when the page is switched to English.

## Logo marquees (`#klien`, `#sertifikat`)

Two of them, same machinery: `.marquee` in `#klien` for client logos and
`.marquee.marquee--certs` in `#sertifikat` for certification badges. `app.js` runs
`querySelectorAll('.marquee').forEach(…)`, so each strip keeps its own `pos`/`drag` —
adding a third needs no JS change. `.marquee--certs` only overrides the image size
(badges are squarer than wordmarks).

Each one is a native scroll container, not a CSS keyframe animation. `.marquee` is
`overflow-x: auto` with the scrollbar hidden; `app.js` advances `scrollLeft` by 0.5px
per frame and the same `put()` wraps it modulo **half the scrollWidth** — which only
lines up because the 17 `<li>` are written **twice** in `index.html` (second copy
`aria-hidden`, so a screen reader reads each client once). Add or remove a logo in
*both* copies or the loop jumps.

A seamless wrap also needs half the track to be at least as wide as the container,
otherwise `scrollLeft` clamps at the end and the strip stalls before jumping back. Two
copies are not enough on a very wide screen, so `fill()` **doubles** the track (never
appends a single copy — that would break "half the track is a whole number of copies")
until `scrollWidth >= clientWidth * 2`, and re-checks on resize. The rAF loop is gated on
an `IntersectionObserver` and on `prefers-reduced-motion`, both live: off-screen strips
schedule no frames at all, and changing the OS motion setting stops or restarts them
without a reload.

Doing it through `scrollLeft` instead of `translateX` is what makes click-drag
possible: pointer events just set the same value. `touch-action: pan-y` hands
horizontal panning to that handler while leaving vertical page scroll to the browser,
and `prefers-reduced-motion` skips the rAF loop only — dragging still works.

It does **not** pause on hover — asked for twice, once to add it and once to take it
back out. Only an active drag holds it. Hovering scales the logo under the cursor to
`1.18`, which is why `.marquee` needs its `padding: 22px 0` — the container clips, and
the enlarged logo would be cut off without that room. Logos stay in full colour: no
grayscale filter, asked for explicitly. Both strips sit on a `.g-hero` block, so neither
needs a background of its own.

Below 640px a media query shrinks both strips — logo height, badge height, track gap and
container padding — so more than a logo or two fits on a phone.

Both logo sets are the client's own, lifted from **primevora.id** (same owner, a Flutter
app — the file list came from its `assets/AssetManifest.bin.json`, base64 inside JSON).

Clients are not split by service line: the source site does not say which client was
software work and which was a pentest, so the earlier two-group / tab layout is gone.
Bringing categories back needs that mapping from the client, not a guess.

The certificate strip replaced 13 text cards (name / long name / issuer). primevora has
no badge for **CCEP** or **C3SA**, so those two are not in the strip — see the
`<!-- VERIFIKASI -->` comment above it. `emapt`, `oscp`, and `iso_27001` exist there too
but were not on the user's list, so they were not brought over.

## Service cards (CSS, not JS)

They follow gamatecha.com, whose CSS was read rather than
guessed at. The shape is: index (`01 / 04`) → 100px line-art icon in normal flow →
26px title → body → tag row above a dashed top border. Hover does three things at once,
and all three are the point — dropping any of them is what "nothing happens on hover"
meant:

1. the card lifts, `translateY(-6px)`, on `cubic-bezier(.2,.7,.2,1)` over `.4s`
2. a 1px teal gradient ring fades in on the border via a `::after` mask (`mask-composite:
   exclude` paints only the border box, so no second element is needed)
3. the icon warms from `rgba(27,58,107,.30)` to solid navy and does
   `rotate(-4deg) scale(1.05)`

The icons are 120×120 two-tone line art drawn in-file: main shape on `currentColor` so
it inherits the hover colour change, accent details on `.svc-card__accent` (teal, fixed).
Keep both nodes if you redraw them.

An earlier version of these cards used photographs behind a bottom-up navy overlay
(`.g-card`). That rule had no users left once the icons landed and is deleted — a future
photo card needs it written again.

**No carousels left.** Every `.rail` (scroll-snap track + `[data-rail]` arrow buttons)
is gone, so the `.rail`/`.arrow` CSS and the `scrollBy` handler were deleted with the
last one. Re-adding a carousel means bringing all three back — a flex track with
`scroll-snap-type: x mandatory`, `scroll-snap-align: start` on the children, and two
buttons whose only job is `rail.scrollBy({left: dir * rail.clientWidth * 0.8})`.

## Deliberate native-platform choices

These replaced libraries on purpose. Don't swap them back:

- `<details>` — FAQ accordion and the mobile menu (both work with JS disabled)
- OpenStreetMap `<iframe>` — the contact map, right-hand column of `#kontak` (no API key, no JS)
- ~~Inline `<symbol>` sprite in the footer~~ — gone with the Social Media column. If the
  icons come back, the sprite has to come back **inline in the document**: Chrome does not
  resolve `<use>` against an external SVG file.

## Sections deliberately removed

**Testimonials**, **Our Partners**, and **Our Team** were built, then deleted. All three
invented credibility the company could not point to: quotes from clients who never said
them, partner logos, and five named engineers with stock-photo faces. The docx names no
individuals — it says "15+ certified professionals" and nothing more.

**Our Clients** replaced Our Team in the same slot (`#klien`), carrying the docx's own
structure: two groups, *Software Development* and *Penetration Testing*, nine
`[ CLIENT LOGO ] / [ Client Name ] / [ Project / Scope ]` placeholders each. They are
deliberately styled as dashed empty boxes so an unfilled one is obvious on the page
rather than passing as a real logo. Fill them from real engagements; do not seed
examples.

Testimonials can come back against a named client who agreed to be quoted — it used a
`.rail` of white cards (photo / name / role / quote), which now also needs the rail
CSS restored (see above). It sat between cream sections, so it needs a `*squiggle*`
divider on each side.

The **stats strip** came out for the same reason, then went back in with the docx's own
numbers (50+ projects, 30+ organizations, 15+ certified professionals). It now lives
inside the About section as a centred `<dl>` that stays **3 columns at every width** (not
`grid-cols-1 sm:grid-cols-3`) — the three figures are meant to read as one row on a phone
too, so `dt`/`dd` carry small-then-large type instead of stacking. Those figures are the client's
claim, not an invention — but they still date from the docx, so re-check them before a
launch rather than assuming they are current.

## Placeholders still in the page

Everything below is invented filler that the docx does not cover. Replace before launch:

- the remaining `picsum.photos` images (About Us collage). The **Portfolio** section
  is gone — the docx has no portfolio; `#klien` took over its slot and its top-level
  nav item, and now carries real logos instead of the docx's blank placeholders
- the **FAQ**: not in the docx at all. The invented rupiah figures are gone — the cost
  answer now points at the contact form and `contact@sarthlutions.id` instead. The
  durations it still quotes (5–10 days for a web app, 2–3 weeks for an internal
  network, 4-hour incident response) are the remaining guesses
- the FAQ illustration — a hand-drawn SVG standing in for the Figma asset
- the contact form, which has no backend and says so on the page

Gone for good, not placeholders: the OSM map, the Join Updates photo collage, the footer
**Legal** and **Subscription** columns, and the footer's Mail/Website lines. The section
formerly titled *Join Updates* is now *Contact Us*; note that its right column repeats
"Contact Us" as a sub-heading — asked for that way.

Contact details now live in **one** place: the footer's Company column — address, then
`contact@sarthlutions.id`, then a marked phone placeholder. `#kontak` itself is the form
and nothing else; the Office block, the Social Media block and the map were all removed
from it across successive passes. The office hours line (`Senin–Jumat · 09.00–18.00 WIB`)
is gone from the page entirely.

The **phone number `+62 21 5021 8899` is made up.** The docx has none and neither does
primevora; a dummy was asked for explicitly as a stand-in. It carries a `<!-- DUMMY -->`
comment above it — that comment is the only thing separating it from a real number on a
live page, so replace it before launch and do not delete the marker until you do.

Certificate names for **CM-Pen**, **CCEP**, and **C3SA** are unconfirmed — the page
prints `Penerbit — mohon dilengkapi` for their issuers, and there is a
`<!-- VERIFIKASI -->` comment above the grid.

## Design provenance

The layout follows a Figma community file (`oelph2JW9pz5VoBwZGlRPT`) that this
account has **view-only** access to — the Figma MCP tools return "no edit access",
so the design was reconstructed from screenshots plus pixel-sampled colors. If a
future task needs exact spacing or the original assets, the file has to be
duplicated into the user's own drafts first (the file key must change).
