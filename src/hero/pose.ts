/**
 * 33 MediaPipe-ordered landmarks for a side-on barbell squat, normalized to
 * [0, 1] with y growing downward. Frames are generated from a squat depth
 * d ∈ [0, 1] so the silhouette stays consistent between frames.
 */
export type Pt = [number, number]

const DEG = Math.PI / 180
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))
const pt = (x: number, y: number): Pt => [clamp01(x), clamp01(y)]

function jointsAt(d: number): Pt[] {
  const ankle: Pt = [0.5, 0.92]
  const shank = 0.22
  const thigh = 0.24
  const torso = 0.3

  const aShank = d * 35 * DEG // shin tilts forward
  const aThigh = d * 85 * DEG // thigh folds back toward horizontal
  const aTorso = d * 40 * DEG // torso leans forward

  const knee: Pt = [ankle[0] + shank * Math.sin(aShank), ankle[1] - shank * Math.cos(aShank)]
  const hip: Pt = [knee[0] - thigh * Math.sin(aThigh), knee[1] - thigh * Math.cos(aThigh)]
  const shoulder: Pt = [hip[0] + torso * Math.sin(aTorso), hip[1] - torso * Math.cos(aTorso)]
  const nose: Pt = [
    shoulder[0] + 0.12 * Math.sin(aTorso) + 0.03,
    shoulder[1] - 0.12 * Math.cos(aTorso),
  ]
  // high-bar grip: elbows back and down, wrists just behind the shoulders
  const elbow: Pt = [shoulder[0] - 0.06, shoulder[1] + 0.1]
  const wrist: Pt = [shoulder[0] - 0.03, shoulder[1] - 0.01]

  const side = (p: Pt, dx: number, dy = 0): Pt => pt(p[0] + dx, p[1] + dy)
  const L = 0.012 // near-side joints sit a hair forward of far-side ones
  const R = -0.012

  const out: Pt[] = new Array(33)
  out[0] = pt(nose[0], nose[1])
  out[1] = side(nose, -0.015, -0.02)
  out[2] = side(nose, -0.025, -0.022)
  out[3] = side(nose, -0.035, -0.02)
  out[4] = side(nose, -0.02, -0.024)
  out[5] = side(nose, -0.03, -0.026)
  out[6] = side(nose, -0.04, -0.024)
  out[7] = side(nose, -0.055, -0.01)
  out[8] = side(nose, -0.06, -0.012)
  out[9] = side(nose, -0.005, 0.02)
  out[10] = side(nose, -0.015, 0.02)
  out[11] = side(shoulder, L)
  out[12] = side(shoulder, R)
  out[13] = side(elbow, L)
  out[14] = side(elbow, R)
  out[15] = side(wrist, L)
  out[16] = side(wrist, R)
  out[17] = side(wrist, L - 0.01, -0.015)
  out[18] = side(wrist, R - 0.01, -0.015)
  out[19] = side(wrist, L + 0.005, -0.02)
  out[20] = side(wrist, R + 0.005, -0.02)
  out[21] = side(wrist, L + 0.01, -0.005)
  out[22] = side(wrist, R + 0.01, -0.005)
  out[23] = side(hip, L)
  out[24] = side(hip, R)
  out[25] = side(knee, L)
  out[26] = side(knee, R)
  out[27] = side(ankle, L)
  out[28] = side(ankle, R)
  out[29] = side(ankle, L - 0.03, 0.03)
  out[30] = side(ankle, R - 0.03, 0.03)
  out[31] = side(ankle, L + 0.07, 0.04)
  out[32] = side(ankle, R + 0.07, 0.04)
  return out
}

const DEPTHS = [0, 0.35, 0.7, 1, 0.7, 0.35, 0]

export const POSE_KEYFRAMES: ReadonlyArray<ReadonlyArray<Pt>> = DEPTHS.map(jointsAt)

/** Landmark `i` at normalized time `t` (clamped to [0, 1]), linearly interpolated. */
export function posePointAt(frames: typeof POSE_KEYFRAMES, i: number, t: number): Pt {
  const n = frames.length - 1
  const seg = Math.min(1, Math.max(0, t)) * n
  const i0 = Math.min(n, Math.floor(seg))
  const i1 = Math.min(n, i0 + 1)
  const f = seg - i0
  const a = frames[i0][i]
  const b = frames[i1][i]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
}
