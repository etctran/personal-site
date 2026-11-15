const SEEN = 'entered'

/**
 * The intro screen: the page is held back (html.intro-on, set in <head> before
 * first paint) while the particles spell the name. Enter, Space, a click, a
 * tap, a scroll or a swipe all go in. `onEnter` runs once, at that moment.
 * The choice is remembered for this browser tab, so a reload goes straight in.
 */
export function initIntro(onEnter: () => void): void {
  const root = document.documentElement
  const el = document.querySelector<HTMLElement>('#intro')
  const btn = document.querySelector<HTMLButtonElement>('#enter')
  let done = false

  const enter = (): void => {
    if (done) return
    done = true
    try {
      sessionStorage.setItem(SEEN, '1')
    } catch {
      /* private mode: the intro simply shows again next load */
    }
    root.classList.remove('intro-on')
    root.classList.add('intro-out')
    removeEventListener('keydown', onKey)
    removeEventListener('wheel', enter)
    removeEventListener('touchmove', enter)
    onEnter()
    setTimeout(() => {
      root.classList.remove('intro-out')
      el?.remove()
    }, 700)
  }
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      enter()
    }
  }

  addEventListener('keydown', onKey)
  addEventListener('wheel', enter, { passive: true })
  addEventListener('touchmove', enter, { passive: true })
  el?.addEventListener('click', enter)
  btn?.focus({ preventScroll: true })
}
