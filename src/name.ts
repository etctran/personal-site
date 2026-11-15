/** Weight for a letter `distance` px from the pointer: `peak` at 0, `rest` at ≥ `radius`, smoothstep between. */
export function weightFor(distance: number, radius: number, rest = 300, peak = 900): number {
  const f = Math.max(0, 1 - distance / radius)
  return rest + (peak - rest) * f * f * (3 - 2 * f)
}

const ENTRANCE_STAGGER = 45 // ms, matches .name .ch animation-delay in site.css
const ENTRANCE_LENGTH = 760 // ms, matches the `set` keyframes duration

/**
 * Splits the h1's `.name__line` spans into letters and, after the CSS
 * typesetting entrance, makes each letter heavier as the pointer nears it.
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
      letters.push({ el: s, w: 300, x: 0, y: 0 })
    }
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    h1.classList.add('is-live')
    return
  }

  const pointer = { x: 0, y: 0, on: false }
  let raf = 0
  let live = false

  const measure = (): void => {
    for (const l of letters) {
      const r = l.el.getBoundingClientRect()
      l.x = r.left + r.width / 2
      l.y = r.top + r.height / 2
    }
  }
  const frame = (): void => {
    const radius = parseFloat(getComputedStyle(h1).fontSize) * 1.5
    let moving = false
    for (const l of letters) {
      const target = pointer.on ? weightFor(Math.hypot(pointer.x - l.x, pointer.y - l.y), radius) : 300
      l.w += (target - l.w) * 0.18
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
  const remeasure = (): void => {
    if (live) measure()
  }
  addEventListener('scroll', remeasure, { passive: true })
  addEventListener('resize', remeasure)
  document.fonts?.ready.then(remeasure)
}
