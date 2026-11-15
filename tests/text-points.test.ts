import { test, expect } from 'vitest'
import { pointsFromAlpha, fitFontSize } from '../src/hero/text-points'

test('pointsFromAlpha returns only opaque pixels on the step grid', () => {
  const w = 4
  const h = 2
  const a = new Uint8ClampedArray(w * h).fill(0)
  a[1] = 255 // (1, 0)
  a[6] = 200 // (2, 1) — off the step-2 grid
  a[2] = 130 // (2, 0) — on it
  a[3] = 128 // (3, 0) — not > 128, never sampled
  expect(pointsFromAlpha(a, w, h, 1)).toEqual([
    [1, 0],
    [2, 0],
    [2, 1],
  ])
  expect(pointsFromAlpha(a, w, h, 2)).toEqual([[2, 0]])
})

test('fitFontSize picks the largest size that fits and never exceeds bounds', () => {
  const measure = (px: number) => px * 5 // 5 px wide per px of font size
  expect(fitFontSize('ETHAN TRAN', 500, measure)).toBe(100)
  expect(fitFontSize('ETHAN TRAN', 10, measure)).toBe(24)
  expect(fitFontSize('ETHAN TRAN', 1e9, measure)).toBe(240)
})
