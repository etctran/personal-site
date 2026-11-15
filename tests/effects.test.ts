import { test, expect } from 'vitest'
import { waveBoost, WAVE } from '../src/name'
import { inkedCount } from '../src/ink'

/* ---- name ripple ---- */
test('waveBoost peaks where the wave front is, early in the wave', () => {
  const t = 100
  const front = WAVE.speed * t
  expect(waveBoost(front, t)).toBeGreaterThan(0.85)
})

test('waveBoost is ~0 far from the front and 0 once the wave is over', () => {
  expect(waveBoost(WAVE.speed * 200 + WAVE.width * 4, 200)).toBeLessThan(0.01)
  expect(waveBoost(WAVE.speed * WAVE.duration, WAVE.duration)).toBe(0)
  expect(waveBoost(0, -5)).toBe(0)
})

test('waveBoost fades as the wave travels', () => {
  const early = waveBoost(WAVE.speed * 100, 100)
  const late = waveBoost(WAVE.speed * 600, 600)
  expect(late).toBeLessThan(early)
})

/* ---- about statement brightens with scroll ---- */
// viewport 1000, statement 200 tall: done the moment its bottom edge is on screen (top 800),
// and it starts 200px of scroll before that (top 1000)
test('inkedCount is 0 until the statement starts to come up the screen', () => {
  expect(inkedCount(1100, 200, 1000, 40)).toBe(0)
  expect(inkedCount(1000, 200, 1000, 40)).toBe(0)
})

test('inkedCount is every word the moment the whole statement is on screen', () => {
  expect(inkedCount(800, 200, 1000, 40)).toBe(40) // bottom edge exactly at the bottom of the viewport
  expect(inkedCount(300, 200, 1000, 40)).toBe(40)
  // the cases from the bug report: fully visible, low on the screen or mid-screen
  expect(inkedCount(482, 270, 800, 32)).toBe(32)
  expect(inkedCount(190, 520, 1000, 41)).toBe(41)
})

test('inkedCount is halfway when the statement is halfway in, and never goes backwards', () => {
  expect(inkedCount(900, 200, 1000, 40)).toBe(20)
  const counts = [1000, 960, 920, 880, 840, 800].map((top) => inkedCount(top, 200, 1000, 40))
  for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1])
})

test('inkedCount still finishes for a statement taller than the viewport', () => {
  expect(inkedCount(150, 1400, 1000, 60)).toBe(60) // done once its top is near the top of the screen
  expect(inkedCount(500, 1400, 1000, 60)).toBeLessThan(60)
})
