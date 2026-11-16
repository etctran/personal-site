import { test, expect } from 'vitest'
import { stickTop, recede, covered } from '../src/stack'

/* a card pins when its last line is on screen, then falls back as you keep scrolling */

test('stickTop pins a short card at the top, and a tall card with its bottom at the bottom of the screen', () => {
  expect(stickTop(500, 900)).toBe(0)
  expect(stickTop(900, 900)).toBe(0)
  expect(stickTop(1500, 900)).toBe(-600)
})

test('recede is 0 until the card has pinned', () => {
  // tall card: slot top 1000, card 1500 tall, screen 900 → pins at scroll 1600
  expect(recede(1000, 1000, 1500, 900, 720)).toBe(0)
  expect(recede(1600, 1000, 1500, 900, 720)).toBe(0)
  // short card pins as soon as its top reaches the top of the screen
  expect(recede(999, 1000, 500, 900, 720)).toBe(0)
  expect(recede(1000, 1000, 500, 900, 720)).toBe(0)
})

test('recede runs 0 to 1 across the gap after pinning, then holds at 1', () => {
  expect(recede(1960, 1000, 1500, 900, 720)).toBeCloseTo(0.5)
  expect(recede(2320, 1000, 1500, 900, 720)).toBe(1)
  expect(recede(5000, 1000, 1500, 900, 720)).toBe(1)
  expect(recede(1360, 1000, 500, 900, 720)).toBeCloseTo(0.5)
})

test('recede never goes backwards as you scroll down', () => {
  let prev = 0
  for (let y = 900; y < 2600; y += 37) {
    const r = recede(y, 1000, 1500, 900, 720)
    expect(r).toBeGreaterThanOrEqual(prev)
    prev = r
  }
})

/* once the next card has slid over it, a card underneath must be gone, not showing through */
test('covered is 0 until the card has finished falling back', () => {
  // tall card pins at 1600, falls back until 2320
  expect(covered(1600, 1000, 1500, 900, 720, 540)).toBe(0)
  expect(covered(2320, 1000, 1500, 900, 720, 540)).toBe(0)
})

test('covered runs 0 to 1 while the next card slides over, then stays 1', () => {
  expect(covered(2590, 1000, 1500, 900, 720, 540)).toBeCloseTo(0.5)
  expect(covered(2860, 1000, 1500, 900, 720, 540)).toBe(1)
  expect(covered(9000, 1000, 1500, 900, 720, 540)).toBe(1)
})
