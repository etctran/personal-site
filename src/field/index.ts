import { sectionBlend, staggered, warpWeight } from './blend'
import { velocity, warpVelocity, gridHomes, FLOWS, type Dot, type Env, type Mode } from './modes'
import { GAP } from '../stack'
import { nameTargets } from './text'

const HUES = [6, 30, 50, 135, 190, 218]
const BG = '10,10,11'
const ALPHA: Record<Mode, number> = { ring: 0.95, wave: 0.75, stream: 0.85, grid: 1, core: 0.95, name: 1 }
const WIDTH: Record<Mode, number> = { ring: 1.4, wave: 1.4, stream: 1.4, grid: 2.4, core: 1.4, name: 3 }
const FAMILY = "Archivo, 'Helvetica Neue', Arial, sans-serif"

export interface FieldOptions {
  /** Start on the intro: the dots spell `lines` until `enter()` is called. */
  intro?: boolean
  lines?: string[]
}

export interface Field {
  /** Flood the whole field with one hue (a hovered project), or pass null to release it. */
  tint(hue: number | null): void
  /** Leave the intro: the name bursts apart and the dots take the hero's formation. */
  enter(): void
}

/**
 * The page's background: a few thousand coloured dots on a fixed canvas that
 * take a different formation for the hero and each section (`data-field`).
 * As you scroll, dots change formation one after another rather than all at
 * once, get dragged along by the scroll, and leave longer trails the faster
 * things move. They scatter from the pointer, a click sends a shockwave
 * through them, and `tint` floods them with one colour.
 * Reduced motion: one still ring, no loop.
 */
