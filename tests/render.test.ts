import { test, expect } from 'vitest'
import { renderProjects, renderExperience, renderAbout, ext } from '../src/render'
import { projects, experience, about } from '../src/content'

test('ext links open safely in a new tab', () => {
  expect(ext('https://x.y', 'X')).toContain('target="_blank" rel="noopener noreferrer"')
})

test('project without a live link renders no live anchor and no "undefined"', () => {
  const html = renderProjects([
    { name: 'A', tagline: 't', hard: 'h', stack: ['ts'], links: { github: 'https://g' } },
  ])
  expect(html).not.toContain('undefined')
  expect(html.match(/<a /g)?.length).toBe(1)
})

test('featured project gets the featured class', () => {
  expect(renderProjects([{ ...projects[0], featured: true }])).toContain('card--featured')
})

test('role without url renders company as plain text', () => {
  const html = renderExperience([
    { company: 'Co', role: 'R', start: '2025', end: 'Present', bullets: ['b'], stack: [] },
  ])
  expect(html).toContain('Co')
  expect(html).not.toContain('<a ')
})

test('about without photo renders no img', () => {
  expect(renderAbout({ ...about, photo: undefined })).not.toContain('<img')
})

test('FormIQ is the first, featured project with real copy', () => {
  expect(projects[0].name).toBe('FormIQ')
  expect(projects[0].featured).toBe(true)
  expect(projects[0].hard).not.toMatch(/TODO/)
})

test('user text is escaped', () => {
  expect(renderProjects([{ name: '<b>', tagline: '', hard: '', stack: [], links: {} }])).toContain(
    '&lt;b&gt;',
  )
})

test('experience items carry the reveal class for the motion pass', () => {
  expect(renderExperience(experience)).toContain('class="timeline__item reveal"')
})
