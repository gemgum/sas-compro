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
assets/style.css                        hand-written: dark blocks, surfaces, section blends, hero art, service card, marquee, nav
assets/app.js                           menu, Home-without-hash, language switch, marquee drag, nav scrollspy, scroll progress
assets/logo.webp                        the "S" mark, transparent master (from client's Logo1.png) — keep full size
assets/logo-nav.webp                    160px-tall derivative, the one the nav loads
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

Section headings are **centered** (except About Us, which sits in a two-column layout),
and most carry a one-sentence description under them (`mt-4 text-center text-lg`,
bilingual via `data-id`): Our Clients, Our Services, Why Choose Us, Certified Expertise
(`text-white/80` on the dark block), Technology & Competencies, FAQ, and the CTA. How We
Work has none. **Each description must fit on one line at desktop width, in both
languages** — asked for; measured at 1280 and 1024 px. That is why Services, Certificate
and CTA copy was tightened from the docx wording (e.g. the docx's Services intro ran two
lines) and the Indonesian Why Choose Us line was shortened. Keep new ones under ~100
characters. Copy is kept **market-neutral** on request: the Our Clients line and the
Vision, the About lead ("a technology company", was "an Indonesian technology company")
and both meta descriptions ("for growing organizations") no longer say "Indonesia" — the
docx Vision read "…Indonesia's digital ecosystem…". Location stays where it is a fact:
the hero eyebrow (South Jakarta), the footer address, the globe's Jakarta marker. Heading (or description) → content gap is a uniform `mt-10`.

Every section below is live in `index.html`. "Source" says where its words came from —
that matters, because roughly half the page is the client's own copy and the rest is
filler waiting to be replaced (see *Placeholders* near the end).

| # | Section | Holds | Source |
|---|---|---|---|
| — | Nav | `.brand`: `assets/logo-nav.webp` "S" mark + text wordmark `Sarth`/`lutions` in `--logo-blue`/`--logo-cyan` (sampled from the new logo; shrinks ≤360px so it clears the `ID`/`EN` switch), links, `ID`/`EN` switch |  |
| — | Hero (`#top`) | full-viewport **dark** block (`.g-dark`): eyebrow, `SARTH`+`LUTIONS` wordmark, tagline, two CTAs ("Start a consultation" → WhatsApp, "Explore our services" → `#services`; the second was "See our clients" until Our Clients moved directly under the hero); right column (`lg+` only) is `.hero-art` — a **3D dotted Earth** on `<canvas class="hero-globe">` drawn by `app.js`, nothing else on it: land dots only (continents from `LAND`, a 192×96 equirectangular bitmap rasterised once from world-atlas `land-110m` / Natural Earth and inlined as base64, ~3 KB), atmosphere glow, a pulsing **Jakarta** marker (its "Jakarta, Indonesia" label was removed on request), and data arcs travelling from Jakarta to regional and global cities. The **four services orbit it as satellites**: the Services-card icons (same paths, as `Path2D`) in small navy badges on a tilted dashed ring, one lap ≈ 28 s, brightness eased by depth (smoothstep) so icons fade rather than snap when they cross from back to front — icons only, no text (the names are in the line under the tagline). The ring's back half and back icons are drawn *before* the globe body, which is fully opaque so it hides them; the front half is drawn after. Chosen over replacing the globe with a service carousel: the globe stays the anchor, the orbit adds the "what we do". It **rocks ±55° around Jakarta** on a sine wave rather than spinning — a full spin hid Jakarta half the time. No library; rAF only while on screen; one still frame under reduced motion. The "S" logo and the four service chips were removed from it on request (the logo duplicated the navbar, the chips covered the map); the four-service line under the tagline now shows at every width. Below `lg` the chips are hidden and a plain four-service line (`lg:hidden`) takes their place. No scroll cue — removed, do not add one back | docx cover |
| 1 | Our Clients (`#clients`) | right after the hero (strongest proof first); light `--surface-alt` section, drag-scrollable strip of 27 real logos in `assets/clients/` (Asaba and Timor Telecom were swapped out for Qoin Digital Indonesia, Baharkam Polri and VocaGame on request — the first two from the Primevora repo, `vocagame.webp` supplied by the user at 96×51, small enough to look soft when upscaled to 56px); also the top-level "Our Clients" nav item | primevora.id (same owner) |
| 2 | Our Services (`#services`) | 4 `.svc-card`s with line-art icons and tag rows | docx §03 |
| 3 | About Us (`#about`) | 3 paragraphs + an inline isometric SVG illustration (`.iso-art`: platform with shield, code window, AI chip, device box — the four services), stats `<dl>`, 3 pillars, Vision, Mission, 5 Values | docx §01–02 |
| 4 | Why Choose Us (`#why-us`) | 4 differentiator cards | docx §05 |
| 5 | Certified Expertise (`#certified-expertise`; titled "Certificate" / `#certificate` until renamed on request) | dark `.g-dark` block; second logo marquee — 12 badges in `assets/certs/`, bare on the dark with a thin white halo | primevora.id (same owner) |
| 6 | How We Work (`#how-we-work`) | 5 numbered steps: Discover → Design → Develop → Deliver → Optimize | docx §04 |
| 7 | Technology (`#technology`) | 9 competency chips (the Standards & Frameworks block was removed on request) | docx §08 |
| 8 | FAQ (`#faq`) | 7 `<details class="faq">`, **all closed on load** — no `open` attribute, asked for (animated open/close, rotating +/× icon) + an isometric `.iso-art--faq` illustration (Q&A laptop, question/answer bubbles, knowledge-base cards; its viewBox is fitted to the drawing's measured `getBBox()` and the column is `460px` with `lg:gap-0`, so the drawing sits dead-centre between the list and the container edge — 47px each side — at roughly the list's height); the "contact us" link lives inside the cost answer | **invented** |
| 9 | CTA (`#contact`) | dark `.g-foot` block, **carries `#contact`** since the Contact Us form section was removed — every Contact link lands here; its button opens WhatsApp; "Ready when you are" — CTA only now, the contact block moved out | docx CTA page |
| — | Footer | 3 columns: Company (address/email/phone), Our Service, Support. The **Social Media** column and its inline `<symbol>` sprite were removed — the four icons were all `href="#"` and the accounts do not exist yet; a `<!-- SOSIAL -->` comment marks the spot, and commit `41456ce` still has the markup | Figma template |

## Not building: a PDF export

A PDF version came up twice and was dropped both times. Do not start one unless it is
asked for again. If it is, there are two different jobs and they need to be told apart
before any code is written:

- **print-to-PDF of this page** — a `@media print` block: hide nav/forms/scroll cue,
  force `print-color-adjust: exact` so the dark blocks and section blends survive, set
  `break-inside: avoid` per section. Cheap; output is a long web page on paper.
- **a separate A4 deliverable** — its own layout, page furniture, cover. That is closer
  to rebuilding the docx than to styling this page, and it is not a print stylesheet.

## Running it

`npm run serve`, then http://localhost:8000. **The toolchain is Node only — no Python.**
`serve.mjs` is a ~50-line static server with no dependencies (binds `127.0.0.1`, refuses
dotfiles and `node_modules`); `check.mjs` and `test-marquee.mjs` are the lint/test stand-in.

Needs network at runtime: Google Fonts (Outfit) only. Everything else — CSS, JS, all
logos, the icons, the About illustration — is local. (The `picsum.photos` collage is gone.)

### Regenerating the icons

`assets/favicon.png`, `assets/apple-touch-icon.png` and `assets/og.png` are derived from
`assets/logo.webp`: the favicon is the whole mark on transparent, the apple-touch icon
the same on cream (iOS paints alpha black), and the OG card the mark centred on cream at
1200×630. If the logo is ever replaced, regenerate all three rather than scaling the new
file directly.

### The check to run after editing `index.html`

```bash
npm test              # test-marquee.mjs + check.mjs
```

Nothing here is compiled by hand, so structural mistakes fail silently. `check.mjs`
catches the ones that have actually happened: duplicate ids, dead anchors, unbalanced
tags, a `data-id` that would clobber nested markup, a missing local file, `OWNER` drifting
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
`assets/logo.webp` is the client's `Logo1.png` (RGB on a white plate) with the white
keyed out to real alpha — colour-to-alpha with the edges un-mixed, so it has no white
fringe and works on the dark blocks too. The old `.brand-logo` multiply-blend trick is
gone with the plate.

| `assets/style.css` `:root` | `--navy --navy-deep --navy-mid --teal-deep --teal --cream --soft --ink-dark --surface-alt` | the hand-written classes: `.g-dark .g-foot .surface-alt .from-* .to-* .hero-art .svc-card .marquee .nav-link` |
| `assets/tailwind.src.css` `@theme` | `--color-blue --color-blue-deep --color-teal --color-cream --color-soft --color-ink` | Tailwind utilities: `text-blue`, `bg-blue`, `text-soft`, `bg-cream`, … |

The `teal` names now hold **cyan** from the "S" logo — kept so the hundreds of utility
classes did not need renaming. `--color-teal` (`#18a8e8`) is **not a text colour** — it
is 2.6:1 on cream, which fails WCAG AA. Text that needs to read as cyan uses
`--color-teal-deep` (`#0a64a0`, 5.6:1 on cream, 5.3:1 on alt); `--color-teal` stays for
borders, the progress bar, and card accents. `--soft` is `#56667a` (5.3:1 on cream, 4.9:1
on alt). Both were darkened when the background went from near-white `#fbfdfd` to the
softer `#eef3f8` ("white is too bright"). Re-check any new colour pair against
4.5:1 before using it for text.

`.g-foot` (CTA block + footer) runs `--ink-dark` `#071a3d` → navy `#0b3a82` → `#0848c8`,
never out to the bright cyan: white on `#18a8e8` is 2.7:1, on `#0848c8` 7.6:1. Every `text-white/85` and
`text-white/90` in those two blocks was flattened to solid `text-white` for the same
reason — keep new footer text solid.

`--color-blue` is **navy** (`#0b3a82`), not the logo's bright blue — the name is left
over from an earlier palette. The bright blue `#0848c8` is `--navy-mid` / `--logo-blue`.

A third spot: `<meta name="theme-color">` is `#eef3f8` (= `--cream`), because the top of the page is the
cream header — the hero below it is dark, but the header is not; set it to navy and
Android paints a mismatched bar above a light header. (The waves that used to hardcode
`fill="#fbfdfd"` are gone; the section blends use `var(--cream)` instead.)

**Deploying to another domain** means changing three values together — `canonical`,
`og:url`, `og:image` — flagged by a `<!-- DOMAIN -->` comment in `<head>`. They must be
absolute (crawlers do not run JS or guess a host); `check.mjs` fails if they disagree.

Palette source: sampled from the "S" logo (`assets/logo.webp`) — navy `#0b3a82` → blue
`#0848c8` → cyan `#18a8e8`. The earlier navy `#1b3a6b` → teal `#19b1b4` came from the old
shield lockup. The rgba() values in `.g-dark`, `.hero-art` and `.iso-art` carry palette
values too — grep for them when the
palette moves.

## Layout grammar

Light in the middle, dark at the top, dark once in the middle as an anchor, dark at the
bottom — the redesign after the "is this right for an IT company?" audit. Three kinds of
surface:

- **cream** `--cream` `#eef3f8` (the page background, a soft blue-grey — near-white was
  judged too bright) and **`--surface-alt`** `#dde6f3` (deepened from `#e5ecf5` so neighbours
  read as different; `--soft` text still 4.66:1 on it) — light
  sections alternate between the two, so neighbouring sections never share a colour.
- **`.g-dark`** — `--ink-dark` → navy with a cyan radial glow and a masked 48px
  blueprint grid (`::before`). Hero and `#certified-expertise`.
- **`.g-foot`** — calmer horizontal navy gradient, no grid. The CTA only.
- **`.site-foot`** — the footer: flat `--ink-dark`, darker than the CTA, with a 1px
  white/10 top border. Asked "change the footer or the section above it?" — the
  footer, so the CTA stays the last highlight and the footer recedes as information.

**No divider lines — sections blend.** Each surface class (`.g-dark`, `.g-foot`,
`.surface-alt`) paints two extra gradient layers on top of its own background: from
`--from` at its top edge and to `--to` at its bottom edge, each `--fade` (200px) long,
`transparent` by default. The alpha follows a smoothstep curve (flat at both ends — a
linear ramp leaves a visible edge where it starts), and on dark blocks a light-blue
`--tint` band sits under it: cream → navy straight through sRGB goes muddy grey, the tint
makes it pass through sky blue instead. All of it lives in `--blend`. Modifiers set them: `.from-cream`, `.from-alt`, `.to-cream`.
Only one side of each boundary fades — dark blocks fade into their light neighbours, alt
sections fade from/to cream; cream sections are just the body background and need no
class. Because the blend lives inside the section's own background, there is no seam.
**Keep text out of the 200px fade zone** in dark sections (white text on a half-cream
band is unreadable) — that is why the certificate, CTA and footer carry extra top/bottom
padding.

History, so nobody re-litigates it: organic `.wave` / `.squiggle` dividers came out in
the "right for an IT company?" redesign; diagonal `clip-path` slants replaced them; those
became straight edges with a gradient *line*; and that was corrected to what was actually
meant — the section colours themselves blending into each other.

Current order (reordered on request — proof first, nav order = page order): hero (dark,
to-alt) → clients (alt, to-cream) → services (cream) → about (alt, from/to-cream) →
why-us (cream) → certified-expertise (dark, from-cream, to-alt) → how-we-work (alt, to-cream) →
technology (cream) → FAQ (alt, from-cream) → CTA `#contact` (dark, from-alt) → footer
(`.site-foot`, butts straight onto the CTA — no fade). Neighbours never share a surface.
Adding a section means picking its surface so that holds, and setting the fade
modifiers (`.from-cream`, `.from-alt`, `.to-cream`, `.to-alt`) against its neighbours.

## JS contracts (`assets/app.js`)

No framework, eight small behaviours in file order: mobile-menu close, Home without
`#top`, language switch, logo marquees, nav underline, scroll progress, scroll reveal,
hero globe. (A seventh, the
contact-form submit guard, went out with the form.)

**Home without `#top`** — every `a[href="#top"]` (nav Home, the logo, the mobile menu's
Home) scrolls to the top in JS and `replaceState`s the hash away, so the address bar
stays clean, as asked. The `href` stays `#top` so it still works with JS off, and `OWNER`
still keys the Home underline on `'#top'`.

**Mobile menu** — `<details>` in the header does not close itself when a link inside it
is chosen, so the panel stays over the section just navigated to. One delegated click
listener sets `open = false`. Scoped to `header details`; the FAQ accordions are also
`<details>` and must keep their own behaviour.

**Escape on the More dropdown** — the dropdown is opened by CSS (`group-hover` /
`group-focus-within`), so there is no JS state to close. Escape just blurs the active
element, which drops `:focus-within`. Do not add `aria-expanded`: nothing tracks a state
it could report truthfully. `aria-haspopup` is on the trigger and is accurate.

The panel opens `mt-4` below its `<li>`, just under the header's bottom edge. Three
things keep the hover alive on the way down from "More" — each was a real bug:

- a transparent `before:` strip of the same 16px bridges the gap;
- `.scroll-progress` is `pointer-events: none` — it sits exactly in that gap and used to
  steal the hover, closing the menu mid-reach;
- open/close lives in **`.dropdown`** in `style.css`, not Tailwind utilities: closing
  waits 250ms, and `visibility` is delayed with it. Tailwind's `transition` utility does
  not cover `visibility`, so the old version went hidden instantly — and a hidden panel
  cannot be hovered back, so a diagonal cursor path that briefly left the `<li>` lost it.

Verified by driving a real mouse path through CDP (Input.dispatchMouseEvent), not by
reading the CSS: the panel stayed visible along the whole path and the click landed.

**FAQ accordion** — `.faq` animates `::details-content` from `block-size: 0` to `auto`
(`interpolate-size: allow-keywords` on `:root`), so open *and* close slide where
supported; elsewhere a `@keyframes` fade-in covers opening. Measured in real time, it
eases 60 → 112px over ~400ms both ways. The +/× is one `.faq__icon` whose two bars rotate
135° — no swapped glyphs.

**Nav underline** — the active nav item is *not* hardcoded. An `IntersectionObserver`
watches every section id in the `OWNER` map and sets `aria-current` on the matching
`.nav-link`; the underline itself is drawn by `.nav-link[aria-current="true"]` in
`style.css`. Nav follows page order: `Home · Our Clients · Services · About Us · More ▾ ·
Contact`, and the dropdown lists `Why Choose Us · Certified Expertise · How We Work · Technology ·
FAQ` in page order too. `About Us` is a plain link owning only `#about`; the five sections
behind **More** all map to `#why-us` — the dropdown trigger's own href, and the first of
them on the page — so exactly one top-level item is ever active. The mobile menu lists
every section, in the same order. `OWNER`'s keys are
kept in **document order**; the `.pop()` that picks the current section relies on it. **Adding a section with an id means adding it to
`OWNER`**, or the underline sticks on the previous item while that section is on screen.
`check.mjs` verifies both directions, plus the key order.

**WhatsApp** — eight links carry `data-wa`: one "Discuss this service →" per service card
(`data-wa="cyber|software|ai|procurement"`, each with its own opener naming that service), the hero's "Start a consultation" (it used to
scroll to `#contact`; now one click to the chat, asked for), the CTA button, the footer number, and
`.wa-float` (fixed bottom-right, WhatsApp green, widens into a "Chat on WhatsApp" label on
hover; a pulse ring that `prefers-reduced-motion` turns off). Each opens
`wa.me/628388449080?text=…` with a pre-filled opener that says the visitor came from the
website. The HTML carries the English opener; the language switch rewrites the `text`
param from `WA_TEXT[data-wa][lang]` in `app.js` (empty key = the general opener), so an
Indonesian visitor gets an Indonesian message. A new keyed link needs its entry in `WA_TEXT`.

