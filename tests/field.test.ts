import { test, expect } from 'vitest'
import { sectionBlend, staggered } from '../src/field/blend'
import { pickTargets } from '../src/field/text'
import { velocity, gridHomes, matchHomes, FLOWS, MAX_SPEED, type Dot, type Env } from '../src/field/modes'

/* ---- which two formations to mix, from scroll position ---- */
// arrivals[j] is the scroll position at which section j's formation is fully in;
// zones[j] is how much scroll before that the change takes.
const arrivals = [0, 1000, 2400]
const zones = [0, 400, 400]

test('sectionBlend holds the current formation until the zone before the next arrival', () => {
  expect(sectionBlend(arrivals, 300, zones)).toEqual({ from: 0, to: 1, t: 0 })
  expect(sectionBlend(arrivals, 600, zones)).toEqual({ from: 0, to: 1, t: 0 })
})

test('sectionBlend eases into the next formation across the zone', () => {
  const mid = sectionBlend(arrivals, 800, zones)
  expect(mid.from).toBe(0)
  expect(mid.to).toBe(1)
  expect(mid.t).toBeCloseTo(0.5)
  const late = sectionBlend(arrivals, 950, zones)
  expect(late.t).toBeGreaterThan(mid.t)
  expect(late.t).toBeLessThan(1)
})

test('sectionBlend is continuous across an arrival and rests on the last section', () => {
  expect(sectionBlend(arrivals, 999.9, zones).t).toBeGreaterThan(0.99)
  expect(sectionBlend(arrivals, 1000, zones)).toEqual({ from: 1, to: 2, t: 0 })
  expect(sectionBlend(arrivals, 9000, zones)).toEqual({ from: 2, to: 2, t: 0 })
})

test('sectionBlend gives each section its own zone', () => {
  const z = [0, 450, 800]
  expect(sectionBlend(arrivals, 1600, z)).toEqual({ from: 1, to: 2, t: 0 })
  expect(sectionBlend(arrivals, 2000, z).t).toBeCloseTo(0.5)
  expect(sectionBlend(arrivals, 550, z).t).toBe(0)
  expect(sectionBlend(arrivals, 775, z).t).toBeCloseTo(0.5)
})

/* ---- each dot makes the change at its own moment, so shapes sweep instead of cross-fading ---- */
test('staggered is 0 for every dot at the start and 1 for every dot at the end', () => {
  for (const order of [0, 0.3, 0.7, 1]) {
    expect(staggered(0, order)).toBe(0)
    expect(staggered(1, order)).toBe(1)
  }
})

test('staggered lets early dots lead and late dots follow', () => {
  expect(staggered(0.3, 0)).toBeGreaterThan(staggered(0.3, 0.5))
  expect(staggered(0.3, 0.5)).toBeGreaterThanOrEqual(staggered(0.3, 1))
  expect(staggered(0.3, 1)).toBe(0) // the last dot has not started yet
  expect(staggered(0.75, 0)).toBe(1) // the first dot has already arrived
})

test('staggered never runs backwards as the scroll advances', () => {
  for (const order of [0, 0.5, 1]) {
    let prev = 0
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const v = staggered(Math.min(1, t), order)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  }
})

/* ---- the intro spells the name out of dots ---- */
test('pickTargets returns exactly n points, sorted left to right so the colours sweep across the name', () => {
  const pts: Array<[number, number]> = [[50, 5], [10, 9], [30, 1], [20, 4], [40, 2]]
  const many = pickTargets(pts, 3)
  expect(many.length).toBe(3)
  const few = pickTargets(pts, 12)
  expect(few.length).toBe(12)
  for (const out of [many, few]) {
    for (let i = 1; i < out.length; i++) expect(out[i][0]).toBeGreaterThanOrEqual(out[i - 1][0])
    for (const p of out) expect(pts).toContainEqual(p)
  }
  expect(few[0]).toEqual([10, 9])
  expect(few.at(-1)).toEqual([50, 5])
  expect(pickTargets([], 5)).toEqual([])
})

/* ---- formations ---- */
const env: Env = { w: 1000, h: 800, t: 0, cx: 700, cy: 400, R: 200, kx: 780, ky: 360, r2: 120 }
const dot = (over: Partial<Dot> = {}): Dot => ({ x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, band: 0, lane: 0, s: 1, a: 0, o: 0, hx: 0, hy: 0, tx: 0, ty: 0, ...over })
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

test('name pulls a dot to its letter position and only shimmers once there', () => {
  velocity('name', dot({ x: 0, y: 200, tx: 300, ty: 200 }), env, out)
  expect(out[0]).toBeGreaterThan(5)
  for (const t of [0, 500, 1300]) {
    velocity('name', dot({ x: 300, y: 200, tx: 300, ty: 200 }), { ...env, t }, out)
    expect(Math.hypot(out[0], out[1])).toBeLessThan(0.5)
  }
  expect(FLOWS.name).toBe(false)
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
  for (const mode of ['ring', 'core', 'grid', 'name'] as const) {
    velocity(mode, dot({ x: -5000, y: 9000, hx: 500, hy: 400, tx: 500, ty: 400 }), env, out)
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

/* ---- stream settles into the grid: each dot takes a nearby cell, so nothing flies across the screen ---- */
test('matchHomes uses every cell once and keeps travel far shorter than index order', () => {
  const homes = gridHomes(600, 1440, 900)
  let seed = 7
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const at = homes.map(() => ({ x: rnd() * 1440, y: rnd() * 900 }))
  const got = matchHomes(at, homes)
  expect(new Set(got.map((h) => h.join())).size).toBe(600)
  const travel = (hs: Array<[number, number]>) => hs.reduce((s, h, i) => s + Math.hypot(h[0] - at[i].x, h[1] - at[i].y), 0) / hs.length
  expect(travel(got)).toBeLessThan(travel(homes) / 4)
})
