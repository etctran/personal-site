const REST = 800
const PEAK = 250

/** 1 at the pointer, 0 at or beyond `radius`, smoothstep between. */
export function nearness(distance: number, radius: number): number {
  const f = Math.max(0, 1 - distance / radius)
  return f * f * (3 - 2 * f)
}

/** Weight for a letter `distance` px from the pointer: `rest` far away, `peak` right under it. */
export function weightFor(distance: number, radius: number, rest = REST, peak = PEAK): number {
  return rest + (peak - rest) * nearness(distance, radius)
}

/** The click ripple: a ring that travels outward through the letters and fades. px, px/ms, ms. */
export const WAVE = { speed: 0.9, width: 90, duration: 1100 }

/** 0..1 strength of the ripple for a letter `distance` px from the click, `elapsed` ms after it. */
export function waveBoost(distance: number, elapsed: number): number {
  if (elapsed < 0 || elapsed >= WAVE.duration) return 0
  const front = WAVE.speed * elapsed
  const g = Math.exp(-(((distance - front) / WAVE.width) ** 2))
  return g * (1 - elapsed / WAVE.duration)
}

const ENTRANCE_STAGGER = 45 // ms, matches .name .ch animation-delay in site.css
const ENTRANCE_LENGTH = 760 // ms, matches the `set` keyframes duration

/**
 * Splits the h1's `.name__line` spans into letters. After the CSS entrance,
 * the heavy letters thin out where the pointer is (the same way the particles
 * scatter from it), and a click or tap sends a ripple of thin through the name.
 * Reduced motion: letters stay put and nothing listens.
 */
export function initName(h1: HTMLElement): void {
  h1.setAttribute('aria-label', h1.textContent?.replace(/\s+/g, ' ').trim() ?? '')
  const letters: { el: HTMLElement; w: number; x: number; y: number }[] = []
  for (const line of h1.querySelectorAll<HTMLElement>('.name__line')) {
    const text = line.textContent ?? ''
    line.textContent = ''
    for (const ch of text) {
      const s = document.createElement('span')
      s.className = 'ch'
      s.textContent = ch
      s.setAttribute('aria-hidden', 'true')
      s.style.setProperty('--i', String(letters.length))
      line.append(s)
      letters.push({ el: s, w: REST, x: 0, y: 0 })
    }
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    h1.classList.add('is-live')
    return
  }

  const pointer = { x: 0, y: 0, on: false }
  let wave: { x: number; y: number; t0: number } | null = null
  let raf = 0
  let live = false

  const measure = (): void => {
    for (const l of letters) {
      const r = l.el.getBoundingClientRect()
      l.x = r.left + r.width / 2
      l.y = r.top + r.height / 2
    }
  }
  const frame = (now: number): void => {
    const radius = parseFloat(getComputedStyle(h1).fontSize) * 1.2
    const elapsed = wave ? now - wave.t0 : -1
    if (wave && elapsed >= WAVE.duration) wave = null
    let moving = wave !== null
    for (const l of letters) {
      let f = pointer.on ? nearness(Math.hypot(pointer.x - l.x, pointer.y - l.y), radius) : 0
      if (wave) f = Math.max(f, waveBoost(Math.hypot(wave.x - l.x, wave.y - l.y), elapsed))
      const target = REST + (PEAK - REST) * f
      l.w += (target - l.w) * 0.22
      if (Math.abs(target - l.w) > 0.5) moving = true
      else l.w = target
      l.el.style.fontVariationSettings = `'wght' ${l.w.toFixed(1)}, 'wdth' 125`
    }
    raf = moving ? requestAnimationFrame(frame) : 0
  }
  const kick = (): void => {
    if (!raf) raf = requestAnimationFrame(frame)
  }

  setTimeout(() => {
    h1.classList.add('is-live')
    live = true
    measure()
  }, ENTRANCE_STAGGER * letters.length + ENTRANCE_LENGTH)

  const area = h1.closest<HTMLElement>('.hero') ?? h1
  const move = (e: PointerEvent): void => {
    if (!live) return
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.on = true
    kick()
  }
  const leave = (): void => {
    pointer.on = false
    kick()
  }
  area.addEventListener('pointermove', move)
  area.addEventListener('pointerdown', move)
  area.addEventListener('pointerleave', leave)
  area.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') leave()
  })
  area.addEventListener('pointercancel', leave)
  h1.addEventListener('pointerdown', (e) => {
    if (!live) return
    measure()
    wave = { x: e.clientX, y: e.clientY, t0: performance.now() }
    kick()
  })
  const remeasure = (): void => {
    if (live) measure()
  }
  addEventListener('scroll', remeasure, { passive: true })
  addEventListener('resize', remeasure)
  document.fonts?.ready.then(remeasure)
}
