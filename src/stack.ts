/** How much scroll (in screen heights) a pinned card takes to fall back, and for the particles to warp. */
export const GAP = 0.8

/** The sticky `top` for a card: short cards pin at the top, tall ones once their last line is on screen. */
export function stickTop(panelH: number, viewH: number): number {
  return Math.min(0, viewH - panelH)
}

/**
 * How far a card has fallen back (0..1): 0 until it pins, then 0 to 1 over the
 * next `gap` px of scroll, then 1.
 */
export function recede(scrollY: number, slotTop: number, panelH: number, viewH: number, gap: number): number {
  const pin = slotTop + Math.max(0, panelH - viewH)
  return Math.min(1, Math.max(0, (scrollY - pin) / gap))
}

/**
 * How far the next card has slid over this one (0..1): 0 until this card has
 * finished falling back, then 0 to 1 over the next `span` px of scroll.
 */
export function covered(
  scrollY: number,
  slotTop: number,
  panelH: number,
  viewH: number,
  gap: number,
  span: number,
): number {
  const pin = slotTop + Math.max(0, panelH - viewH)
  return Math.min(1, Math.max(0, (scrollY - pin - gap) / span))
}

/**
 * Sections as a stack of cards: each `.slot > .panel` pins when you reach its
 * end, shrinks back and dims while the particles warp, and the next card
 * slides up over it. Adds `html.stack`, which switches the layout on in CSS;
 * with reduced motion (or no JS) the sections simply follow each other.
 */
export function initStack(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const slots = [...document.querySelectorAll<HTMLElement>('.slot')]
    .map((slot) => ({ slot, panel: slot.querySelector<HTMLElement>('.panel'), top: 0, h: 0 }))
    .filter((s): s is { slot: HTMLElement; panel: HTMLElement; top: number; h: number } => s.panel !== null)
  if (!slots.length) return
  document.documentElement.classList.add('stack')

  let pending = false
  const update = (): void => {
    pending = false
    const vh = innerHeight
    for (const s of slots) {
      const r = recede(scrollY, s.top, s.h, vh, vh * GAP)
      // fully gone by the time the next card is 60% of the way up the screen
      const c = covered(scrollY, s.top, s.h, vh, vh * GAP, vh * 0.6)
      s.panel.style.setProperty('--r', r.toFixed(3))
      s.panel.style.setProperty('--c', c.toFixed(3))
      s.panel.classList.toggle('is-back', r > 0.5)
    }
  }
  const measure = (): void => {
    const vh = innerHeight
    for (const s of slots) {
      s.h = s.panel.offsetHeight
      s.top = s.slot.getBoundingClientRect().top + scrollY
      s.panel.style.setProperty('--stick', `${stickTop(s.h, vh)}px`)
      // shrink toward the middle of what is on screen while pinned
      s.panel.style.setProperty('--oy', `${s.h > vh ? s.h - vh / 2 : s.h / 2}px`)
    }
    update()
  }
  const onScroll = (): void => {
    if (!pending) {
      pending = true
      requestAnimationFrame(update)
    }
  }

  measure()
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', measure)
  const ro = new ResizeObserver(measure)
  for (const s of slots) ro.observe(s.panel)
  document.fonts?.ready.then(measure)
}
