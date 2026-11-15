export type Theme = 'light' | 'dark'

const KEY = 'theme'

/** A stored choice wins; anything else falls back to the system setting. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored
  return prefersDark ? 'dark' : 'light'
}

/** Radius that covers the whole viewport from (x, y): the distance to the farthest corner. */
export function revealRadius(x: number, y: number, w: number, h: number): number {
  return Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
}

function stored(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function save(t: Theme): void {
  try {
    localStorage.setItem(KEY, t)
  } catch {
    /* private mode: the choice lasts for this page only */
  }
}

/**
 * Light/dark toggle. The new theme opens as a circle growing from the button
 * (View Transitions); without that API, or under reduced motion, it switches at once.
 */
export function initTheme(btn: HTMLButtonElement): void {
  const root = document.documentElement
  const prefersDark = matchMedia('(prefers-color-scheme: dark)')
  const current = (): Theme => resolveTheme(root.dataset.theme ?? stored(), prefersDark.matches)
  const label = (): void => {
    const t = current()
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
    btn.dataset.state = t
  }
  label()
  prefersDark.addEventListener('change', label)

  btn.addEventListener('click', () => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    const apply = (): void => {
      root.dataset.theme = next
      save(next)
      label()
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !document.startViewTransition) return apply()

    const r = btn.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = revealRadius(x, y, innerWidth, innerHeight)
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  })
}
