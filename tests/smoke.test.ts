import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync('index.html', 'utf8')

test('shell has the nav, the name h1, the hero slots and the four sections', () => {
  for (const id of ['nav', 'name', 'lead', 'facts', 'projects', 'experience', 'about', 'contact'])
    expect(html).toContain(`id="${id}"`)
})

test('the name is real text in the HTML, so it reads without JS', () => {
  expect(html).toMatch(/<h1[^>]*id="name"[^>]*>[\s\S]*Ethan[\s\S]*Tran[\s\S]*<\/h1>/)
})

test('no canvas hero or eyebrow section numbers remain', () => {
  expect(html).not.toContain('<canvas')
  expect(html).not.toMatch(/0\d \/ /)
})

test('no 404.html is shipped (keeps Pages SPA fallback)', () => {
  expect(() => readFileSync('public/404.html')).toThrow()
})
