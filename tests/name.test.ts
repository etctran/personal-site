import { test, expect } from 'vitest'
import { weightFor, nearness } from '../src/name'

test('nearness is 1 at the pointer, 0 at or beyond the radius, smoothstep between', () => {
  expect(nearness(0, 100)).toBe(1)
  expect(nearness(100, 100)).toBe(0)
  expect(nearness(250, 100)).toBe(0)
  expect(nearness(50, 100)).toBe(0.5)
})

test('letters are heavy at rest and thin out under the pointer', () => {
  expect(weightFor(100, 100)).toBe(800)
  expect(weightFor(0, 100)).toBe(250)
  const ws = [0, 20, 40, 60, 80, 100].map((d) => weightFor(d, 100))
  for (let i = 1; i < ws.length; i++) expect(ws[i]).toBeGreaterThan(ws[i - 1])
})

test('weightFor honours custom rest and peak', () => {
  expect(weightFor(0, 10, 400, 700)).toBe(700)
  expect(weightFor(10, 10, 400, 700)).toBe(400)
})
