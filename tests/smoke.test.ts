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

test('theme toggle exists and the saved theme is applied before first paint', () => {
  expect(html).toMatch(/<button[^>]*id="theme"/)
  const head = html.slice(0, html.indexOf('</head>'))
  expect(head).toContain('data-theme')
})

test('the résumé is not linked or shipped', () => {
  expect(html).not.toMatch(/resume|résumé/i)
  expect(() => readFileSync('public/resume.pdf')).toThrow()
})

test('no 404.html is shipped (keeps Pages SPA fallback)', () => {
  expect(() => readFileSync('public/404.html')).toThrow()
})
