/**
 * How far a button leans toward the pointer: nothing beyond `reach` px of its
 * edge, up to 18 px sideways and 12 px vertically at the edge, easing back to 0
 * at the button's centre and at the reach limit.
 */
export function magnetOffset(
  px: number,
  py: number,
  cx: number,
  cy: number,
  w: number,
  h: number,
  reach: number,
): { x: number; y: number } {
  const dx = px - cx
  const dy = py - cy
  // distance outside the button's box (0 while over it)
  const ox = Math.max(0, Math.abs(dx) - w / 2)
  const oy = Math.max(0, Math.abs(dy) - h / 2)
  const d = Math.hypot(ox, oy)
  if (d >= reach) return { x: 0, y: 0 }
  const pull = 1 - d / reach
  return {
    x: Math.max(-18, Math.min(18, (dx / (w / 2 + reach)) * 18 * pull)),
    y: Math.max(-12, Math.min(12, (dy / (h / 2 + reach)) * 12 * pull)),
  }
}

/** Makes every `.btn` lean toward a nearby pointer and spring back. Hover-only; nothing on touch or with reduced motion. */
export function initMagnets(): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const buttons = [...document.querySelectorAll<HTMLElement>('.btn')]
  if (!buttons.length) return
  const state = buttons.map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }))
  let px = -1e4
  let py = -1e4
  let raf = 0
  const frame = (): void => {
    let moving = false
    for (const s of state) {
      const r = s.el.getBoundingClientRect()
      const o = magnetOffset(px, py, r.left + r.width / 2, r.top + r.height / 2, r.width, r.height, 90)
      s.tx = o.x
      s.ty = o.y
      s.x += (s.tx - s.x) * 0.18
      s.y += (s.ty - s.y) * 0.18
      if (Math.abs(s.tx - s.x) > 0.05 || Math.abs(s.ty - s.y) > 0.05) moving = true
      s.el.style.setProperty('--mx', `${s.x.toFixed(2)}px`)
      s.el.style.setProperty('--my', `${s.y.toFixed(2)}px`)
    }
    raf = moving ? requestAnimationFrame(frame) : 0
  }
  const kick = (): void => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  addEventListener('pointermove', (e) => {
    px = e.clientX
    py = e.clientY
    kick()
  })
  document.addEventListener('pointerleave', () => {
    px = py = -1e4
    kick()
  })
  addEventListener('scroll', kick, { passive: true })
}
