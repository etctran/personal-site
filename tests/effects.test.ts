import { test, expect } from 'vitest'
import { waveBoost, WAVE } from '../src/name'
import { inkedCount } from '../src/ink'
import { resolveTheme, revealRadius } from '../src/theme'

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

/* ---- about statement inks in with scroll ---- */
test('inkedCount is 0 before the statement reaches the start line', () => {
  // viewport 1000: starts inking when the top passes 85% (850px)
  expect(inkedCount(900, 200, 1000, 40)).toBe(0)
})

test('inkedCount is all words once the statement passes the end line', () => {
  expect(inkedCount(100, 200, 1000, 40)).toBe(40)
})

test('inkedCount grows monotonically in between', () => {
  const counts = [800, 700, 600, 500, 400].map((top) => inkedCount(top, 200, 1000, 40))
  for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1])
  expect(counts.at(-1)).toBeGreaterThan(counts[0])
})

/* ---- theme ---- */
test('resolveTheme prefers a stored choice, else the system setting', () => {
  expect(resolveTheme('dark', false)).toBe('dark')
  expect(resolveTheme('light', true)).toBe('light')
  expect(resolveTheme(null, true)).toBe('dark')
  expect(resolveTheme('bogus', false)).toBe('light')
})

test('revealRadius reaches the farthest corner from the click', () => {
  expect(revealRadius(0, 0, 300, 400)).toBe(500)
  expect(revealRadius(300, 400, 300, 400)).toBe(500)
  expect(revealRadius(150, 200, 300, 400)).toBe(250)
})
