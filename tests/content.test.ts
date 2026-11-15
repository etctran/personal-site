import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'
import { site, projects, experience, about } from '../src/content'

const all = JSON.stringify({ site, projects, experience, about })

test('the hero facts drop "Looking for" and "Hackathons"', () => {
  const labels = site.facts.map((f) => f.label)
  expect(labels).not.toContain('Looking for')
  expect(labels).not.toContain('Hackathons')
})

test('the TA scheduler is mentioned nowhere', () => {
  expect(all).not.toMatch(/scheduler|shifts and swaps|office-hours scheduler/i)
  expect(projects.map((p) => p.name)).not.toContain('TA scheduler')
})

test('projects are ClutchWatch, FormIQ and GraphSense, newest first, each linked', () => {
  expect(projects.map((p) => p.name)).toEqual(['ClutchWatch', 'FormIQ', 'GraphSense'])
  for (const p of projects) expect(p.url).toMatch(/^https:\/\/github\.com\//)
})

test('about has no timeline', () => {
  expect('timeline' in about).toBe(false)
})

/* scroll effects live in their own sheet, behind both guards */
const scroll = readFileSync('src/styles/scroll.css', 'utf8')
const siteCss = readFileSync('src/styles/site.css', 'utf8')

test('scroll-driven rules only run with motion allowed and browser support', () => {
  expect(scroll.trimStart()).toMatch(/^(\/\*[\s\S]*?\*\/\s*)?@media \(prefers-reduced-motion: no-preference\)/)
  expect(scroll).toContain('@supports (animation-timeline: view())')
  expect(siteCss).not.toContain('animation-timeline')
})

test('every scroll animation keeps content visible at both ends (no opacity: 0)', () => {
  expect(scroll).not.toMatch(/opacity:\s*0(?![.\d])/)
})
