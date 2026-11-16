/** One particle. `a` is its fixed angle slot on a ring, `o` its place in the queue (0..1) when a
 * formation changes, `hx/hy` its home cell in the grid, `tx/ty` its spot in the intro's name. */
export interface Dot {
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  band: number
  lane: number
  s: number
  a: number
  o: number
  hx: number
  hy: number
  tx: number
  ty: number
}

/** Viewport size, clock (ms) and where the big ring (c, R) and the small core (k, r2) sit. */
export interface Env {
  w: number
  h: number
  t: number
  cx: number
  cy: number
  R: number
  kx: number
  ky: number
  r2: number
}

export type Mode = 'ring' | 'wave' | 'stream' | 'grid' | 'core' | 'name'

/** Flow formations move dots off the right edge, so those get wrapped back to the left. */
export const FLOWS: Record<Mode, boolean> = { ring: false, wave: true, stream: true, grid: false, core: false, name: false }

export const MAX_SPEED = 16

function toward(q: Dot, tx: number, ty: number, k: number, out: [number, number]): void {
  let vx = (tx - q.x) * k
  let vy = (ty - q.y) * k
  const sp = Math.hypot(vx, vy)
  if (sp > MAX_SPEED) {
    vx *= MAX_SPEED / sp
    vy *= MAX_SPEED / sp
  }
  out[0] = vx
  out[1] = vy
}

/** The velocity formation `mode` wants for dot `q`, written into `out`. */
export function velocity(mode: Mode, q: Dot, e: Env, out: [number, number]): void {
  switch (mode) {
    case 'ring': {
      // every dot keeps its own slot on a slowly turning ring, so the colours stay in arcs
      const th = q.a + e.t * 0.0004
      const r = e.R + q.band + Math.sin(e.t * 0.001 * q.s + q.lane * 50) * 6
      return toward(q, e.cx + Math.cos(th) * r, e.cy + Math.sin(th) * r, 0.07, out)
    }
    case 'core': {
      const th = q.a + e.t * 0.0009
      const r = e.r2 + q.band * 0.45
      return toward(q, e.kx + Math.cos(th) * r, e.ky + Math.sin(th) * r, 0.07, out)
    }
    case 'grid':
      // a lattice that sways: slow waves roll through the rows and columns
      return toward(
        q,
        q.hx + Math.sin(e.t * 0.0016 + q.hy * 0.018) * 8,
        q.hy + Math.cos(e.t * 0.0013 + q.hx * 0.014) * 6,
        0.08,
        out,
      )
    case 'name':
      // the intro: every dot holds a point inside a letter, with a faint shimmer
      return toward(
        q,
        q.tx + Math.sin(e.t * 0.002 + q.ty * 0.03) * 2.5,
        q.ty + Math.cos(e.t * 0.0017 + q.tx * 0.02) * 2.5,
        0.08,
        out,
      )
    case 'stream': {
      // straight lanes, left to right: data through a pipeline
      const ly = (0.05 + q.lane * 0.9) * e.h
      out[0] = 2.4 * q.s + 1
      out[1] = (ly - q.y) * 0.03 + Math.sin(q.x * 0.008 + q.lane * 50) * 0.35
      return
    }
    case 'wave': {
      // three ribbons that rise and fall as they travel
      const r = Math.min(2, Math.floor(q.lane * 3))
      const off = (q.lane * 3 - r - 0.5) * 46
      const ty = e.h * (0.26 + 0.24 * r) + Math.sin(q.x * 0.0055 + e.t * 0.0007 + r * 2.1) * e.h * 0.085 + off
      out[0] = (1.1 + 0.45 * r) * q.s + 0.5
      out[1] = (ty - q.y) * 0.06
      return
    }
  }
}

/**
 * Warp: straight out from the middle of the screen, faster the farther out the
 * dot already is, which reads as flying forward through the dots.
 */
export function warpVelocity(q: Dot, e: Env, out: [number, number]): void {
  let dx = q.x - e.w / 2
  let dy = q.y - e.h / 2
  let d = Math.hypot(dx, dy)
  if (d < 1) {
    dx = Math.cos(q.a)
    dy = Math.sin(q.a)
    d = 1
  }
  const sp = Math.min(42, (1.5 + d * 0.055) * (0.7 + q.s * 0.5))
  out[0] = (dx / d) * sp
  out[1] = (dy / d) * sp
}

/** Home cells for `n` dots: an even lattice that fills a w×h viewport, in reading order. */
export function gridHomes(n: number, w: number, h: number): Array<[number, number]> {
  const cols = Math.max(1, Math.round(Math.sqrt((n * w) / h)))
  const rows = Math.ceil(n / cols)
  const sx = w / cols
  const sy = h / rows
  return Array.from({ length: n }, (_, i) => [((i % cols) + 0.5) * sx, (Math.floor(i / cols) + 0.5) * sy])
}
