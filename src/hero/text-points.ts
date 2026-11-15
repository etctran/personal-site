import type { Pt } from './pose'

/** Pixel coordinates with alpha > 128, sampled on a `step` grid from (0, 0). */
export function pointsFromAlpha(alpha: Uint8ClampedArray, w: number, h: number, step: number): Pt[] {
  const out: Pt[] = []
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step) if (alpha[y * w + x] > 128) out.push([x, y])
  return out
}

/** Largest integer font size in [24, 240] whose measured width fits `maxWidth`. */
export function fitFontSize(text: string, maxWidth: number, measure: (px: number) => number): number {
  void text
  let lo = 24
  let hi = 240
  if (measure(lo) > maxWidth) return lo
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (measure(mid) <= maxWidth) lo = mid
    else hi = mid - 1
  }
  return lo
}

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Draws `text` centered on a w×h offscreen canvas in `font` (a CSS family
 * list) and returns exactly `count` points sampled from its opaque pixels.
 */
export function textPoints(text: string, w: number, h: number, count: number, font: string): Pt[] {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return Array.from({ length: count }, () => [w / 2, h / 2] as Pt)

  const setFont = (px: number): void => {
    ctx.font = `800 ${px}px ${font}`
  }
  const px = fitFontSize(text, w * 0.9, (p) => {
    setFont(p)
    return ctx.measureText(text).width
  })
  setFont(px)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, w / 2, h / 2)

  const data = ctx.getImageData(0, 0, w, h).data
  const alpha = new Uint8ClampedArray(w * h)
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3]

  const step = Math.max(2, Math.round(px / 24))
  const sampled = shuffle(pointsFromAlpha(alpha, w, h, step))
  if (sampled.length === 0) return Array.from({ length: count }, () => [w / 2, h / 2] as Pt)
  return Array.from({ length: count }, (_, i) => sampled[i % sampled.length])
}
