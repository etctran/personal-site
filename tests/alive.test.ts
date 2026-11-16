import { test, expect } from 'vitest'
import { paletteFor, BASE_HUES } from '../src/field/palette'
import { dissolve } from '../src/field/blend'
import { magnetOffset } from '../src/magnet'

/* ---- 1. the palette follows the visitor's local time ---- */
test('mid-afternoon is the base palette, unshifted', () => {
  expect(paletteFor(15)).toEqual(BASE_HUES)
})

test('night turns the palette cool, noon leaves it warm, and every hue stays a valid angle', () => {
  const night = paletteFor(2)
  const warm = (hs: number[]) => hs.filter((h) => h < 70 || h > 300).length
  expect(warm(night)).toBeLessThan(warm(BASE_HUES))
  for (const hs of [paletteFor(0), paletteFor(6), paletteFor(12), paletteFor(21), paletteFor(23.99)]) {
    expect(hs.length).toBe(BASE_HUES.length)
    for (const h of hs) {
      expect(h).toBeGreaterThanOrEqual(0)
      expect(h).toBeLessThan(360)
    }
  }
})

test('the palette changes smoothly across midnight and never jumps', () => {
  const a = paletteFor(23.99)
  const b = paletteFor(0.01)
  a.forEach((h, i) => expect(Math.abs(h - b[i])).toBeLessThan(3))
})

test('the shift keeps the six hues distinct, so arcs on the ring stay tellable apart', () => {
  for (const hour of [0, 4, 8, 12, 16, 20]) {
    const hs = paletteFor(hour)
    for (let i = 1; i < hs.length; i++) expect(Math.abs(hs[i] - hs[i - 1])).toBeGreaterThan(8)
  }
})

/* ---- 3. the name dissolves into the field on scroll ---- */
test('dissolve is 0 at the top of the page and 1 once the hero has scrolled off', () => {
  expect(dissolve(0, 900)).toBe(0)
  expect(dissolve(60, 900)).toBe(0) // a nudge does nothing
  expect(dissolve(700, 900)).toBe(1)
  expect(dissolve(5000, 900)).toBe(1)
})

test('dissolve eases from 0 to 1 between 10% and 75% of a screen of scroll', () => {
  const mid = dissolve(382, 900)
  expect(mid).toBeGreaterThan(0.4)
  expect(mid).toBeLessThan(0.6)
  let prev = 0
  for (let y = 0; y <= 900; y += 25) {
    const d = dissolve(y, 900)
    expect(d).toBeGreaterThanOrEqual(prev)
    prev = d
  }
})

/* ---- 5. magnetic buttons ---- */
test('a button leans toward a nearby pointer and not toward a far one', () => {
  // button 120x48 centred at (500, 400); pull reaches 90px past its edge
  const near = magnetOffset(500 + 100, 400 + 30, 500, 400, 120, 48, 90)
  expect(near.x).toBeGreaterThan(4)
  expect(near.y).toBeGreaterThan(1)
  expect(magnetOffset(500 + 400, 400, 500, 400, 120, 48, 90)).toEqual({ x: 0, y: 0 })
})

test('the lean is strongest at the centre side-to-side, capped, and symmetric', () => {
  const r = magnetOffset(560, 400, 500, 400, 120, 48, 90)
  const l = magnetOffset(440, 400, 500, 400, 120, 48, 90)
  expect(l.x).toBeCloseTo(-r.x)
  expect(Math.abs(r.x)).toBeLessThanOrEqual(18)
  expect(Math.abs(r.y)).toBeLessThanOrEqual(12)
})