export function initField(canvas: HTMLCanvasElement, opts: FieldOptions = {}): Field {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { tint() {}, enter() {} }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const sections = [...document.querySelectorAll<HTMLElement>('[data-field]')]
  const modes = sections.map((s) => s.dataset.field as Mode)
  const lines = opts.lines ?? []
  const env: Env = { w: 0, h: 0, t: 0, cx: 0, cy: 0, R: 0, kx: 0, ky: 0, r2: 0 }
  const ptr = { x: -1e4, y: -1e4 }
  const a: [number, number] = [0, 0]
  const b: [number, number] = [0, 0]
  const c: [number, number] = [0, 0]
  let intro = Boolean(opts.intro) && !reduced && lines.length > 0
  let fontReady = !document.fonts // spell the name once, in the real typeface, not twice
  let arrivals: number[] = [] // scroll position at which each section's formation is fully in
  let zones: number[] = [] // how much scroll before that the change takes
  let dots: Dot[] = []
  let alpha = ALPHA.ring
  let width = WIDTH.ring
  let energy = 0 // 0..1: how much is changing right now; stretches the trails
  let boost = 0 // extra energy right after the intro bursts
  let lastY = scrollY
  let push = 0 // smoothed scroll speed, px per frame
  let tintHue: number | null = null
  let tintTo = 0
  let tintK = 0

  function measure(): void {
    const h = innerHeight
    const tops = sections.map((s) => s.getBoundingClientRect().top + scrollY)
    // The first section is in once its top reaches the middle of the screen.
    // Later ones follow a pinned card: they are in by the time their own top
    // reaches the bottom of the screen, so the change plays out in the open
    // gap while the card before them falls back.
    arrivals = tops.map((top, j) => (j === 0 ? 0 : j === 1 ? top - h / 2 : top - h))
    zones = arrivals.map((at, j) => (j === 0 ? 0 : Math.max(1, Math.min(h * GAP, at - arrivals[j - 1]))))
  }

  function spell(): void {
    if (!intro || !fontReady) return
    const targets = nameTargets(lines, env.w, env.h, dots.length, FAMILY)
    if (targets.length !== dots.length) return
    dots.forEach((d, i) => {
      d.tx = targets[i][0]
      d.ty = targets[i][1]
    })
  }

  function layout(): void {
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const w = innerWidth
    const h = innerHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    const wide = w >= 900
    env.w = w
    env.h = h
    env.cx = wide ? w * 0.7 : w * 0.5
    env.cy = wide ? h * 0.5 : h * 0.3
    env.R = wide ? Math.min(w * 0.2, h * 0.34) : Math.min(w * 0.36, h * 0.2)
    env.kx = wide ? w * 0.8 : w * 0.5
    env.ky = wide ? h * 0.46 : h * 0.74
    env.r2 = Math.min(w, h) * (wide ? 0.15 : 0.2)

    const n = Math.round(Math.min(2400, Math.max(1000, (w * h) / 560)))
    const homes = gridHomes(n, w, h)
    if (dots.length !== n) {
      dots = homes.map(([hx, hy], i) => {
        const angle = (i / n) * Math.PI * 2
        // intro: drift in from all over the screen. No intro: start on a wide
        // ring off-screen, which the first frames close like an iris.
        const x = intro ? (Math.random() * 1.2 - 0.1) * w : env.cx + Math.cos(angle) * env.R * 3.2
        const y = intro ? (Math.random() * 1.2 - 0.1) * h : env.cy + Math.sin(angle) * env.R * 3.2
        return {
          x, y, px: x, py: y, vx: 0, vy: 0,
          band: (Math.random() - 0.5) * Math.random() * env.R * 0.9,
          lane: Math.random(), s: 0.6 + Math.random() * 0.8, a: angle, o: i / n,
          hx, hy, tx: x, ty: y, // until the name is spelled, hover where you are
        }
      })
    } else {
      dots.forEach((d, i) => {
        d.hx = homes[i][0]
        d.hy = homes[i][1]
      })
    }
    spell()
    ctx!.globalAlpha = 1
    ctx!.fillStyle = `rgb(${BG})`
    ctx!.fillRect(0, 0, w, h)
    measure()
  }

  function move(q: Dot, gx: number, gy: number, wrap: boolean): void {
    q.vx += (gx - q.vx) * 0.08
    q.vy += (gy - q.vy) * 0.08 - push * 0.03 * q.s // the scroll drags dots along with the page
    const mx = q.x - ptr.x
    const my = q.y - ptr.y
    const md = Math.hypot(mx, my)
    if (md < 130 && md > 0) {
      const f = (1 - md / 130) * 2.8
      q.vx += (mx / md) * f
      q.vy += (my / md) * f
    }
    q.px = q.x
    q.py = q.y
    q.x += q.vx
    q.y += q.vy
    if (wrap && q.x > env.w + 8) {
      q.x = -8
      q.px = q.x
    }
  }

  function step(now: number): void {
    env.t = now
    const dy = scrollY - lastY
    lastY = scrollY
    push += (Math.max(-60, Math.min(60, dy)) - push) * 0.3
    boost *= 0.965

    if (intro) {
      alpha = ALPHA.name
      width = env.w < 900 ? 2 : WIDTH.name // finer dots on a phone, where they sit closer together
      energy = 0
      for (const q of dots) {
        velocity('name', q, env, a)
        move(q, a[0], a[1], false)
      }
      return
    }

    const { from, to, t } = sectionBlend(arrivals, scrollY, zones)
    // between cards the dots rush outward mid-change, like flying forward; leaving the hero they just unwind
    const wv = to >= 2 ? warpWeight(t) : 0
    const mA = modes[from] ?? 'ring'
    const mB = modes[to] ?? mA
    const fA = FLOWS[mA]
    const fB = FLOWS[mB]
    alpha = ALPHA[mA] + (ALPHA[mB] - ALPHA[mA]) * t
    width = WIDTH[mA] + (WIDTH[mB] - WIDTH[mA]) * t
    energy = Math.max(4 * t * (1 - t), Math.min(1, Math.abs(push) / 28), boost)
    for (const q of dots) {
      velocity(mA, q, env, a)
      let gx = a[0]
      let gy = a[1]
      let ti = 0
      if (t > 0) {
        // dots peel off one after another: by colour around a ring, by lane into a flow
        ti = staggered(t, fB ? q.lane : q.o)
        if (ti > 0) {
          velocity(mB, q, env, b)
          gx += (b[0] - gx) * ti
          gy += (b[1] - gy) * ti
        }
      }
      if (wv > 0) {
        warpVelocity(q, env, c)
        gx += (c[0] - gx) * wv
        gy += (c[1] - gy) * wv
      }
      move(q, gx, gy, (fA ? 1 - ti : 0) + (fB ? ti : 0) > 0.5)
      // a dot that has flown off the screen comes back in from the middle
      if (wv > 0.25 && (q.x < -24 || q.x > env.w + 24 || q.y < -24 || q.y > env.h + 24)) {
        const ang = Math.random() * Math.PI * 2
        const rad = 6 + Math.random() * 50
        q.x = q.px = env.w / 2 + Math.cos(ang) * rad
        q.y = q.py = env.h / 2 + Math.sin(ang) * rad
        q.vx = q.vy = 0
      }
    }
  }

  function draw(fade: number): void {
    tintK += ((tintHue === null ? 0 : 1) - tintK) * 0.09
    ctx!.globalAlpha = 1
    ctx!.fillStyle = `rgba(${BG},${fade})`
    ctx!.fillRect(0, 0, env.w, env.h)
    ctx!.lineWidth = width
    ctx!.lineCap = 'round'
    ctx!.globalAlpha = alpha
    const n = dots.length
    let i = 0
    for (let k = 0; k < HUES.length; k++) {
      const hue = HUES[k] + (tintTo - HUES[k]) * tintK * 0.9
      ctx!.strokeStyle = `hsl(${hue.toFixed(1)} 100% 62%)`
      ctx!.beginPath()
      const end = Math.round(((k + 1) / HUES.length) * n)
      for (; i < end; i++) {
        const q = dots[i]
        ctx!.moveTo(q.px, q.py)
        ctx!.lineTo(q.x, q.y)
      }
      ctx!.stroke()
    }
  }

  function still(): void {
    // reduced motion: put every dot on its ring slot and draw once
    env.t = 0
    alpha = ALPHA.ring
    width = WIDTH.ring
    for (const q of dots) {
      const r = env.R + q.band
      q.x = q.px = env.cx + Math.cos(q.a) * r
      q.y = q.py = env.cy + Math.sin(q.a) * r
    }
    draw(1)
  }

  function frame(now: number): void {
    step(now)
    draw(0.2 - 0.11 * energy) // the more that is changing, the longer the trails
    requestAnimationFrame(frame)
  }

  layout()
  addEventListener('resize', () => {
    layout()
    if (reduced) still()
  })
  new ResizeObserver(measure).observe(document.body)
  const fontsIn = (): void => {
    if (fontReady) return
    fontReady = true
    measure()
    spell()
  }
  document.fonts?.ready.then(() => {
    measure()
    fontsIn()
  })
  setTimeout(fontsIn, 1200) // a slow font should not hold the intro back

  if (reduced) {
    still()
    return { tint() {}, enter() {} }
  }

  addEventListener('pointermove', (e) => {
    ptr.x = e.clientX
    ptr.y = e.clientY
  })
  document.addEventListener('pointerleave', () => {
    ptr.x = ptr.y = -1e4
  })
  addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') ptr.x = ptr.y = -1e4
  })
  // a click or tap anywhere sends a shockwave through the field
  addEventListener('pointerdown', (e) => {
    for (const q of dots) {
      const dx = q.x - e.clientX
      const dy = q.y - e.clientY
      const d = Math.hypot(dx, dy)
      if (d < 260 && d > 0) {
        const f = (1 - d / 260) * 11
        q.vx += (dx / d) * f
        q.vy += (dy / d) * f
      }
    }
  })
  requestAnimationFrame(frame)

  return {
    tint(hue) {
      tintHue = hue
      if (hue !== null) tintTo = hue
    },
    enter() {
      if (!intro) return
      intro = false
      boost = 1
      // the name bursts outward from the middle, then the hero's ring gathers the dots
      for (const q of dots) {
        const dx = q.x - env.w / 2
        const dy = q.y - env.h * 0.46
        const d = Math.hypot(dx, dy) || 1
        const sp = 8 + Math.random() * 14
        q.vx += (dx / d) * sp
        q.vy += (dy / d) * sp
      }
    },
  }
}
