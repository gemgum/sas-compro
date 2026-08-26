# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page company profile ("compro") for **PT Sarana Artha Solusi**, trading as
**Sarthlutions** — an Indonesian firm selling cyber security, software development,
AI agent development, and IT procurement. Tagline: *Secure. Smart. Scalable.*

```
index.html                              the whole site — every section lives here
assets/style.css                        brand tokens, gradients, dividers, service card, marquee, nav
assets/app.js                           language switch + marquee drag + nav scrollspy
Company Profile Sarthlutions - EN.docx  the client's own profile deck — content source
```

No build step, no locally installed dependencies.

**The .docx is the authority on company copy.** Section text (about, vision, mission,
values, service descriptions, the five-step method, why-choose-us, competencies,
contact details) was translated from it into Indonesian. When copy is disputed, read
the docx rather than guessing — extract it with:

```bash
python3 -c "
import zipfile,re,html
x=zipfile.ZipFile('Company Profile Sarthlutions - EN.docx').read('word/document.xml').decode()
x=x.replace('</w:p>','\n').replace('<w:tab/>','  ')
print('\n'.join(l for l in html.unescape(re.sub(r'<[^>]+>','',x)).split('\n') if l.strip()))"
```

Headings stay in English (`Our Services`, `How We Work`, `Why Choose Us`) in **both**
languages; only the body copy switches. See *Bilingual copy* below — the docx is the
English side of every string it covers, so translate from it rather than back-translating
the Indonesian.

## What is built

Every section below is live in `index.html`. "Source" says where its words came from —
that matters, because roughly half the page is the client's own copy and the rest is
filler waiting to be replaced (see *Placeholders* near the end).

| # | Section | Holds | Source |
|---|---|---|---|
| — | Hero (`#top`) | full-viewport gradient: eyebrow, `SARTH`+`LUTIONS` wordmark, tagline, four-service line, two CTAs, scroll cue | docx cover |
| 1 | About Us (`#tentang`) | 3 paragraphs + rotated photo collage, stats `<dl>`, 3 pillars, Vision, Mission, 5 Values | docx §01–02 |
| 2 | Our Services (`#layanan`) | 4 `.svc-card`s with line-art icons and tag rows | docx §03 |
| 3 | How We Work (`#alur`) | 5 numbered steps: Discover → Design → Develop → Deliver → Optimize | docx §04 |
| 4 | Our Clients (`#klien`) | gradient block, drag-scrollable strip of 17 real logos in `assets/clients/`; also the top-level "Our Clients" nav item | primevora.id (same owner) |
| 5 | Why Choose Us (`#keunggulan`) | 4 differentiator cards | docx §05 |
| 6 | Certificate (`#sertifikat`) | gradient block, 13 certification cards | user-supplied list |
| 7 | Technology (`#teknologi`) | 9 competency chips + standards block | docx §08 |
| 8 | FAQ (`#faq`) | 7 `<details>` + illustration | **invented** |
| 9 | CTA | gradient block, "Ready when you are" | docx CTA page |
| 10 | Contact (`#kontak`) | OSM map, gradient band, Join Updates form | docx contact page |
| — | Footer | 4 columns, social sprite, subscribe form | Figma template |

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

There is no build, lint, or test command. Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000     # then http://localhost:8000
```

Needs network at runtime: Tailwind v4 browser build (CDN, compiles in-page),
Google Fonts (Outfit), `picsum.photos` placeholder images, and an OpenStreetMap
`<iframe>` for the contact map.

### The check to run after editing `index.html`

Nothing here is compiled, so structural mistakes fail silently. This catches the
four that actually happen — duplicate ids, dead anchors, unbalanced tags, and a
`data-en` that would clobber nested markup:

```bash
python3 - <<'PY'
import re, collections, html.parser
s = open('index.html').read()
ids = re.findall(r'\bid="([^"]+)"', s)
print('dup ids:', [i for i,n in collections.Counter(ids).items() if n>1] or '-')
print('dead anchors:', [a for a in sorted(set(re.findall(r'href="#([a-z-]+)"', s))) if a not in ids] or '-')
for m in re.finditer(r'<(\w+)[^>]*data-en="([^"]*)"[^>]*>(.*?)</\1>', s, re.S):
    if '<' in m.group(3): print('data-en over markup:', m.group(3)[:60].replace('\n',' '))
VOID = set('area base br col embed hr img input link meta param source track wbr use path circle rect ellipse polygon line stop iframe'.split())
class C(html.parser.HTMLParser):
    def __init__(s): super().__init__(); s.stack=[]; s.bad=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.stack.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        s.stack.pop() if s.stack and s.stack[-1]==t else s.bad.append(t)