**Scroll reveal** — content fades in and rises 28px as it scrolls into view; the hero
does the same on load. A tiny inline `<script>` in `<head>` adds `.js-reveal` *before
first paint* (skipped under `prefers-reduced-motion` or without IntersectionObserver),
and `.js-reveal:not(.reveal-ready) main` stays at opacity 0 until `app.js` has tagged
every block in its `REVEAL` selector list with `.reveal` — so nothing flashes visible and
then vanishes. Blocks entering together get a 90ms stagger in document order (capped at
8 steps). If `app.js` never runs, the head script adds `.reveal-ready` after 3s and
untagged content shows. It is a CSS **animation** on `translate`, not a transition on
`transform`: the service cards own `transition` and a `transform` hover, and either
would be clobbered. **A new section's blocks need a selector in `REVEAL`** or they just
appear without the effect (harmless, but inconsistent). Verified in real time via CDP:
74 targets, hero staggered 0/90/180/270/360ms, nothing left hidden after a full scroll.

**Scroll progress** — a 3px `.scroll-progress` bar along the bottom edge of the sticky
header fills left to right with how far the page is scrolled (empty at `#top`, full at
the footer). The gradient (cyan → blue → navy) spans the full width and only its
`clip-path` moves, so each colour stays at a fixed point instead of squashing the way
`scaleX` would. Repainted at most once per frame via rAF, also on resize.

