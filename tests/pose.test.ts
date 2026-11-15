import { test, expect } from 'vitest'
import { POSE_KEYFRAMES, posePointAt } from '../src/hero/pose'

test('every keyframe has 33 normalized points', () => {
  expect(POSE_KEYFRAMES.length).toBeGreaterThanOrEqual(6)
  for (const f of POSE_KEYFRAMES) {
    expect(f.length).toBe(33)
    for (const [x, y] of f) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(1)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(1)
    }
  }
})

test('rep starts and ends standing, hips lowest mid-rep', () => {
  expect(POSE_KEYFRAMES[0]).toEqual(POSE_KEYFRAMES.at(-1))
  const hipY = (t: number) => posePointAt(POSE_KEYFRAMES, 23, t)[1]
  expect(hipY(0.5)).toBeGreaterThan(hipY(0)) // y grows downward
})

test('posePointAt interpolates and clamps t', () => {
  expect(posePointAt(POSE_KEYFRAMES, 0, 0)).toEqual(POSE_KEYFRAMES[0][0])
  expect(posePointAt(POSE_KEYFRAMES, 0, 1.7)).toEqual(POSE_KEYFRAMES.at(-1)![0])
})
