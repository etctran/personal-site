export type Pt = [number, number]

/**
 * Exactly `n` of `points`, in left-to-right order (dots are coloured by index,
 * so this makes the six colours sweep across the name). More points than
 * needed are thinned evenly; fewer are repeated.
 */
export function pickTargets(points: Pt[], n: number): Pt[] {
  if (points.length === 0) return []
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return Array.from({ length: n }, (_, i) => sorted[Math.floor((i * sorted.length) / n)])
}

/**
 * Where `n` dots should sit to spell `lines` (one word per line), centred in a
 * w×h viewport: the text is drawn off-screen and sampled on an even lattice,
 * which gives the letters a halftone look.
 */
export function nameTargets(lines: string[], w: number, h: number, n: number, family: string): Pt[] {
  if (w < 1 || h < 1 || n < 1) return [] // a zero-size viewport (hidden tab, collapsed frame) has nothing to sample
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g || !lines.length) return []
  g.font = `900 100px ${family}`
  const widest = Math.max(...lines.map((l) => g.measureText(l).width)) || 1
  const fs = Math.min(((w * 0.84) / widest) * 100, (h * 0.56) / (lines.length * 0.86))
  const lh = fs * 0.86
  g.font = `900 ${fs}px ${family}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillStyle = '#fff'
  const y0 = h * 0.46 - ((lines.length - 1) * lh) / 2
  lines.forEach((l, i) => g.fillText(l, w / 2, y0 + i * lh))

  const data = g.getImageData(0, 0, w, h).data
  const lit = (x: number, y: number): boolean => data[(y * w + x) * 4 + 3] > 128
  let area = 0
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (lit(x, y)) area += 4
  const step = Math.max(2, Math.floor(Math.sqrt(area / n)))
  const pts: Pt[] = []
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (lit(x, y)) pts.push([x, y])
  return pickTargets(pts, n)
}
