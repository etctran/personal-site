import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync('index.html', 'utf8')

test('shell has the nav, the name h1, the hero slots and the four sections', () => {
  for (const id of ['nav', 'name', 'lead', 'facts', 'about', 'experience', 'projects', 'contact'])
    expect(html).toContain(`id="${id}"`)
})

test('sections come in the order About, Experience, Projects, Contact', () => {
  const at = (id: string) => html.indexOf(`<section id="${id}"`)
  expect(at('about')).toBeGreaterThan(-1)
  expect(at('about')).toBeLessThan(at('experience'))
  expect(at('experience')).toBeLessThan(at('projects'))
  expect(at('projects')).toBeLessThan(at('contact'))
})

test('the name is real text in the HTML, so it reads without JS', () => {
  expect(html).toMatch(/<h1[^>]*id="name"[^>]*>[\s\S]*Ethan[\s\S]*Tran[\s\S]*<\/h1>/)
})

test('the particle field is one decorative canvas, with a formation named for the hero and each section', () => {
  expect(html.match(/<canvas/g)?.length).toBe(1)
  expect(html).toMatch(/<canvas[^>]*id="field"[^>]*aria-hidden="true"/)
  expect(html.match(/data-field="(ring|wave|stream|grid|core)"/g)).toEqual([
    'data-field="ring"',
    'data-field="wave"',
    'data-field="stream"',
    'data-field="grid"',
    'data-field="core"',
  ])
})

test('no eyebrow section numbers, no theme toggle', () => {
  expect(html).not.toMatch(/0\d \/ /)
  expect(html).not.toContain('id="theme"')
})

test('the résumé is not linked or shipped', () => {
  expect(html).not.toMatch(/resume|résumé/i)
  expect(() => readFileSync('public/resume.pdf')).toThrow()
})

test('no 404.html is shipped (keeps the SPA fallback for tracking links)', () => {
  expect(() => readFileSync('public/404.html')).toThrow()
})
