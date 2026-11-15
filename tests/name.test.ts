import { test, expect } from 'vitest'
import { weightFor } from '../src/name'

test('weightFor is the peak at the pointer and the rest at or beyond the radius', () => {
  expect(weightFor(0, 100)).toBe(900)
  expect(weightFor(100, 100)).toBe(300)
  expect(weightFor(250, 100)).toBe(300)
})

test('weightFor falls off smoothly and monotonically', () => {
  const ws = [0, 20, 40, 60, 80, 100].map((d) => weightFor(d, 100))
  for (let i = 1; i < ws.length; i++) expect(ws[i]).toBeLessThan(ws[i - 1])
  expect(weightFor(50, 100)).toBe(600) // smoothstep midpoint
})

test('weightFor honours custom rest and peak', () => {
  expect(weightFor(0, 10, 400, 700)).toBe(700)
  expect(weightFor(10, 10, 400, 700)).toBe(400)
})
