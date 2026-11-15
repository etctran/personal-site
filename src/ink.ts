/**
 * How many of `n` words are inked for a statement whose top is `top` px from
 * the viewport top. Inking starts as the top passes 85 % of the viewport and
 * finishes once the whole statement is above the middle.
 */
export function inkedCount(top: number, height: number, viewport: number, n: number): number {
  const start = viewport * 0.85
  const span = viewport * 0.35 + height
  const p = Math.min(1, Math.max(0, (start - top) / span))
  return Math.round(p * n)
}

/**
 * Scroll moment: the statement's words go from secondary ink to full ink as it
 * scrolls up the page, and back on the way down. Reduced motion and no-JS:
 * the statement simply stands in full ink.
 */
export function initInk(el: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const text = el.textContent ?? ''
  el.textContent = ''
  const words: HTMLElement[] = []
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue
    if (/^\s+$/.test(part)) {
      el.append(part)
      continue
    }
    const s = document.createElement('span')
    s.className = 'w'
    s.textContent = part
    el.append(s)
    words.push(s)
  }
  el.classList.add('ink-scroll')

  let shown = -1
  let pending = false
  const update = (): void => {
    pending = false
    const r = el.getBoundingClientRect()
    const count = inkedCount(r.top, r.height, innerHeight, words.length)
    if (count === shown) return
    words.forEach((w, i) => w.classList.toggle('on', i < count))
    shown = count
  }
  const onScroll = (): void => {
    if (!pending) {
      pending = true
      requestAnimationFrame(update)
    }
  }
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  update()
}
