/**
 * How many of `n` words are bright for a statement whose top is `top` px from
 * the viewport top. Every word is bright the moment the whole statement is on
 * screen (its bottom edge has come into view); the brightening happens over
 * the scroll just before that. A statement taller than the viewport finishes
 * once its top is near the top of the screen.
 */
export function inkedCount(top: number, height: number, viewport: number, n: number): number {
  const end = Math.max(viewport * 0.15, viewport - height)
  const start = Math.max(viewport * 0.9, end + viewport * 0.2)
  const p = Math.min(1, Math.max(0, (start - top) / (start - end)))
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
