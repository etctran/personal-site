import { test, expect } from 'vitest'
import { prismShift } from '../src/name'

// prismShift returns how far apart neighbouring colour layers sit, in px.
// 0,0 means all six sit exactly on top of each other and the name reads white.

test('the six colours sit together when the pointer is on the middle of the name', () => {
  expect(prismShift({ x: 0, y: 0 }, 0, 0, 1234)).toEqual({ dx: 0, dy: 0 })
})

test('moving the pointer fans the colours out in that direction', () => {
  const right = prismShift({ x: 0.4, y: 0 }, 0, 0, 0)
  expect(right.dx).toBeGreaterThan(5)
  expect(right.dy).toBe(0)
  const upLeft = prismShift({ x: -0.4, y: -0.3 }, 0, 0, 0)
  expect(upLeft.dx).toBeLessThan(-5)
  expect(upLeft.dy).toBeLessThan(-3)
  expect(prismShift({ x: 0.5, y: 0 }, 0, 0, 0).dx).toBeGreaterThan(right.dx)
})

test('with no pointer the colours drift gently and stay close', () => {
  expect(prismShift(null, 0, 0, 0)).toEqual({ dx: 0, dy: 0 })
  for (const t of [300, 900, 2500, 7000]) {
    const s = prismShift(null, 0, 0, t)
    expect(Math.abs(s.dx)).toBeLessThanOrEqual(5)
    expect(Math.abs(s.dy)).toBeLessThanOrEqual(3)
  }
})

test('scrolling away pulls the colours apart vertically', () => {
  const half = prismShift({ x: 0, y: 0 }, 0.5, 0, 0)
  const full = prismShift({ x: 0, y: 0 }, 1, 0, 0)
  expect(half.dy).toBeGreaterThan(0)
  expect(full.dy).toBeGreaterThan(half.dy)
  expect(full.dx).toBe(0)
})

test('a burst (the entrance, or a click) throws the colours wide, and 0 burst adds nothing', () => {
  const burst = prismShift({ x: 0, y: 0 }, 0, 1, 0)
  expect(burst.dx).toBeGreaterThan(30)
  expect(prismShift({ x: 0, y: 0 }, 0, 0.5, 0).dx).toBeLessThan(burst.dx)
})
