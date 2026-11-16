const HUES = [6, 30, 50, 135, 190, 218]

/**
 * How far apart neighbouring colour layers of the name sit, in px. At 0,0 all
 * six sit exactly on top of each other and the name reads white.
 * `pointer` is the pointer's position over the hero, -0.5..0.5 from its
 * middle (null when there is no pointer: the colours then drift gently).
 * `scroll` is 0..1 as the hero scrolls away, `burst` is 0..1 for the entrance
 * and for a click, `t` is the clock in ms.
 */
export function prismShift(
  pointer: { x: number; y: number } | null,
  scroll: number,
  burst: number,
  t: number,
): { dx: number; dy: number } {
  const bx = pointer ? pointer.x * 26 : Math.sin(t * 0.0011) * 5
  const by = pointer ? pointer.y * 18 : Math.sin(t * 0.0014) * 3
  return { dx: bx + burst * 46, dy: by + scroll * 20 + burst * 10 }
}

/**
 * Prism: rebuilds the h1 as six coloured copies under a white one. They start
 * thrown wide and snap together into white; after that they fan apart toward
 * the pointer, on a click, and as the hero scrolls away.
 * Reduced motion: the h1 is left as plain white text.
 */
export function initName(h1: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const lines = [...h1.querySelectorAll<HTMLElement>('.name__line')].map((l) => l.textContent ?? '')
  if (!lines.length) return
  h1.setAttribute('aria-label', lines.join(' '))
  const copy = (): string => lines.map((l) => `<span class="name__line">${l}</span>`).join('')
  h1.innerHTML =
    HUES.map(
      (h, i) => `<span class="prism__c" aria-hidden="true" style="--k: ${i - 2.5}; color: hsl(${h} 100% 55%)">${copy()}</span>`,
    ).join('') + `<span class="prism__w" aria-hidden="true">${copy()}</span>`
  h1.classList.add('is-prism')

  const area = h1.closest<HTMLElement>('.hero') ?? h1
  let pointer: { x: number; y: number } | null = null
  let burst = 1
  let dx = 46
  let dy = 10
  let raf = 0
  let visible = true

  const frame = (now: number): void => {
    burst += (0 - burst) * 0.06
    if (burst < 0.002) burst = 0
    const target = prismShift(pointer, Math.min(1, scrollY / (innerHeight * 0.8)), burst, now)
    dx += (target.dx - dx) * 0.14
    dy += (target.dy - dy) * 0.14
    h1.style.setProperty('--dx', `${dx.toFixed(2)}px`)
    h1.style.setProperty('--dy', `${dy.toFixed(2)}px`)
    raf = visible ? requestAnimationFrame(frame) : 0
  }

  const move = (e: PointerEvent): void => {
    const r = area.getBoundingClientRect()
    pointer = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
  }
  const leave = (): void => {
    pointer = null
  }
  area.addEventListener('pointermove', move)
  area.addEventListener('pointerdown', move)
  area.addEventListener('pointerleave', leave)
  area.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') leave()
  })
  area.addEventListener('pointercancel', leave)
  h1.addEventListener('pointerdown', () => {
    burst = Math.max(burst, 0.8)
  })

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !raf) raf = requestAnimationFrame(frame)
  }).observe(h1)
  raf = requestAnimationFrame(frame)
}
