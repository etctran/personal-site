const smooth = (x: number): number => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/**
 * Which two formations to mix for the current scroll position.
 * `tops` are the page-Y tops of the hero and sections (ascending, first is 0),
 * `center` is the page-Y of the middle of the viewport, and the mix into the
 * next section happens over the `zone` px before its top — but never starts
 * less than `lead` px into the current section, so nothing has begun to change
 * before the visitor scrolls.
 */
export function sectionBlend(
  tops: number[],
  center: number,
  zone: number,
  lead = 0,
): { from: number; to: number; t: number } {
  let i = 0
  for (let k = 0; k < tops.length; k++) if (tops[k] <= center) i = k
  const next = i + 1
  if (next >= tops.length) return { from: i, to: i, t: 0 }
  const z = Math.max(1, Math.min(zone, tops[next] - tops[i] - lead))
  return { from: i, to: next, t: smooth((center - (tops[next] - z)) / z) }
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
