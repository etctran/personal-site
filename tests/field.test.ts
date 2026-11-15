import { test, expect } from 'vitest'
import { sectionBlend } from '../src/field/blend'
import { velocity, gridHomes, FLOWS, MAX_SPEED, type Dot, type Env } from '../src/field/modes'

/* ---- which two formations to mix, from scroll position ---- */
const tops = [0, 1000, 2400]

test('sectionBlend holds the current formation until the zone before the next section', () => {
  expect(sectionBlend(tops, 300, 400)).toEqual({ from: 0, to: 1, t: 0 })
})

test('sectionBlend eases into the next formation across the zone', () => {
  const mid = sectionBlend(tops, 800, 400)
  expect(mid.from).toBe(0)
  expect(mid.to).toBe(1)
  expect(mid.t).toBeCloseTo(0.5)
  const late = sectionBlend(tops, 950, 400)
  expect(late.t).toBeGreaterThan(mid.t)
  expect(late.t).toBeLessThan(1)
})

test('sectionBlend is continuous across a section top and rests on the last section', () => {
  expect(sectionBlend(tops, 999.9, 400).t).toBeGreaterThan(0.99)
  expect(sectionBlend(tops, 1000, 400)).toEqual({ from: 1, to: 2, t: 0 })
  expect(sectionBlend(tops, 9000, 400)).toEqual({ from: 2, to: 2, t: 0 })
})

/* ---- formations ---- */
const env: Env = { w: 1000, h: 800, t: 0, cx: 700, cy: 400, R: 200, kx: 780, ky: 360, r2: 120 }
const dot = (over: Partial<Dot> = {}): Dot => ({ x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, band: 0, lane: 0, s: 1, a: 0, hx: 0, hy: 0, ...over })
const out: [number, number] = [0, 0]

test('ring pulls a dot toward its own slot on the ring, and rests there', () => {
  velocity('ring', dot({ x: 700, y: 400 }), env, out) // slot for a = 0 is (cx + R, cy)
  expect(out[0]).toBeGreaterThan(0)
  expect(out[1]).toBeCloseTo(0)
  velocity('ring', dot({ x: 900, y: 400 }), env, out)
  expect(Math.hypot(out[0], out[1])).toBeLessThan(0.01)
})

test('core is a smaller ring around its own centre', () => {
  velocity('core', dot({ x: 900, y: 360 }), env, out) // slot is (kx + r2, ky) = (900, 360)
  expect(Math.hypot(out[0], out[1])).toBeLessThan(0.01)
})

test('grid springs a dot to its home cell, then only shimmers around it', () => {
  velocity('grid', dot({ x: 10, y: 300, hx: 410, hy: 300 }), env, out)
  expect(out[0]).toBeGreaterThan(5)
  expect(Math.abs(out[1])).toBeLessThan(1)
  for (const t of [0, 400, 900, 1700]) {
    velocity('grid', dot({ x: 410, y: 300, hx: 410, hy: 300 }), { ...env, t }, out)
    expect(Math.hypot(out[0], out[1])).toBeLessThan(1)
  }
})

test('stream and wave always flow to the right, and are marked as flows', () => {
  for (const mode of ['stream', 'wave'] as const) {
    velocity(mode, dot({ x: 500, y: 300, lane: 0.4 }), env, out)
    expect(out[0]).toBeGreaterThan(0)
    expect(FLOWS[mode]).toBe(true)
  }
  expect(FLOWS.ring || FLOWS.grid || FLOWS.core).toBe(false)
})

test('a far-away dot never gets a velocity above the speed cap', () => {
  for (const mode of ['ring', 'core', 'grid'] as const) {
    velocity(mode, dot({ x: -5000, y: 9000, hx: 500, hy: 400 }), env, out)
    expect(Math.hypot(out[0], out[1])).toBeLessThanOrEqual(MAX_SPEED + 1e-9)
  }
})

test('gridHomes gives every dot a home inside the viewport', () => {
  const homes = gridHomes(2400, 1440, 900)
  expect(homes.length).toBe(2400)
  for (const [x, y] of homes) {
    expect(x).toBeGreaterThan(0)
    expect(x).toBeLessThan(1440)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(900)
  }
})
