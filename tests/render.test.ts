import { test, expect } from 'vitest'
import { renderProjects, renderExperience, renderAbout, renderFacts, renderContact, ext } from '../src/render'
import { projects, site } from '../src/content'

test('ext links open safely in a new tab', () => {
  expect(ext('https://x.y', 'X')).toContain('target="_blank" rel="noopener noreferrer"')
})

test('project with a url is a link row; without one it is a plain row', () => {
  const html = renderProjects([
    { name: 'A', line: 'a', stack: ['ts'], year: '2026', url: 'https://g' },
    { name: 'B', line: 'b', stack: [], year: '2025' },
  ])
  expect(html.match(/<a class="row/g)?.length).toBe(1)
  expect(html).toContain('<div class="row')
  expect(html).not.toContain('undefined')
})

test('only linked project rows show the outbound arrow', () => {
  const html = renderProjects([
    { name: 'A', line: 'a', stack: [], year: '2026', url: 'https://g' },
    { name: 'B', line: 'b', stack: [], year: '2025' },
  ])
  expect(html.match(/class="arrow"/g)?.length).toBe(1)
})

test('stand-in items get the standin class, real ones do not', () => {
  const html = renderProjects([
    { name: 'Real', line: 'r', stack: [], year: '2026' },
    { name: 'Slot', line: 's', stack: [], year: 'Year', standin: true },
  ])
  expect(html.match(/standin/g)?.length).toBe(1)
})

test('FormIQ is a normal project row, not a featured one', () => {
  const formiq = projects.find((p) => p.name === 'FormIQ')
  expect(formiq).toBeDefined()
  expect(formiq?.standin).toBeFalsy()
  expect(renderProjects(projects)).not.toMatch(/featured/)
})

test('role without url renders company as plain text', () => {
  const html = renderExperience([{ company: 'Co', role: 'R', start: '2025', end: 'now', bullets: ['b'] }])
  expect(html).toContain('Co')
  expect(html).not.toContain('<a ')
})

test('facts render as a definition list row per fact', () => {
  const html = renderFacts([
    { label: 'Based in', value: 'Austin' },
    { label: 'Looking for', value: 'Internship', standin: true },
  ])
  expect(html.match(/<dt>/g)?.length).toBe(2)
  expect(html).toContain('<div class="standin">')
})

test('about renders paragraphs and a year timeline', () => {
  const html = renderAbout({
    paragraphs: [{ text: 'Hi' }],
    timeline: [{ year: '2026', text: 'Now' }],
  })
  expect(html).toContain('<p>Hi</p>')
  expect(html).toContain('2026')
})

test('contact shows the email as text and a copy button', () => {
  const html = renderContact(site)
  expect(html).toContain(`id="email">${site.email}<`)
  expect(html).toContain('id="copy"')
  expect(html).not.toMatch(/resume|résumé/i)
})

test('user text is escaped', () => {
  expect(renderProjects([{ name: '<b>', line: '', stack: [], year: '' }])).toContain('&lt;b&gt;')
})
