# Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `ethanctran.com` — a one-page, dark, warm-accent personal site with a canvas particle hero ("33 pose points do a squat, then assemble into ETHAN TRAN"), scroll-triggered motion, projects/experience/about/contact rendered from one content file, deployed on Cloudflare Pages with cookie-less visit counts.

**Architecture:** Vite + vanilla TypeScript + plain CSS. `index.html` carries all four sections' containers and a real `<h1>` (no-JS and screen-reader path); `src/render.ts` fills them from `src/content.ts` as HTML strings; `src/hero/` is a self-contained requestAnimationFrame particle system on a `<canvas>`; `src/motion.ts` adds anime.js v4 reveals after render. No framework, no CSS framework.

**Tech Stack:** Vite 7, TypeScript 5, anime.js 4, Vitest 3, Cloudflare Pages (GitHub integration), Cloudflare Web Analytics, Cloudflare Registrar.

**Spec:** `docs/superpowers/specs/2026-11-14-personal-site-design.md`

## Global Constraints

- Static output only (`dist/`); no server code, no database, no `404.html` (Pages' SPA fallback makes `/stripe`-style paths serve `index.html` with 200 so they appear in analytics).
- Dark theme only. Tokens: `--bg: #0b0d10`, `--fg: #ededed`, `--muted: #8a8f98`, `--accent: #ff8a3d`. Nothing but the accent is colored.
- One sans (display + body) and one mono (labels), self-hosted woff2, `font-display: swap`.
- Hero JS ≤ 15 KB gzipped; total JS ≤ 60 KB gzipped (anime.js included). Check with `npx vite build` output.
- `prefers-reduced-motion: reduce` → no hero intro, no pointer physics, no scroll reveals (content simply visible).
- Lighthouse targets on the deployed URL: Performance ≥ 95 (mobile and desktop), Accessibility 100, Best Practices 100, SEO 100.
- Content lives only in `src/content.ts`; FormIQ fully real, everything else `TODO:`-prefixed placeholder text until Ethan supplies his resume.
- No per-project pages, no blog, no visitor identification.
- Commit after each task; conventional commits; no Co-Authored-By trailer.

## Review Focus

1. **Optional content fields** (`Project.links.live` missing, `Role.url` missing, `about.photo` missing): the rendered HTML must omit that element, never print `undefined` or an empty `<a>`. Pinned in Task 2's tests.
2. **Window resize during or after the hero intro:** text targets must be recomputed for the new width and every point must land on a finite in-canvas coordinate (no NaN, no points stuck off-screen). Pinned in Task 4's `fitFontSize` test and Task 5's manual resize check.
3. **Hero off-screen or tab hidden:** the rAF loop must stop (battery/CPU on phones). Pinned in Task 5's IntersectionObserver step and its manual check.
4. **320 px wide viewport:** nav links must not overflow horizontally and the hero name must not clip. Pinned in Task 6's mobile check.
5. **External links:** every `href` that leaves the site must carry `target="_blank" rel="noopener noreferrer"` and an accessible name. Pinned in Task 2's tests.

---

## File structure

```
personal-site/
├── index.html                 # shell: nav, <h1>, 4 section containers, <canvas>
├── package.json  tsconfig.json  vite.config.ts  vitest.config.ts
├── public/
│   ├── favicon.svg  og.png  resume.pdf (placeholder until real)
│   └── fonts/*.woff2
├── src/
│   ├── main.ts                # render → hero → motion
│   ├── content.ts             # ALL copy and data
│   ├── render.ts              # pure string templates (tested)
│   ├── motion.ts              # anime.js reveals, nav blur
│   ├── styles/tokens.css      # custom properties, fonts
│   ├── styles/site.css        # layout + components
│   └── hero/
│       ├── pose.ts            # 33-point squat keyframes (tested)
│       ├── text-points.ts     # sample text pixels → points (tested, pure part)
│       ├── particles.ts       # Point[], physics step, draw
│       └── index.ts           # choreography + lifecycle
└── tests/
    ├── render.test.ts  pose.test.ts  text-points.test.ts
```

---

## Milestone 1 — Skeleton + content (Tasks 1–3)

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.ts`, `src/styles/tokens.css`, `src/styles/site.css`, `.gitignore`, `.nvmrc`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces: `index.html` with `<nav id="nav">`, `<header id="hero">` containing `<canvas id="hero-canvas" aria-hidden="true">` and `<h1 id="hero-name">`, and `<section id="projects">`, `<section id="experience">`, `<section id="about">`, `<section id="contact">`, each with an inner `<div class="section-body">`. `npm run dev|build|test|preview` scripts.

- [ ] **Step 1: Scaffold with Vite's vanilla-ts template**

Run: `cd "/Users/ethantran/Personal Projects/personal-site" && npm create vite@latest . -- --template vanilla-ts` (accept overwriting the empty dir), then `npm i -D vitest` and `npm i animejs`. Write `.nvmrc` = `22`. Delete the template's `counter.ts`, `typescript.svg`, `style.css`.

- [ ] **Step 2: Write the failing smoke test**

```ts
// tests/smoke.test.ts
import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
const html = readFileSync('index.html', 'utf8')
test('shell has the four sections, hero canvas and h1', () => {
  for (const id of ['projects', 'experience', 'about', 'contact', 'hero-canvas', 'hero-name', 'nav'])
    expect(html).toContain(`id="${id}"`)
})
test('no 404.html is shipped (keeps Pages SPA fallback)', () => {
  expect(() => readFileSync('public/404.html')).toThrow()
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run tests/smoke.test.ts`  Expected: FAIL (ids missing).

- [ ] **Step 4: Write `index.html`, `tokens.css`, `site.css`, `main.ts`**

`index.html`: `<html lang="en">`, title `Ethan Tran — Software Engineer`, the structure in Interfaces, nav anchor links to the four sections plus `Resume` → `/resume.pdf`, `<script type="module" src="/src/main.ts">`. `tokens.css`: the Global Constraints colors, `--font-sans`, `--font-mono`, `--max-w: 1100px`, `--space-*` scale, `@font-face` rules pointing at `/fonts/*.woff2` (download Inter Variable + JetBrains Mono woff2 into `public/fonts/`; exact fonts are the builder's call). `site.css`: reset, body bg/fg, `.section-body { max-width: var(--max-w); margin-inline: auto; padding-inline: 16px }`, nav as a fixed slim bar with a horizontally scrollable link row on narrow screens. `main.ts`: imports the two CSS files only, for now.

- [ ] **Step 5: Run the smoke test and the build**

Run: `npx vitest run && npm run build`  Expected: tests PASS; build succeeds; the JS chunk is reported under 5 KB.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold vite + ts site shell with tokens"
```

### Task 2: Content model and renderers

**Files:**
- Create: `src/content.ts`, `src/render.ts`
- Modify: `src/main.ts`
- Test: `tests/render.test.ts`

**Interfaces:**
- Produces (in `content.ts`):
  ```ts
  export interface Project { name: string; tagline: string; hard: string; stack: string[]; links: { github?: string; live?: string }; featured?: boolean }
  export interface Role { company: string; role: string; start: string; end: string; bullets: string[]; stack: string[]; url?: string }
  export const site: { name: string; title: string; hook: string; email: string; github: string; linkedin: string; resumeUrl: string }
  export const projects: Project[]; export const experience: Role[]
  export const about: { timeline: string[]; paragraphs: string[]; photo?: string }
  ```
- Produces (in `render.ts`): `renderHeroCopy(s: typeof site): string`, `renderProjects(p: Project[]): string`, `renderExperience(r: Role[]): string`, `renderAbout(a: typeof about): string`, `renderContact(s: typeof site): string`, and `ext(href: string, label: string): string` (anchor with `target="_blank" rel="noopener noreferrer"`). All pure, return HTML strings, HTML-escape user text via a local `esc()`.
- Produces (in `main.ts`): `mount()` that sets each section's `.section-body` innerHTML and is called on `DOMContentLoaded`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/render.test.ts
import { test, expect } from 'vitest'
import { renderProjects, renderExperience, renderAbout, ext } from '../src/render'
import { projects, experience, about } from '../src/content'

test('ext links open safely in a new tab', () => {
  expect(ext('https://x.y', 'X')).toContain('target="_blank" rel="noopener noreferrer"')
})
test('project without a live link renders no live anchor and no "undefined"', () => {
  const html = renderProjects([{ name: 'A', tagline: 't', hard: 'h', stack: ['ts'], links: { github: 'https://g' } }])
  expect(html).not.toContain('undefined'); expect(html.match(/<a /g)?.length).toBe(1)
})
test('featured project gets the featured class', () => {
  expect(renderProjects([{ ...projects[0], featured: true }])).toContain('card--featured')
})
test('role without url renders company as plain text', () => {
  const html = renderExperience([{ company: 'Co', role: 'R', start: '2025', end: 'Present', bullets: ['b'], stack: [] }])
  expect(html).toContain('Co'); expect(html).not.toContain('<a ')
})
test('about without photo renders no img', () => {
  expect(renderAbout({ ...about, photo: undefined })).not.toContain('<img')
})
test('FormIQ is the first, featured project with real copy', () => {
  expect(projects[0].name).toBe('FormIQ'); expect(projects[0].featured).toBe(true)
  expect(projects[0].hard).not.toMatch(/TODO/)
})
test('user text is escaped', () => {
  expect(renderProjects([{ name: '<b>', tagline: '', hard: '', stack: [], links: {} }])).toContain('&lt;b&gt;')
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/render.test.ts`  Expected: FAIL (modules not found).

- [ ] **Step 3: Write `content.ts`**

`site`: name `Ethan Tran`, github `https://github.com/etctran`, email/linkedin/title/hook as `TODO:` placeholders, `resumeUrl: '/resume.pdf'`. `projects[0]` = FormIQ, `featured: true`, written from the FormIQ repo's CLAUDE.md: tagline "Exercise form analysis from video", `hard` naming the LiteRT switch (MediaPipe's detector wouldn't load in OpenCV's `dnn` because of the `DENSIFY` op), the <3 s per-video ingestion target, and the 4-phase rep state machine; stack `['C++', 'LiteRT', 'OpenCV', 'pybind11', 'FastAPI', 'SQLite', 'React', 'TypeScript', 'Docker']`; github link `https://github.com/etctran/FormIQ` (builder: confirm the real URL with `git -C ../FormIQ remote -v`). Two more `TODO:` projects. `experience`: two `TODO:` roles. `about.timeline`: four `TODO:` lines in the Tania Rascia style ("2023 — …").

- [ ] **Step 4: Write `render.ts` and wire `mount()` in `main.ts`**

Markup per spec: section header = `<p class="label">01 / PROJECTS</p><h2>Projects</h2>`; project card `article.card[.card--featured]` with `h3`, tagline, `hard` paragraph, `ul.tags`, links row; experience `ol.timeline` with `li` containing `span.date` (`start — end`), `h3` (role, company via `ext()` only if `url`), bullets, tags; about = `ol.brief` of timeline lines + paragraphs + optional `img`; contact = email `mailto:` + `ext()` github/linkedin + resume link. `renderHeroCopy` = title, hook, three buttons (`#projects`, `/resume.pdf`, `mailto:`).

- [ ] **Step 5: Run tests, run dev server, eyeball**

Run: `npx vitest run`  Expected: PASS. Run `npm run dev` and open it in the browser pane: four sections render with FormIQ copy and TODOs; no console errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: content model and section renderers"
```

### Task 3: Layout and card styling (no motion yet) + first deploy

**Files:**
- Modify: `src/styles/site.css`, `index.html`
- Create: `public/favicon.svg`, `public/resume.pdf` (any one-page placeholder PDF), `README.md`

- [ ] **Step 1: Style the sections**

Spec layout: projects as a responsive grid (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`; featured card `grid-column: 1 / -1` on ≥ 900 px), experience as a left date rail (`grid-template-columns: 7rem 1fr`, single column < 640 px) with a 1 px `--muted` vertical line and an accent `::before` line of height 0 (animated later), about as two columns ≥ 900 px. Labels mono, uppercase, `--muted`; `h2` large (`clamp(2rem, 5vw, 3.5rem)`). Card hover: `translateY(-4px)` + accent border (`transition: 200ms`). Visible `:focus-visible` outline in accent. Body text contrast on `--bg` ≥ 4.5:1 (check `--muted` on `--bg` with any contrast checker; darken `--bg` or lighten `--muted` if below).

- [ ] **Step 2: Check it at desktop and mobile**

Open the dev server in the browser pane at desktop, then `resize_window` preset `mobile`: no horizontal scroll, nav links scroll horizontally, cards stack. Expected: both pass.

- [ ] **Step 3: Create the GitHub repo and push**

Run: `gh repo create personal-site --public --source=. --push`  Expected: repo URL printed, `main` pushed.

- [ ] **Step 4: (Ethan, in the Cloudflare dashboard) connect Pages**

Workers & Pages → Create → Pages → Connect to Git → `personal-site`; framework preset **Vite**, build command `npm run build`, output `dist`, Node version env `NODE_VERSION=22`. Save and deploy. Record the `*.pages.dev` URL in `README.md`.

- [ ] **Step 5: Verify the deploy and the SPA fallback**

Run: `curl -sI https://<project>.pages.dev/ | head -1` → `HTTP/2 200`; `curl -sI https://<project>.pages.dev/stripe | head -1` → `HTTP/2 200` (not 404). If it's 404, add `public/_redirects` containing `/* /index.html 200` and redeploy; re-run.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: section layout, cards, favicon; document pages.dev URL" && git push
```

---

## Milestone 2 — Hero (Tasks 4–5)

### Task 4: Pose keyframes and text sampling (pure, tested)

**Files:**
- Create: `src/hero/pose.ts`, `src/hero/text-points.ts`
- Test: `tests/pose.test.ts`, `tests/text-points.test.ts`

**Interfaces:**
- Produces: `export const POSE_KEYFRAMES: ReadonlyArray<ReadonlyArray<[number, number]>>` — ≥ 6 frames, each exactly 33 `[x, y]` pairs normalized to `[0, 1]` (MediaPipe index order: 0 nose … 11/12 shoulders, 13/14 elbows, 15/16 wrists, 23/24 hips, 25/26 knees, 27/28 ankles …), depicting one squat rep: standing → bottom → standing; first and last frames equal.
- Produces: `export function posePointAt(frames: typeof POSE_KEYFRAMES, i: number, t: number): [number, number]` — landmark `i` at normalized time `t ∈ [0, 1]`, linear interpolation between neighboring frames.
- Produces: `export function pointsFromAlpha(alpha: Uint8ClampedArray, w: number, h: number, step: number): Array<[number, number]>` — pixel coords where `alpha > 128`, sampled on a `step` grid. `export function fitFontSize(text: string, maxWidth: number, measure: (px: number) => number): number` — largest px size (binary search, 24…240) whose measured width ≤ `maxWidth`. `export function textPoints(text: string, w: number, h: number, count: number, font: string): Array<[number, number]>` — draws on an `OffscreenCanvas`/detached canvas, uses the two above, shuffles, returns exactly `count` points (repeats if fewer were sampled).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/pose.test.ts
import { test, expect } from 'vitest'
import { POSE_KEYFRAMES, posePointAt } from '../src/hero/pose'
test('every keyframe has 33 normalized points', () => {
  expect(POSE_KEYFRAMES.length).toBeGreaterThanOrEqual(6)
  for (const f of POSE_KEYFRAMES) { expect(f.length).toBe(33); for (const [x, y] of f) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(1); expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(1) } }
})
test('rep starts and ends standing, hips lowest mid-rep', () => {
  expect(POSE_KEYFRAMES[0]).toEqual(POSE_KEYFRAMES.at(-1))
  const hipY = (t: number) => posePointAt(POSE_KEYFRAMES, 23, t)[1]
  expect(hipY(0.5)).toBeGreaterThan(hipY(0))   // y grows downward
})
test('posePointAt interpolates and clamps t', () => {
  expect(posePointAt(POSE_KEYFRAMES, 0, 0)).toEqual(POSE_KEYFRAMES[0][0])
  expect(posePointAt(POSE_KEYFRAMES, 0, 1.7)).toEqual(POSE_KEYFRAMES.at(-1)![0])
})
```
```ts
// tests/text-points.test.ts
import { test, expect } from 'vitest'
import { pointsFromAlpha, fitFontSize } from '../src/hero/text-points'
test('pointsFromAlpha returns only opaque pixels on the step grid', () => {
  const w = 4, h = 2, a = new Uint8ClampedArray(w * h).fill(0); a[1] = 255; a[6] = 200
  expect(pointsFromAlpha(a, w, h, 1)).toEqual([[1, 0], [2, 1]])
  expect(pointsFromAlpha(a, w, h, 2)).toEqual([[2, 1]])
})
test('fitFontSize picks the largest size that fits and never exceeds bounds', () => {
  const measure = (px: number) => px * 5       // 5 px wide per px of font size
  expect(fitFontSize('ETHAN TRAN', 500, measure)).toBe(100)
  expect(fitFontSize('ETHAN TRAN', 10, measure)).toBe(24)
  expect(fitFontSize('ETHAN TRAN', 1e9, measure)).toBe(240)
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run tests/pose.test.ts tests/text-points.test.ts`  Expected: FAIL (modules missing).

- [ ] **Step 3: Write `pose.ts`**

Hand-author 7 frames of a side-on squat (standing, quarter, half, bottom, half, quarter, standing). Author the 13 landmarks that matter (nose, shoulders, elbows, wrists, hips, knees, ankles) and fill the remaining 20 MediaPipe slots (face, fingers, heels, toes) by small fixed offsets from their parent joint — the silhouette only needs to read as a person at ~600 points.

- [ ] **Step 4: Write `text-points.ts`**

`textPoints` draws `text` with `font` (bold, the site's sans; fall back to `sans-serif` if the font isn't loaded — call `await document.fonts.ready` in the caller, not here) centered on a `w × h` canvas and reads `getImageData` alpha. `step` = `Math.max(2, Math.round(fontPx / 24))`. The DOM-touching `textPoints` is not unit-tested; the two pure helpers are.

- [ ] **Step 5: Run tests**

Run: `npx vitest run`  Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(hero): squat keyframes and text point sampling"
```

### Task 5: Particle system and choreography

**Files:**
- Create: `src/hero/particles.ts`, `src/hero/index.ts`
- Modify: `src/main.ts`, `src/styles/site.css`

**Interfaces:**
- Consumes: Task 4's `POSE_KEYFRAMES`, `posePointAt`, `textPoints`.
- Produces (in `particles.ts`): `interface Point { x: number; y: number; vx: number; vy: number; tx: number; ty: number; r: number; a: number }`; `createPoints(n: number, w: number, h: number): Point[]` (random positions, `a = 0`); `stepPoints(pts: Point[], dt: number, pointer: { x: number; y: number; active: boolean }, opts: { spring: number; damping: number; repelRadius: number; repelForce: number }): void` (spring toward `tx,ty`, pointer repulsion within `repelRadius`, velocity damping); `drawPoints(ctx: CanvasRenderingContext2D, pts: Point[], color: string): void` (additive glow: `globalCompositeOperation = 'lighter'`, two concentric fills per point).
- Produces (in `hero/index.ts`): `initHero(canvas: HTMLCanvasElement, nameEl: HTMLElement, text: string): () => void` — returns a dispose function. Behavior below.

- [ ] **Step 1: Implement `particles.ts`**

Signatures above. Physics per frame: `vx += (tx - x) * spring; vy += (ty - y) * spring;` then if pointer active and within `repelRadius`, add `(dx/d) * repelForce * (1 - d/repelRadius)`; then `vx *= damping`, `x += vx * dt * 60`. Defaults used by index: `spring 0.04, damping 0.86, repelRadius 80, repelForce 2.2`.

- [ ] **Step 2: Implement `hero/index.ts` choreography**

- Reduced motion (`matchMedia('(prefers-reduced-motion: reduce)').matches`) or canvas unsupported → return a no-op; `nameEl` stays visible as plain text. Otherwise add class `hero-name--hidden` to `nameEl` (visually hidden, still in the accessibility tree) and run:
- Sizing: `n = innerWidth < 768 ? 250 : 600`; canvas `width/height` = CSS size × `min(devicePixelRatio, 2)`; recompute size, `textPoints(...)` targets and reassign `tx,ty` on `resize` (debounced 150 ms). Points keep positions; only targets change.
- Timeline (ms, from first frame): **0–1200** the first 33 points follow `posePointAt(i, t)` scaled into a centered box (height 70 % of canvas), remaining points `a` fades 0→0.25 drifting; **1200–1500** all points get random velocity (scatter); **1500–2500** targets = text points, `spring` eased up from 0.01 → 0.04; **≥ 2500** idle: spring/damping defaults, pointer repulsion on (`pointermove` on the hero updates `pointer`, `pointerleave` sets `active=false`).
- Lifecycle: `IntersectionObserver` on the canvas pauses the rAF loop when < 5 % visible; `visibilitychange` pauses when the tab is hidden; dispose removes listeners and cancels rAF.

- [ ] **Step 3: Wire into `main.ts` and style**

After `mount()`: `await document.fonts.ready; initHero(canvas, h1, 'ETHAN TRAN')`. CSS: hero is `min-height: 100svh`, canvas absolutely fills it, `.hero-name--hidden` uses the standard visually-hidden pattern, hero copy sits below the canvas's center with `pointer-events` so buttons stay clickable (copy container `position: relative; z-index: 1`).

- [ ] **Step 4: Verify in the browser pane**

Open the dev server: intro plays once in ≤ 2.5 s and settles into the name; cursor pushes points; resize the pane → the name re-fits with no stray points; `resize_window` `mobile` → fewer points, still legible; scroll the hero off → DevTools Performance shows no rAF activity (or temporarily `console.count` in the loop and watch it stop). Enable "Emulate CSS prefers-reduced-motion" in DevTools Rendering → plain text name, no canvas drawing. Expected: all pass.

- [ ] **Step 5: Check the size budget**

Run: `npm run build`  Expected: the hero chunk (or main chunk minus animejs) ≤ 15 KB gzip as reported by Vite. If over, cut pose frames to 5 and drop the extra glow pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(hero): particle choreography — squat to name, pointer repel, reduced-motion fallback" && git push
```

---

## Milestone 3 — Motion pass (Task 6)

### Task 6: Scroll reveals, heading staggers, nav blur, experience rail

**Files:**
- Create: `src/motion.ts`
- Modify: `src/main.ts`, `src/styles/site.css`

**Interfaces:**
- Consumes: anime.js v4 — `import { animate, stagger, onScroll } from 'animejs'`.
- Produces: `initMotion(): void`. No-op under reduced motion.

- [ ] **Step 1: Implement `initMotion()`**

- Nav: toggle class `nav--scrolled` (backdrop blur + bottom hairline) when `scrollY > 24`, via one passive `scroll` listener.
- Section headings: split each `h2` into `<span class="ch">` per character (aria: set `aria-label` on the `h2` to its original text and `aria-hidden` on spans), then `animate('.section h2 .ch', { opacity: [0, 1], translateY: [12, 0], delay: stagger(18), autoplay: onScroll({ target: thatH2, enter: 'bottom-=10% top' }) })` — once only (`sync: false`, no leave/reverse).
- Cards and timeline items: `.reveal` elements start `opacity: 0; translateY: 16px` in CSS **only when `html.js-motion` is present** (set that class in `initMotion()` before animating), then `animate` each with `onScroll` enter, stagger 60 ms within a section. Without JS the content is simply visible.
- Experience rail: a real `<span class="rail">` element inside `ol.timeline` (pseudo-elements can't be animated by anime.js); `animate(rail, { height: ['0%', '100%'], autoplay: onScroll({ target: '#experience', sync: true }) })`.
- Hero copy: on load, `animate('.hero-copy > *', { opacity: [0,1], translateY: [8,0], delay: stagger(90, { start: 1600 }) })` so it lands as the name assembles.

- [ ] **Step 2: Verify in the browser pane**

Headings letter-in once, cards rise once per page load, rail follows scroll, nav blurs after scrolling; reduced-motion emulation → everything visible with no animation; `resize_window` `mobile` at 375 px and custom 320 px wide → no horizontal overflow (`document.documentElement.scrollWidth === innerWidth` via `javascript_tool`). Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: scroll reveals, heading staggers, nav blur, experience rail" && git push
```

---

## Milestone 4 — Polish + SEO (Task 7)

### Task 7: Metadata, OG image, Lighthouse to target

**Files:**
- Modify: `index.html`
- Create: `public/og.png` (1200×630), `public/robots.txt`

- [ ] **Step 1: Metadata**

In `<head>`: `description`, canonical `https://ethanctran.com/`, `og:title|description|image|url|type`, `twitter:card=summary_large_image`, `theme-color=#0b0d10`, `<link rel="icon" href="/favicon.svg">`, preload the two woff2 files. `robots.txt`: `User-agent: *` / `Allow: /`.

- [ ] **Step 2: OG image**

Open the deployed hero in the browser pane at 1200×630 (`resize_window` width 1200 height 630), wait for the name to settle, screenshot, save as `public/og.png`. (Static PNG — my call; regenerate by hand if the hero changes.)

- [ ] **Step 3: Lighthouse**

Run: `npx lighthouse https://<project>.pages.dev --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh.json && node -e "const r=require('/tmp/lh.json').categories;for(const k in r)console.log(k,r[k].score*100)"` for mobile (default) and again with `--preset=desktop`. Expected: Performance ≥ 95 both, others 100. Fix what it flags (usual suspects: unpreloaded font, missing `width/height` on `img`, contrast of `--muted`).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: metadata, OG image, lighthouse fixes" && git push
```

---

## Milestone 5 — Domain, analytics, real content, launch (Task 8)

### Task 8: Launch

**Files:**
- Modify: `src/content.ts`, `public/resume.pdf`, `README.md`

- [x] **Step 1: (Ethan) Register the domain** — done 2026-11-14. Record the exact domain and registrar in `README.md` and replace `ethanctran.com` throughout this plan/spec if a different name was bought.

- [ ] **Step 2: (Ethan) Attach it to Pages**

*If registered at Cloudflare:* Pages project → Custom domains → Set up a custom domain → `ethanctran.com` → Activate (DNS record is created automatically). Repeat for `www.ethanctran.com`; Cloudflare redirects `www` → apex. SSL is automatic; allow a few minutes.

*If registered elsewhere (Namecheap, GoDaddy, Porkbun, Google/Squarespace…):* easiest is to move DNS to Cloudflare first — Cloudflare dashboard → Add a domain → enter it → Free plan → copy the two nameservers Cloudflare gives → paste them into the registrar's "Nameservers / DNS" settings (replacing the registrar's own). Propagation takes minutes to a few hours; Cloudflare emails when active. Then do the "registered at Cloudflare" steps above. (Alternative without moving DNS: add a `CNAME` for `@` and `www` → `<project>.pages.dev` at the registrar, then add both as custom domains in Pages — but apex CNAMEs aren't supported by every registrar, so moving nameservers is the reliable path.)

- [ ] **Step 3: (Ethan) Turn on Web Analytics**

Pages project → Metrics → Web Analytics → Enable. (Cloudflare injects the beacon; no code change, no cookies.)

- [ ] **Step 4: Verify domain, HTTPS, and path tracking**

Run: `curl -sI https://ethanctran.com/ | head -1` → `HTTP/2 200`; `curl -sI https://www.ethanctran.com/ | head -1` → `HTTP/2 301`; `curl -sI https://ethanctran.com/test-link | head -1` → `HTTP/2 200`. Open `https://ethanctran.com/test-link` once in a real browser, wait ~5 min, confirm `/test-link` appears under Web Analytics → Paths.

- [ ] **Step 5: Real content**

Replace every `TODO:` in `src/content.ts` with Ethan's resume content; drop the real `resume.pdf` into `public/`. Run `npx vitest run` and add this assertion to `tests/render.test.ts`: `test('no TODO placeholders remain', () => { expect(JSON.stringify({ site, projects, experience, about })).not.toMatch(/TODO:/) })`. Expected: PASS.

- [ ] **Step 6: Final checks and commit**

Lighthouse again on `https://ethanctran.com` (Task 7 Step 3 command) — targets still met. Then:

```bash
git add -A && git commit -m "feat: real content and resume; launch" && git push
```

- [ ] **Step 7: Per-application links (how to use, no code)**

For each application, send `https://ethanctran.com/<company>` (e.g. `/stripe`). Each path shows as its own row in Web Analytics → Paths, so you can see which companies opened it and when. Resume opens show up as `/resume.pdf`.