## Bilingual copy (EN / ID)

The site **opens in English** — asked for explicitly. English is the markup in the HTML;
the Indonesian rides on a `data-id` attribute of the same element — no duplicated
markup, no second file, and with JS off the page is English. `app.js` snapshots each
element's English `innerHTML` on load and swaps it against `data-id`; `apply('id')` runs
on load only when `localStorage.lang === 'id'` (a returning visitor who chose it).
`<html lang="en">`, `og:locale` `en_US` with `id_ID` as alternate, and the meta
descriptions are English. The `ID`/`EN` buttons are `[data-lang]`, styled from
`aria-pressed`; `EN` starts pressed. (It used to be the reverse — Indonesian markup with
`data-en` — and was flipped by script: every element swapped, count checked.)

Consequences worth knowing before editing copy:

- **`data-id` replaces the whole element.** Never put it on an element that also holds
  markup you care about — the FAQ `<summary>` (it holds the icon span), the About Us
  lead paragraph (it holds the bolded company name). Those have a plain
  `<span data-id="…">` wrapped around the *text* instead — the FAQ cost answer is one
  of them, since it ends with the link to `#contact`. The one deliberate exception is
  the footer address, whose `data-id` carries its `<br>`. `check.mjs` enforces this.
- Section headings, service names, the five step names, the values, the certificate
  names, and the technology chips are English in both languages, so they carry no
  `data-id` at all.
