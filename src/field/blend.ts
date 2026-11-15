/**
 * Which two formations to mix for the current scroll position.
 * `tops` are the page-Y tops of the hero and sections (ascending, first is 0),
 * `center` is the page-Y of the middle of the viewport, and the mix into the
 * next section happens over the `zone` px before its top.
 */
export function sectionBlend(tops: number[], center: number, zone: number): { from: number; to: number; t: number } {
  let i = 0
  for (let k = 0; k < tops.length; k++) if (tops[k] <= center) i = k
  const next = i + 1
  if (next >= tops.length) return { from: i, to: i, t: 0 }
  const c = Math.min(1, Math.max(0, (center - (tops[next] - zone)) / zone))
  return { from: i, to: next, t: c * c * (3 - 2 * c) }
}
