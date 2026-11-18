/** Where the page reports that a real person has gone in (handled by worker/index.ts). */
export const HUMAN_ENDPOINT = '/_human'

type How = 'enter' | 'engaged'

/**
 * Returns a function that tells the Worker, once per page load, that a person
 * went in: by pressing Enter on the intro, or by first scrolling, clicking or
 * pressing a key when the intro was skipped. Silent if beacons are unavailable.
 */
export function reportHuman(nav: { sendBeacon?: (url: string, data: string) => boolean }, path: string): (how: How) => void {
  let sent = false
  return (how) => {
    if (sent) return
    sent = true
    try {
      nav.sendBeacon?.(HUMAN_ENDPOINT, JSON.stringify({ how, path }))
    } catch {
      /* reporting must never affect the page */
    }
  }
}

/** When the intro is not shown, the first real interaction counts. */
export function reportOnFirstInteraction(send: (how: How) => void): void {
  const events = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const
  const once = (): void => {
    send('engaged')
    for (const e of events) removeEventListener(e, once)
  }
  for (const e of events) addEventListener(e, once, { passive: true })
}