- Adding a paragraph means writing it in English and adding its `data-id` Indonesian in
  the same edit, or it will stay English when the page is switched to Indonesian.

## Logo marquees (`#clients`, `#certified-expertise`)

Two of them, same machinery: `.marquee` in `#clients` for client logos and
`.marquee.marquee--certs` in `#certified-expertise` for certification badges. `app.js` runs
`querySelectorAll('.marquee').forEach(…)`, so each strip keeps its own `pos`/`drag` —
adding a third needs no JS change. `.marquee--certs` only overrides the image size
(badges are squarer than wordmarks).

Each one is a native scroll container, not a CSS keyframe animation. `.marquee` is
`overflow-x: auto` with the scrollbar hidden; `app.js` advances `scrollLeft` by 0.5px
per frame and the same `put()` wraps it modulo **half the scrollWidth** — which only
lines up because the 27 `<li>` are written **twice** in `index.html` (second copy
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

Both ends of each strip fade out through a `mask-image`: 18% per side (tripled from 6%
on request, so logos drift in and out instead of being sliced at the edge), on an eased
ramp of alpha stops rather than a straight line.

It does **not** pause on hover — asked for twice, once to add it and once to take it
back out. Only an active drag holds it. Hovering scales the logo under the cursor to
`1.18`, which is why `.marquee` needs its `padding: 22px 0` — the container clips, and
the enlarged logo would be cut off without that room. Logos rest **faded grey**
(`grayscale(1)`, opacity .65) and turn full colour on hover — asked for after an earlier
"full colour, no filter" request, so this is the current wish. It sits inside
`@media (hover: hover)`: touch screens have no hover, so there the logos stay in colour.
The client strip sits on the light `--surface-alt`; the certificate strip sits on the
dark `.g-dark`. Badges sit bare on it — light plates behind each one were tried and
removed on request ("no cards") — so each badge gets a thin white `drop-shadow` halo
instead; without it the black lettering of CEH disappears into the navy. The halo is
written into the `@media (hover: hover)` greyscale rule too, since `filter` is one
property and the greyscale rule would otherwise drop it.

Below 640px a media query shrinks both strips — logo height, badge height, track gap and
container padding — so more than a logo or two fits on a phone.

**Client logos are sized per logo, not one height for all.** At a flat 56px a square or
tall mark (Qoin, IDX, Resona, Korlantas) looked tiny next to a wide wordmark (BNI), so each
`<img>` may carry `style="--h:NN"` — its desktop height in px, `round(sqrt(8500 / aspect))`
clamped to 56–96 (aspect from the `width`/`height` attributes). No attribute means 56.
RuangTopup is pinned at 72: it is a solid dark tile and reads heavy at full size.
FlipFlopTV is pinned at 42, its native height — the only source supplied is 190×42 and
broke up when upscaled; chosen over redrawing it. Swap in a larger file when one exists. The CSS
multiplies `--h` by `.68` below 640px, and `max-width` is 240px (160 on mobile) so the
widest wordmarks are not squeezed. A new logo needs its `--h` worked out the same way, in
**both** copies — and its file trimmed to the drawing first, or the margin counts as logo.

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
guessed at. The shape is (the `01 / 04` index above the icon was removed on request): 100px line-art icon in normal flow →
26px title → body → tag row above a dashed top border → "Discuss this service →" WhatsApp link. Each card is `row-span-5` on a `grid-rows-subgrid`, so those five rows line up across the four cards (the dashed rule and the links sit level even if a tag row wraps). Tags use `px-2` and `gap-1.5`: at 1280px the AI card's three tags need 200 of 204 px — `gap-2` wrapped "RAG" by a sub-pixel. On card hover the tags take a faint cyan border. Hover does three things at once,
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
- OpenStreetMap `<iframe>` — the contact map, right-hand column of `#contact` (no API key, no JS)
- ~~Inline `<symbol>` sprite in the footer~~ — gone with the Social Media column. If the
  icons come back, the sprite has to come back **inline in the document**: Chrome does not
  resolve `<use>` against an external SVG file.

## Sections deliberately removed

**Testimonials**, **Our Partners**, and **Our Team** were built, then deleted. All three
invented credibility the company could not point to: quotes from clients who never said
them, partner logos, and five named engineers with stock-photo faces. The docx names no
individuals — it says "15+ certified professionals" and nothing more.

**Our Clients** replaced Our Team in the same slot (`#clients`), carrying the docx's own
structure: two groups, *Software Development* and *Penetration Testing*, nine
`[ CLIENT LOGO ] / [ Client Name ] / [ Project / Scope ]` placeholders each. They are
deliberately styled as dashed empty boxes so an unfilled one is obvious on the page
rather than passing as a real logo. Fill them from real engagements; do not seed
examples.

Testimonials can come back against a named client who agreed to be quoted — it used a
`.rail` of white cards (photo / name / role / quote), which now also needs the rail
CSS restored (see above). Give it a surface that keeps the light-section alternation
and the matching fade modifiers (see *Layout grammar*).

The **stats strip** came out for the same reason, then went back in with the docx's own
numbers (50+ projects, 30+ organizations, 15+ certified professionals). It now lives
inside the About section as a centred `<dl>` that stays **3 columns at every width** (not
`grid-cols-1 sm:grid-cols-3`) — the three figures are meant to read as one row on a phone
too, so `dt`/`dd` carry small-then-large type instead of stacking. Those figures are the client's
claim, not an invention — but they still date from the docx, so re-check them before a
launch rather than assuming they are current.

## Placeholders still in the page

Everything below is invented filler that the docx does not cover. Replace before launch:

- the About Us illustration is a stand-in drawn by a script (isometric SVG in the page);
  swap it for real company photos when they exist. The **Portfolio** section
  is gone — the docx has no portfolio; `#clients` took over its slot and its top-level
  nav item, and now carries real logos instead of the docx's blank placeholders
- the **FAQ**: not in the docx at all. The invented rupiah figures are gone — the cost
  answer now ends with a "Get in touch." link to `#contact` (the CTA) instead. The
  invented durations (5–10 days, 2–3 weeks, 4-hour response) were replaced on request
  with general wording ("depends on the scope… firm timeline after the scoping
  session"; "response times are set out in the support agreement"). Do not put numbers
  back without the client's own figures.
- the FAQ illustration — script-drawn isometric SVG, same family as About Us

Gone for good, not placeholders: the OSM map, the Join Updates photo collage, the footer
**Legal** and **Subscription** columns, the footer's Mail/Website lines, and — last — the
whole **Contact Us** section with its form (it had no backend). `#contact` moved to the
CTA block, so the nav, hero, FAQ and footer "Contact" links all still resolve.

Contact details live in **one** place: the footer's Company column — address,
`contact@sarthlutions.id`, and the WhatsApp number **+62 838 8449 080**. The number is
real (given by the user) and links to `https://wa.me/628388449080` (new tab); the CTA's
"Schedule a consultation" button opens the same chat. Both carry a `<!-- WHATSAPP -->`
comment — change them together, along with the floating button. The old `+62 21 5021 8899` dummy and its `DUMMY` marker
are gone.

Certificate names for **CM-Pen**, **CCEP**, and **C3SA** are unconfirmed — the page
prints `Penerbit — mohon dilengkapi` for their issuers, and there is a
`<!-- VERIFIKASI -->` comment above the grid.

## Design provenance

The layout follows a Figma community file (`oelph2JW9pz5VoBwZGlRPT`) that this
account has **view-only** access to — the Figma MCP tools return "no edit access",
so the design was reconstructed from screenshots plus pixel-sampled colors. If a
future task needs exact spacing or the original assets, the file has to be
duplicated into the user's own drafts first (the file key must change).