c=C(); c.feed(s); print('unclosed:', c.stack or '-', 'mismatched:', c.bad or '-')
PY
```

## Brand colors are defined in TWO places

This is the one thing that will bite you. Changing a brand color means editing both:

| Where | Names | Consumed by |
|---|---|---|
| `assets/style.css` `:root` | `--navy --navy-deep --navy-mid --teal-deep --teal --cream --soft` | the hand-written classes: `.g-hero .g-band .g-foot .squiggle .svc-card .marquee .nav-link` |
| `index.html` `<style type="text/tailwindcss">` `@theme` | `--color-blue --color-blue-deep --color-teal --color-cream --color-soft --color-ink` | Tailwind utilities: `text-blue`, `bg-blue`, `text-soft`, `bg-cream`, … |

`--color-blue` is **navy** (`#1b3a6b`), not blue — the name is left over from an
earlier palette and is used by hundreds of utility classes, so it was not renamed.

A third spot: the page background color is hardcoded as `fill="#fbfdfd"` inside
each wave `<svg>` (5 of them). It must equal `--cream` or the waves show a seam.

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
(gradient) → technology → *squiggle* → FAQ → CTA (gradient) → map → contact band
(gradient) → join updates → footer.

`#klien` and `#sertifikat` are both `.g-hero` blocks, so their own waves carry every
boundary they touch — no `*squiggle*` sits next to either, nor between the certificate
and the FAQ. A squiggle there would divide cream from cream with nothing in between.

## JS contracts (`assets/app.js`)

No framework, three behaviours: the language switch, the client marquee, and the
nav underline.

**Nav underline** — the active nav item is *not* hardcoded. An `IntersectionObserver`
watches every section id in the `OWNER` map and sets `aria-current` on the matching
`.nav-link`; the underline itself is drawn by `.nav-link[aria-current="true"]` in
`style.css`. Sections reachable only from the "About Us" dropdown (`alur`, `keunggulan`,
`tentang`, `sertifikat`, `teknologi`, `faq`) all map to `#tentang`, so exactly
one top-level item is ever active. **Adding a section with an id means adding it to
`OWNER`**, or the underline sticks on the previous item while that section is on screen.
Check both directions:

```bash
python3 -c "
import re
ids = set(re.findall(r'<section[^>]*id=\"([a-z]+)\"', open('index.html').read()))
own = set(re.findall(r'(\w+):\s*.#', open('assets/app.js').read()))
print('section without OWNER:', sorted(ids-own) or '-')
print('OWNER without section:', sorted(own-ids) or '-')"
```

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
  Those have a plain `<span data-en="…">` wrapped around the *text* instead. The one
  deliberate exception is the contact-band address, whose `data-en` carries its `<br>`.
- Section headings, service names, the five step names, the values, the certificate
  names, and the technology chips are English in both languages, so they carry no
  `data-en` at all.
- Adding a paragraph means adding its `data-en` in the same edit, or it will stay
  Indonesian when the page is switched to English.

## Client logo marquee

`#klien` is a native scroll container, not a CSS keyframe animation. `.marquee` is
`overflow-x: auto` with the scrollbar hidden; `app.js` advances `scrollLeft` by 0.5px
per frame and the same `put()` wraps it modulo **half the scrollWidth** — which only
lines up because the 17 `<li>` are written **twice** in `index.html` (second copy
`aria-hidden`, so a screen reader reads each client once). Add or remove a logo in
*both* copies or the loop jumps.

Doing it through `scrollLeft` instead of `translateX` is what makes click-drag
possible: pointer events just set the same value. `touch-action: pan-y` hands
horizontal panning to that handler while leaving vertical page scroll to the browser,
and `prefers-reduced-motion` skips the rAF loop only — dragging still works.

It does **not** pause on hover — asked for twice, once to add it and once to take it
back out. Only an active drag holds it. `.marquee` needs its `padding: 22px 0`: the
container clips, and the hover `scale(1.18)` would be cut off without that room. Logos
stay in full colour — no grayscale filter, asked for explicitly. The section sits on
`.g-hero` like `#sertifikat`, so the strip needs no background of its own.

The logos are the client's own, lifted from **primevora.id** (same owner, a Flutter
app — the list came from its `assets/AssetManifest.bin.json`, base64 inside JSON).
They are not split by service line: the source site does not say which client was
software work and which was a pentest, so the earlier two-group / tab layout is gone.
Bringing categories back needs that mapping from the client, not a guess.

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
- OpenStreetMap `<iframe>` — the contact map (no API key, no JS)
- Inline `<symbol>` sprite in the footer — social icons; Chrome does not resolve
  `<use>` against an external SVG file, so it has to be inline in the document.

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
inside the About section as a centred 3-column `<dl>`. Those figures are the client's
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

Certificate names for **CM-Pen**, **CCEP**, and **C3SA** are unconfirmed — the page
prints `Penerbit — mohon dilengkapi` for their issuers, and there is a
`<!-- VERIFIKASI -->` comment above the grid.

## Design provenance

The layout follows a Figma community file (`oelph2JW9pz5VoBwZGlRPT`) that this
account has **view-only** access to — the Figma MCP tools return "no edit access",
so the design was reconstructed from screenshots plus pixel-sampled colors. If a
future task needs exact spacing or the original assets, the file has to be
duplicated into the user's own drafts first (the file key must change).
