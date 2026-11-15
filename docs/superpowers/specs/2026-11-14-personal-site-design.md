# Personal site — design

## Intent

A personal website for Ethan Tran, aimed at **recruiters** and **team-match
hosts** (the engineers who pick interns/new grads onto their teams). A visitor
should leave thinking: *strong candidate, impressive background, and the site
itself is impressive — I should interview them.*

Two reading modes, one page:

- **Skim (recruiter, ~30 s):** who you are, what you've built, where you've
  worked, resume link — all visible with little scrolling, on a site that
  obviously wasn't a template.
- **Linger (host, a few minutes):** enough substance in each project and job
  card (what it does, what was hard, the stack) to judge real engineering
  ability. No separate per-project pages — Ethan explicitly doesn't want that
  depth.

Reference the user liked: [animejs.com](https://animejs.com/). What makes it
work: one signature hero piece, scroll-driven motion, and restraint everywhere
else (dark, one typeface, monospace labels, lots of space).

## Goals

1. Memorable within three seconds (signature hero).
2. Information-dense but skimmable: projects, experience, about, contact,
   resume — all on one page.
3. Feels hand-built, not templated.
4. Fast: Lighthouse Performance ≥ 95 on desktop and mobile; first paint well
   under 1.5 s on a mid-range phone.
5. Live on a custom `.com` with HTTPS, deploying on `git push`.
6. Visit counts (page views, uniques, country, referrer) with no cookie banner.

## Non-goals

- Per-project write-up pages or a blog.
- Identifying individual visitors by name/company. (Privacy-gray and looks bad
  if noticed. Not doing it.)
- A CMS. Content is a TypeScript file; editing it is a commit.
- Light mode. Dark only, with a `prefers-reduced-motion` fallback.

## Anti-goals (would make it a failure even if it "works")

- Janky or slow animation. A flashy site that stutters is worse than a plain one.
- Animation that hides information (text that only appears after long scrolls,
  content gated behind interaction).
- Looking like the common "sticky left column + glowing cursor" template
  (brittanychiang.com clones). Borrow its *skimmability*, not its look.
- Broken on phones. Recruiters open links from email on their phone.

## Constraints

- Static hosting only; no server, no database.
- Zero recurring cost beyond the domain (~$10/yr).
- Ethan's existing tooling: TypeScript, Vite, npm (from FormIQ). Reuse it.
- Content Ethan still has to supply: resume bullets (experience, education,
  projects beyond FormIQ), headshot (optional), social links.

## Research notes (what we looked at and took)

- **animejs.com** — one hero centerpiece, scroll-driven storytelling,
  monospace micro-labels, restraint. *Taken:* hero-first structure,
  mono labels, dark palette with one accent.
- **brittanychiang.com** — two-column (sticky identity left, scrolling
  content right), experience cards with date + role + tech tags, resume link.
  *Taken:* the card anatomy and the fact that everything fits on one page.
  *Avoided:* the exact layout and cursor glow — too widely copied.
- **joshwcomeau.com** — one playful interactive element in the header and
  personality in the copy. *Taken:* the "one toy" idea; the hero is the toy.
- **taniarascia.com** — a 4-line "brief timeline" as the About hook.
  *Taken:* About opens with a short timeline, not a paragraph.
- Listicle consensus (several 2026 roundups): memorable sites keep animation
  smooth and lightweight, and never at the cost of usability or mobile.

## Approaches considered

1. **Single-page static site: Vite + TypeScript + anime.js, Cloudflare
   Pages.** *(chosen)* One `index.html`, content in `src/content.ts`, custom
   hero on a `<canvas>`, scroll-triggered reveals. Free hosting with free
   cookie-less analytics and one-click custom domain. Trade-off: no per-project
   pages — fine, not wanted.
2. **Next.js on Vercel.** Same look plus MDX project pages and Vercel
   Analytics. More machinery than a one-pager needs; the analytics tier you'd
   want is paid after trial. Rejected.
3. **Framer / template.** Fastest, but the hero can't be custom and hosts
   notice templates. Rejected: works against "memorable" and "hand-built".

## Revision 2026-11-15 — supersedes Theme, Hero, Page structure, Content model and motion below

Ethan reviewed a working prototype (claude.ai artifact "Ethan Tran Motion
Study", v2) and approved it. It was shaped with the impeccable, taste and
Emil Kowalski design skills. Where the sections below disagree, this wins.

- **Why the change.** impeccable's calibration list names "near-black with one
  glowing accent, Inter display, tracked mono labels" as a stock AI look, and
  bans eyebrow labels and `01 /` section numbers. Ethan also asked that
  FormIQ be one project among several, not the site's subject — so no
  pose/particle hero.
- **World.** A typeset sheet: grey photographic paper (`#e9e8e3`), ink
  (`#151513`), secondary ink (`#4b4a45`), rules (`#c4c2ba`), one red accent
  (`#c42c1b`) used only for focus, selection and link/arrow hover. Dark mode
  is a real second palette (`#121211` ground, `#edece6` ink, `#ff5a44` accent),
  chosen by `prefers-color-scheme`.
- **Type.** One family, Archivo variable (wdth 62–125, wght 100–900),
  self-hosted: 125 % width for display, 100 % for body, 75 % with tabular
  numerals for dates/years. No monospace.
- **Hero.** `h1` is the name on two lines ("Ethan" / "Tran") at
  `clamp(3.6rem, 9vw, 6rem)`, weight 300, width 125 %. Entrance: each letter
  sets from weight 900 / width 62 to 300 / 125, 760 ms, 45 ms stagger. After
  that, each letter's weight rises toward 900 as the pointer nears it
  (smoothstep falloff over 1.5 × font-size), easing back when it leaves; touch
  drag does the same. Reduced motion: static. Beside it, a fact list
  (Studying, Based in, Looking for, Works in), and below the name one lead
  sentence plus two buttons: "See projects", "Download résumé".
- **Sections.** Projects (ruled rows: name, one line, stack, year, ↗ — FormIQ
  is a normal row), Experience (date column + role · company + bullets),
  About (paragraphs + four-line year timeline), Get in touch (email set large
  with a Copy button; GitHub, LinkedIn, résumé links), footer.
- **Motion.** Only the hero moves (entrance + name). Lead/buttons/facts fade
  up 12 px once on load. No scroll reveals, no nav blur, no experience rail,
  no anime.js. Hover: links draw an underline, buttons rise 1 px and press to
  scale .97, row arrows nudge 2 px and turn accent; hover only on
  `(hover: hover) and (pointer: fine)`. Easing `cubic-bezier(.23,1,.32,1)`,
  150–160 ms.
- **Contact.** `hello@ethanctran.dev` via Cloudflare Email Routing
  (forwarding to Ethan's inbox) — set up at launch.

## Revision 2026-11-15 (b) — "Live wire" supersedes the typeset-sheet look

Ethan found the grey-paper design bland and picked "Live wire" from three live
prototypes (claude.ai artifact "Ethan Tran Site Directions"). Where this
disagrees with anything above or below, this wins.

- **World.** One dark stage (`#0a0a0b`), white type (Archivo, wide and heavy),
  six spectrum hues (6, 30, 50, 135, 190, 218 at 100 % / 62 %). No light theme,
  no theme toggle.
- **Particle field.** A fixed full-viewport canvas (`src/field/`) of up to
  2,400 dots. Each `data-field` section names a formation and the field morphs
  between them with scroll: hero `ring`, About `wave` (three ribbons),
  Experience `stream` (pipeline lanes), Projects `grid` (swaying lattice),
  Contact `core` (tight ring beside the address). Dots keep an angle slot so
  ring colours stay in arcs. They scatter from the pointer; a click sends a
  shockwave; hovering a project floods the field with that project's hue.
  On load the ring closes in from off-screen. Reduced motion: one still ring.
- **Page.** Hero (name, lead, two buttons), then About, Experience, Projects,
  Contact — translucent panels with open gaps so the field shows between them.
  Hero facts moved into About. No placeholders remain on the page.
- **Type effects kept.** Name letters thin out under the pointer and ripple on
  click; About statement inks in with scroll; scroll-driven heading stretch,
  project rules (in each project's hue), spectrum experience rail, spectrum
  progress line, address stretch.

## Revision 2026-11-15 (c) — intro, staggered transitions, portrait

- **Intro.** On a fresh visit to the top of the page (no hash, motion allowed,
  not yet entered in this tab) the page is held back and the particles spell
  ETHAN / TRAN in six colours. Enter, Space, click, tap, wheel or swipe goes
  in: the name bursts apart, the dots gather into the hero ring, and the hero's
  entrance plays. Remembered per tab in `sessionStorage`.
- **Transitions.** Dots change formation one after another (`staggered`), not
  all at once: by colour around a ring, by lane into a flow. Scroll speed drags
  the dots with the page, and trails lengthen while things are changing.
- **Name once.** The nav carries links only; the h1 is the only name on screen.
- **Portrait.** A circle in About inside the six-colour ring; shows an "ET"
  monogram until `about.photo` is set in `src/content.ts`.
- **Link previews.** Open Graph / Twitter tags and `public/og.jpg`.

## Decisions

### Stack (my call, from Ethan's existing tooling)

- **Vite + vanilla TypeScript + plain CSS.** No React: a one-page site with
  three lists doesn't need a component framework, and skipping it keeps the
  bundle tiny and the animation code direct. Content is rendered by small
  template functions from `src/content.ts`.
- **anime.js v4** for timelines, staggered text, and scroll-triggered reveals
  (`onScroll`). It's the engine behind the reference site, ~10 KB, and has
  scroll observation built in. Alternative if a need outgrows it: GSAP +
  ScrollTrigger (now free). Not both.
- **Hero on `<canvas>`** with hand-written particle code (requestAnimationFrame),
  not a library — a few hundred lines, full control, no WebGL dependency.
- **Fonts:** one variable sans for display + body (e.g. *Inter* or
  *Geist Sans*), one mono for labels (e.g. *JetBrains Mono* / *Geist Mono*).
  Self-hosted woff2, `font-display: swap`. Exact pick is the builder's call.
- **No UI library, no CSS framework.** CSS custom properties for tokens.

### Theme — "signal in the dark"

- Near-black background (`#0b0d10`-ish, not pure black), off-white text,
  **one accent** — a warm signal color (amber/orange, ~`#ff8a3d`) used for
  the hero points, links, section numbers, and hover states. Nothing else is
  colored. Monospace micro-labels (`01 / PROJECTS`, dates, tech tags) in a
  dimmed gray.
- Why warm on dark: the reference site is warm-on-dark; it's rarer in dev
  portfolios than teal/blue (the Brittany Chiang default), and it reads as
  "lights on a stage", which fits the hero.

### Hero — the signature piece (my call; Ethan can swap the subject)

- A field of glowing accent-colored points on a dark canvas. On load, **33
  points** trace a human pose doing one rep of a lift (a nod to FormIQ's 33
  keypoints — no caption needed; people who know will know), then scatter and
  **re-assemble into the letters "ETHAN TRAN"** (points sampled from the
  rendered text's pixels). Cursor/touch gently repels nearby points so the
  name "breathes" under the pointer. Total intro ≤ 2.5 s, then it idles.
- Beneath the name, staggered-in: one-line title (e.g. *Software engineer ·
  CS @ <school> · '27*), a one-sentence hook, and three buttons:
  **Projects**, **Resume (PDF)**, **Email**.
- `prefers-reduced-motion`: skip the intro, render the name as static text
  with the points already in place, no cursor physics.
- Mobile: fewer points, same choreography, capped at 60 fps and paused when
  the hero scrolls off-screen.
- Performance budget: hero JS ≤ 15 KB gzipped; no frame over 16 ms on a
  2020-era phone.

### Page structure (single page, in this order)

```
┌──────────────────────────────────────────────────────────┐
│  ethan tran            projects  experience  about  resume│  ← slim nav, blurs on scroll
├──────────────────────────────────────────────────────────┤
│                                                          │
│         · · ·  E T H A N   T R A N  · · ·                │  ← canvas hero
│         Software engineer · CS @ …                       │
│         [Projects]  [Resume]  [Email]                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 01 / PROJECTS                                            │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│ │ FormIQ     │ │ Project 2  │ │ Project 3  │             │  ← cards: name, 1-line what,
│ │ C++·LiteRT │ │            │ │            │             │    2–3 lines why it's hard,
│ │ FastAPI·TS │ │            │ │            │             │    tech tags, GitHub/live links
│ └────────────┘ └────────────┘ └────────────┘             │
├──────────────────────────────────────────────────────────┤
│ 02 / EXPERIENCE                                          │
│ 2026 —  Role @ Company ↗                                 │  ← vertical list, date rail on left,
│         2–3 impact bullets · tags                        │    accent line draws in on scroll
│ 2025 —  Role @ Company ↗                                 │
├──────────────────────────────────────────────────────────┤
│ 03 / ABOUT                                               │
│ brief timeline (4 lines)   |  2 short paragraphs + photo │
├──────────────────────────────────────────────────────────┤
│ 04 / CONTACT   email · github · linkedin · resume        │
│ © ethan tran · built by hand with vite + anime.js        │
└──────────────────────────────────────────────────────────┘
```

- Desktop: max content width ~1100 px, generous vertical rhythm. Mobile:
  single column, cards stack, nav collapses to anchor links (no hamburger
  JS — a horizontally scrolling row of links is enough).
- Each section heading is a mono label (`01 / PROJECTS`) + large display
  heading. Headings letter-stagger in once; cards fade/rise in on scroll
  (once, not on every pass).
- Project cards: hover lifts the card and draws the accent border; the
  featured project (FormIQ) spans wider and may include one screenshot/GIF.
- Experience: the left date rail draws in with scroll; company name links out.

### Content model (`src/content.ts`)

```ts
export const site = { name, title, hook, email, github, linkedin, resumeUrl }
export const projects: Project[]      // { name, tagline, hard, stack[], links{github?, live?}, featured? }
export const experience: Role[]       // { company, role, start, end, bullets[], stack[], url? }
export const about = { timeline: string[], paragraphs: string[], photo? }
```

Initial content: FormIQ fully written from its repo (real details: C++ pose
engine via LiteRT, FastAPI scoring, React "Meet day" UI). Everything else as
clearly marked `TODO` placeholders until Ethan supplies the resume.

### Analytics — counts only

- **Cloudflare Web Analytics** (free, no cookies, no consent banner, one
  toggle on the Pages project): page views, visitors, country, referrer,
  path, device. That's the requirement.
- **Per-application links (free extra):** send `ethanctran.dev/stripe`
  instead of the bare URL. Pages serves `index.html` for unknown paths (no
  `404.html` → SPA fallback), so each path shows up as its own row in the
  analytics path breakdown. No code needed; just don't ship a `404.html`.
  The builder verifies the fallback actually returns 200 before relying on it.
- Resume-download count: the Resume button links to `/resume.pdf`; the path
  shows in analytics.

### Domain and hosting

- **Domain:** `ethanctran.dev` — checked available 2026-11-14 (`ethantran.com`
  and `.dev` are taken; `.me` and `.io` also free). Register at **Cloudflare
  Registrar** (at-cost, ~$10/yr, no renewal markup) so DNS + Pages custom
  domain is one click. Porkbun is the fallback if Cloudflare Registrar
  doesn't offer it.
- **Hosting:** **Cloudflare Pages** via GitHub integration. Build command
  `npm run build`, output `dist`. Every push to `main` deploys; PRs get
  preview URLs. Free SSL. (Cloudflare now also offers Workers static assets;
  Pages is the simpler path and still supported — switch only if Pages is
  deprecated for new projects by the time of setup.)
- Repo: `github.com/<ethan>/personal-site`, public.

### Quality bar

- Lighthouse ≥ 95 Performance / 100 Accessibility / 100 Best Practices / 100 SEO.
- Keyboard-navigable; visible focus; all links have accessible names;
  color contrast ≥ 4.5:1 for body text.
- `<meta>` + Open Graph tags with a generated OG image so the link unfurls
  nicely in Slack/LinkedIn/email (recruiters paste it around).
- Works with JS disabled: the HTML carries all the content; JS only adds motion.

## Left to the builder

- Exact fonts, exact accent hex, easing curves, card dimensions.
- Pose keyframes for the hero's lift (hand-authored, ~8 keyframes of 33
  normalized points; a squat is the simplest silhouette).
- Whether the OG image is static (a PNG exported once) or generated at build.
- Test approach: a smoke test that the content renders (Vitest + jsdom, one
  file) and a Lighthouse CI run; no visual regression suite.

## Milestones (summary — detailed plan lives in `docs/superpowers/plans/`)

1. **Skeleton + content:** Vite project, tokens, static page with all four
   sections rendered from `content.ts` (FormIQ real, rest TODO). No motion yet.
   Deployed to a `*.pages.dev` preview.
2. **Hero:** canvas particle system, pose → name choreography, reduced-motion
   fallback, performance budget met on a throttled phone profile.
3. **Motion pass:** nav blur, heading staggers, scroll reveals, card hovers,
   experience rail.
4. **Polish + SEO:** OG image, favicon, metadata, Lighthouse to target,
   accessibility audit.
5. **Domain + launch:** register `ethanctran.dev`, attach to Pages, enable Web
   Analytics, verify path-based tracking, fill in real resume content, ship.
