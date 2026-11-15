import { readFileSync } from 'node:fs'
import { test, expect } from 'vitest'

const html = readFileSync('index.html', 'utf8')

test('shell has the four sections, hero canvas and h1', () => {
  for (const id of ['projects', 'experience', 'about', 'contact', 'hero-canvas', 'hero-name', 'nav'])
    expect(html).toContain(`id="${id}"`)
})

test('no 404.html is shipped (keeps Pages SPA fallback)', () => {
  expect(() => readFileSync('public/404.html')).toThrow()
})
