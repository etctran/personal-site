import type { Fact, Project, Role, Standable, TimelineItem } from './content'

const ENT: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENT[c])
const cls = (base: string, standin?: boolean): string => (standin ? `${base} standin` : base)

export const ext = (href: string, label: string, className = ''): string =>
  `<a${className ? ` class="${className}"` : ''} href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`

export function renderFacts(facts: Fact[]): string {
  return facts
    .map((f) => `<div${f.standin ? ' class="standin"' : ''}><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
    .join('')
}

export function renderProjects(list: Project[]): string {
  return list
    .map((p) => {
      const inner = `<h3>${esc(p.name)}</h3><p>${esc(p.line)}</p><p class="stack">${esc(p.stack.join(' · '))}</p><p class="year data">${esc(p.year)}</p>${p.url ? '<span class="arrow" aria-hidden="true">↗</span>' : '<span></span>'}`
      return p.url
        ? `<a class="${cls('row', p.standin)}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : `<div class="${cls('row', p.standin)}">${inner}</div>`
    })
    .join('')
}

export function renderExperience(list: Role[]): string {
  return list
    .map((r) => {
      const company = r.url ? ext(r.url, r.company, 'link') : esc(r.company)
      return `<article class="${cls('exp', r.standin)}"><p class="data exp__date">${esc(r.start)} — ${esc(r.end)}</p><div><h3>${esc(r.role)} · ${company}</h3><ul>${r.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></article>`
    })
    .join('')
}

export function renderAbout(a: { paragraphs: Standable[]; timeline: TimelineItem[] }): string {
  const paras = a.paragraphs.map((p) => (p.standin ? `<p class="standin">${esc(p.text)}</p>` : `<p>${esc(p.text)}</p>`)).join('')
  const items = a.timeline
    .map((t) => `<li${t.standin ? ' class="standin"' : ''}><span class="data">${esc(t.year)}</span><span>${esc(t.text)}</span></li>`)
    .join('')
  return `<div class="about__text">${paras}</div><ol class="brief">${items}</ol>`
}

export function renderContact(s: { email: string; github: string; linkedin: string }): string {
  return `
    <div class="email">
      <span class="email__addr" id="email">${esc(s.email)}</span>
      <button class="btn" id="copy" type="button">Copy email</button>
    </div>
    <div class="close__links">
      ${ext(s.github, 'GitHub', 'link')}
      ${ext(s.linkedin, 'LinkedIn', 'link')}
    </div>`
}
