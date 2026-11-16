const smooth = (x: number): number => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * Which two formations to mix at scroll position `y`.
 * `arrivals[j]` is the scroll position at which section j's formation is
 * fully in (arrivals[0] is the hero and is ignored); `zones[j]` is how many
 * px of scroll before that the change takes.
 */
export function sectionBlend(arrivals: number[], y: number, zones: number[]): { from: number; to: number; t: number } {
  let i = 0
  for (let k = 1; k < arrivals.length; k++) if (arrivals[k] <= y) i = k
  const next = i + 1
  if (next >= arrivals.length) return { from: i, to: i, t: 0 }
  const z = Math.max(1, zones[next] ?? 1)
  return { from: i, to: next, t: smooth((y - (arrivals[next] - z)) / z) }
}

/**
 * One dot's own progress through a transition that is `t` (0..1) of the way
 * done overall. `order` (0..1) is the dot's place in the queue: 0 leaves
 * first, 1 last. `spread` is how much of the transition the queue takes up.
 * Every dot is at 0 when t = 0 and at 1 when t = 1.
 */
export function staggered(t: number, order: number, spread = 0.7): number {
  return smooth(t * (1 + spread) - order * spread)
}
