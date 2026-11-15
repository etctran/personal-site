import type { Project, Role, site as Site, about as About } from './content'

type SiteInfo = typeof Site
type AboutInfo = typeof About

const ENT: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ENT[c])

export const ext = (href: string, label: string): string =>
  `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`

const tags = (stack: string[]): string =>
  stack.length ? `<ul class="tags">${stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''

export function renderHeroCopy(s: SiteInfo): string {
  return `
    <p class="hero__title">${esc(s.title)}</p>
    <p class="hero__hook">${esc(s.hook)}</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="#projects">Projects</a>
      <a class="btn" href="${esc(s.resumeUrl)}">Resume</a>
      <a class="btn" href="mailto:${esc(s.email)}">Email</a>
    </div>`
}

export function renderProjects(list: Project[]): string {
  const cards = list.map((p) => {
    const links = [
      p.links.github ? ext(p.links.github, 'GitHub ↗') : '',
      p.links.live ? ext(p.links.live, 'Live ↗') : '',
    ].join('')
    return `
      <article class="card reveal${p.featured ? ' card--featured' : ''}">
        <h3>${esc(p.name)}</h3>
        <p class="card__tagline">${esc(p.tagline)}</p>
        <p class="card__hard">${esc(p.hard)}</p>
        ${tags(p.stack)}
        ${links ? `<div class="card__links">${links}</div>` : ''}
      </article>`
  })
  return `<div class="cards">${cards.join('')}</div>`
}

export function renderExperience(list: Role[]): string {
  const items = list.map((r) => {
    const company = r.url ? ext(r.url, r.company) : esc(r.company)
    return `
      <li class="timeline__item reveal">
        <span class="timeline__date">${esc(r.start)} — ${esc(r.end)}</span>
        <div class="timeline__body">
          <h3>${esc(r.role)} <span class="timeline__at">· ${company}</span></h3>
          <ul class="bullets">${r.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
          ${tags(r.stack)}
        </div>
      </li>`
  })
  return `<ol class="timeline"><span class="rail" aria-hidden="true"></span>${items.join('')}</ol>`
}

export function renderAbout(a: AboutInfo): string {
  const photo = a.photo
    ? `<img class="about__photo" src="${esc(a.photo)}" alt="Ethan Tran" width="320" height="320" loading="lazy" />`
    : ''
  return `
    <div class="about">
      <ol class="brief reveal">${a.timeline.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
      <div class="about__text reveal">
        ${a.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
        ${photo}
      </div>
    </div>`
}

export function renderContact(s: SiteInfo): string {
  return `
    <ul class="contact reveal">
      <li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li>
      <li>${ext(s.github, 'GitHub')}</li>
      <li>${ext(s.linkedin, 'LinkedIn')}</li>
      <li><a href="${esc(s.resumeUrl)}">Resume (PDF)</a></li>
    </ul>
    <p class="footer">© ${new Date().getFullYear()} ${esc(s.name)} · built by hand with Vite + anime.js</p>`
}
