import { sectionBlend } from './blend'
import { velocity, gridHomes, FLOWS, type Dot, type Env, type Mode } from './modes'

const HUES = [6, 30, 50, 135, 190, 218]
const BG = '10,10,11'
const ALPHA: Record<Mode, number> = { ring: 0.95, wave: 0.75, stream: 0.85, grid: 1, core: 0.95 }
const WIDTH: Record<Mode, number> = { ring: 1.4, wave: 1.4, stream: 1.4, grid: 2.4, core: 1.4 }

export interface Field {
  /** Flood the whole field with one hue (a hovered project), or pass null to release it. */
  tint(hue: number | null): void
}

/**
 * The page's background: a few thousand coloured dots on a fixed canvas that
 * take a different formation for the hero and each section (`data-field`),
 * morphing as you scroll. They scatter from the pointer, a click sends a
 * shockwave through them, and `tint` floods them with one colour.
 * Reduced motion: one still ring, no loop.
 */
export function initField(canvas: HTMLCanvasElement): Field {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { tint() {} }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const sections = [...document.querySelectorAll<HTMLElement>('[data-field]')]
  const modes = sections.map((s) => s.dataset.field as Mode)
  const env: Env = { w: 0, h: 0, t: 0, cx: 0, cy: 0, R: 0, kx: 0, ky: 0, r2: 0 }
  const ptr = { x: -1e4, y: -1e4 }
  const a: [number, number] = [0, 0]
  const b: [number, number] = [0, 0]
  let tops: number[] = []
  let dots: Dot[] = []
  let alpha = ALPHA.ring
  let width = WIDTH.ring
  let tintHue: number | null = null
  let tintTo = 0
  let tintK = 0

  function measure(): void {
    tops = sections.map((s) => s.getBoundingClientRect().top + scrollY)
    if (tops.length) tops[0] = 0
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

    const n = Math.round(Math.min(2400, (w * h) / 560))
    const homes = gridHomes(n, w, h)
    if (dots.length !== n) {
      dots = homes.map(([hx, hy], i) => {
        const angle = (i / n) * Math.PI * 2
        // start on a wide ring off-screen; the first frames close it like an iris
        const x = env.cx + Math.cos(angle) * env.R * 3.2
        const y = env.cy + Math.sin(angle) * env.R * 3.2
        return {
          x, y, px: x, py: y, vx: 0, vy: 0,
          band: (Math.random() - 0.5) * Math.random() * env.R * 0.9,
          lane: Math.random(), s: 0.6 + Math.random() * 0.8, a: angle, hx, hy,
        }
      })
    } else {
      dots.forEach((d, i) => {
        d.hx = homes[i][0]
        d.hy = homes[i][1]
      })
    }
    ctx!.globalAlpha = 1
    ctx!.fillStyle = `rgb(${BG})`
    ctx!.fillRect(0, 0, w, h)
    measure()
  }

  function step(now: number): void {
    env.t = now
    const { from, to, t } = sectionBlend(tops, scrollY + env.h / 2, env.h * 0.5)
    const mA = modes[from] ?? 'ring'
    const mB = modes[to] ?? mA
    const flow = (FLOWS[mA] ? 1 - t : 0) + (FLOWS[mB] ? t : 0)
    alpha = ALPHA[mA] + (ALPHA[mB] - ALPHA[mA]) * t
    width = WIDTH[mA] + (WIDTH[mB] - WIDTH[mA]) * t
    for (const q of dots) {
      velocity(mA, q, env, a)
      let gx = a[0]
      let gy = a[1]
      if (t > 0) {
        velocity(mB, q, env, b)
        gx += (b[0] - gx) * t
        gy += (b[1] - gy) * t
      }
      q.vx += (gx - q.vx) * 0.08
      q.vy += (gy - q.vy) * 0.08
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
      if (flow > 0.5 && q.x > env.w + 8) {
        q.x = -8
        q.px = q.x
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
    for (const q of dots) {
      const r = env.R + q.band
      q.x = q.px = env.cx + Math.cos(q.a) * r
      q.y = q.py = env.cy + Math.sin(q.a) * r
    }
    draw(1)
  }

  function frame(now: number): void {
    step(now)
    draw(0.2)
    requestAnimationFrame(frame)
  }

  layout()
  addEventListener('resize', () => {
    layout()
    if (reduced) still()
  })
  new ResizeObserver(measure).observe(document.body)
  document.fonts?.ready.then(measure)

  if (reduced) {
    still()
    return { tint() {} }
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
  }
}
